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

    -- Update the last processes GSIS and playID if null to latest play and game
    UPDATE playersToCheck as ptc
    SET lastProcessedGsisID = (SELECT MAX(gsis_id) FROM play_player as pp where ptc.player_id=pp.player_id),
    lastProcessedPlayID = (SELECT MAX(play_id) FROM play_player as pp where ptc.player_id=pp.player_id and gsis_id = (SELECT MAX(gsis_id) FROM play_player as pp where ptc.player_id=pp.player_id))
    WHERE ptc.lastProcessedGsisID IS NULL or ptc.lastProcessedPlayID IS NULL;


    CREATE TEMP TABLE notifToSend AS
    SELECT SUM(passing_yds) as passing_yards,
    (SUM(passing_tds) + SUM(rushing_tds) + SUM(receiving_tds) +  SUM(puntret_tds) + SUM(kickret_tds)) as touchdowns,
    (SUM(rushing_yds) + SUM(receiving_yds)) as yards,
    ptc.player_id,
    MAX(pp.gsis_id) as lastProcessedGsisID
    FROM play_player AS pp INNER JOIN playersToCheck as ptc
     ON pp.player_id = ptc.player_id
     WHERE
     ((pp.gsis_id = ptc.lastProcessedGsisID AND pp.play_id > ptc.lastProcessedPlayID) OR (pp.gsis_id > ptc.lastProcessedGsisID))
     AND
     (pp.passing_tds >= 1 OR pp.rushing_tds >= 1 OR pp.receiving_tds >= 1 OR pp.puntret_tds >= 1 OR pp.kickret_tds >= 1)
      GROUP BY ptc.player_id;

    -- Get whole game stats
    UPDATE notifToSend
    SET passing_yards = (SELECT SUM(passing_yds) FROM play_player as pp WHERE notifToSend.lastProcessedGsisID = pp.gsis_id AND pp.player_id = notifToSend.player_id),
        touchdowns = (SELECT SUM(passing_tds) + SUM(rushing_tds) + SUM(receiving_tds) +  SUM(puntret_tds) + SUM(kickret_tds) FROM play_player as pp WHERE notifToSend.lastProcessedGsisID = pp.gsis_id AND pp.player_id = notifToSend.player_id),
        yards = (SELECT SUM(rushing_yds) + SUM(receiving_yds) FROM play_player as pp WHERE notifToSend.lastProcessedGsisID = pp.gsis_id AND pp.player_id = notifToSend.player_id);


    INSERT INTO notificationToSend
    (messengerSenderIDsToSend,
    player_id,
    playerName,
    touchdowns,
    yards,
    passing_yards)
    SELECT m.messengerSenderID,
    notifToSend.player_id,
    p.full_name,
    notifToSend.touchdowns,
    notifToSend.yards,
    notifToSend.passing_yards
    FROM notifToSend
    INNER JOIN playerSubscription AS ps
    ON notifToSend.player_id = ps.player_id
    INNER JOIN messengerUser AS m
    ON ps.userID = m.userID
    INNER JOIN player as p
    ON p.player_id = notifToSend.player_id
    WHERE notifToSend.touchdowns >= 1;

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