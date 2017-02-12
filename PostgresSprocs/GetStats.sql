CREATE OR REPLACE FUNCTION GetStats
(name VARCHAR(70), year int,
statToGet VARCHAR(15), seasonType season_phase default 'Regular',
week1 INT default -1,
week2 INT default -2)
RETURNS INT AS
$BODY$
DECLARE
  returnInt int;

BEGIN

IF week1 = -1 AND week2 = -2
THEN
    EXECUTE
    format('SELECT SUM(%I) FROM play_player
    WHERE gsis_id IN
    (SELECT gsis_id FROM game WHERE season_year=$1 and season_type=$2)
    AND player_id in (SELECT player_id FROM player WHERE full_name=$3)',
    statToGet)
    into returnInt
    USING year, seasonType, name;
ELSIF week1 > 0 AND week2 = -2
THEN
    EXECUTE
    format('SELECT SUM(%I) FROM play_player
    WHERE gsis_id IN
    (SELECT gsis_id FROM game WHERE season_year=$1 and season_type=$2 AND week=$3)
    AND player_id in (SELECT player_id FROM player WHERE full_name=$4)',
    statToGet)
    into returnInt
    USING year, seasonType, week1, name;
ELSE
    EXECUTE
    format('SELECT SUM(%I) FROM play_player
    WHERE gsis_id IN
    (SELECT gsis_id FROM game WHERE season_year=$1 and season_type=$2 AND week>=$3 AND week<=$4)
    AND player_id in (SELECT player_id FROM player WHERE full_name=$5)',
    statToGet)
    into returnInt
    USING year, seasonType, week1, week2, name;
END IF;

RETURN returnInt;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 2;


--SELECT GetStats('Tom Brady', 2016, 'passing_yds');