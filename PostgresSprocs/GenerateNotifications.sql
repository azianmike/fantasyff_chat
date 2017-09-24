CREATE OR REPLACE FUNCTION GenerateNotifications()
RETURNS void
as
$BODY$

DECLARE lastPlayID int;

BEGIN
    DROP TABLE IF EXISTS playersToCheck, notifToSend;

    CREATE TEMP TABLE playersToCheck AS
    SELECT MAX(lastProcessedPlayID) as lastProcessedPlayID, MAX(lastProcessedGsisID) as lastProcessedGsisID, player_id
    FROM playerSubscription GROUP BY player_id;

--    CREATE TEMP TABLE nullProcessedPlays AS
--    SELECT MAX(play_id) AS playID, MAX(gsis_id) AS gsisID
--    FROM play_player AS pp INNER JOIN playersToCheck
--    on pp.player_id = playersToCheck.player_id
--    GROUP BY pp.player_id;

    -- Update the lastProcessedPlayID as the play right before the first play in the game (if exists)
    UPDATE playersToCheck as ptc
    SET lastProcessedGsisID = (SELECT MAX(gsis_id) FROM play_player as pp where ptc.player_id=pp.player_id),
    lastProcessedPlayID = (SELECT MAX(play_id) FROM play_player as pp where ptc.player_id=pp.player_id and gsis_id = (SELECT MAX(gsis_id) FROM play_player as pp where ptc.player_id=pp.player_id))
    WHERE ptc.lastProcessedGsisID IS NULL or ptc.lastProcessedPlayID IS NULL;


    CREATE TEMP TABLE notifToSend AS
    SELECT SUM(passing_yds) as passing_yards,
    (SUM(passing_tds) + SUM(rushing_tds) + SUM(receiving_tds) +  SUM(puntret_tds) + SUM(kickret_tds)) as touchdowns,
    (SUM(rushing_yds) + SUM(receiving_yds)) as yards,
    ptc.player_id
    FROM play_player AS pp INNER JOIN playersToCheck as ptc
     ON pp.player_id = ptc.player_id
     WHERE pp.gsis_id >= ptc.lastProcessedGsisID AND pp.play_id > ptc.lastProcessedPlayID GROUP BY ptc.player_id;

    INSERT INTO notificationToSend
    (messengerSenderIDsToSend,
    player_id,
    touchdowns,
    yards,
    passing_yards)
    SELECT m.messengerSenderID,
    notifToSend.player_id,
    notifToSend.touchdowns,
    notifToSend.yards,
    notifToSend.passing_yards
    FROM notifToSend
    INNER JOIN playerSubscription AS ps
    ON notifToSend.player_id = ps.player_id
    INNER JOIN messengerUser AS m
    ON ps.userID = m.userID
    WHERE notifToSend.touchdowns > 1;

    UPDATE playersToCheck as ptc
    SET lastProcessedGsisID = (SELECT MAX(gsis_id) FROM play_player as pp where ptc.player_id=pp.player_id),
    lastProcessedPlayID = (SELECT MAX(play_id) FROM play_player as pp where ptc.player_id=pp.player_id and gsis_id = (SELECT MAX(gsis_id) FROM play_player as pp where ptc.player_id=pp.player_id));

    UPDATE playerSubscription as ps
    SET lastProcessedPlayID = ptc.lastProcessedPlayID,
    lastProcessedGsisID = ptc.lastProcessedGsisID
    FROM playersToCheck as ptc
    WHERE ptc.player_id = ps.player_id;

    DROP TABLE playersToCheck, notifToSend;
END
$BODY$
LANGUAGE plpgsql;