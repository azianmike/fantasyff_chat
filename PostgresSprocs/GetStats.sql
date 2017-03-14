CREATE OR REPLACE FUNCTION GetStats
(name VARCHAR(70), year int,
statToGet VARCHAR(15), seasonType season_phase default 'Regular',
week1 INT default -1,
week2 INT default -2,
teamID varchar(4) default '')
RETURNS INT AS
$BODY$
DECLARE
  returnInt int;
  teamSQL varchar(50) := '';

BEGIN

IF teamID <> ''
THEN
    teamSQL := format(' AND (home_team=''%s'' or away_team=''%s'')', teamID, teamID);
END IF;

IF week1 = -1 AND week2 < 0
THEN
    EXECUTE
    'SELECT SUM(' || statToGet ||') FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE season_year=$1 and season_type=$2' || teamSQL || ') AND player_id in (SELECT player_id FROM player WHERE full_name=$3)'
    into returnInt
    USING year, seasonType, name;

ELSIF week1 > 0 AND week2 < 0
THEN
    EXECUTE
    'SELECT SUM(' || statToGet ||') FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE season_year=$1 and season_type=$2 AND week=$3'|| teamSQL ||') AND player_id in (SELECT player_id FROM player WHERE full_name=$4)'
    into returnInt
    USING year, seasonType, week1, name;
ELSE
    EXECUTE
    'SELECT SUM(' || statToGet ||') FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE season_year=$1 and season_type=$2 AND week>=$3 AND week<=$4 '|| teamSQL ||') AND player_id in (SELECT player_id FROM player WHERE full_name=$5)'
    into returnInt
    USING year, seasonType, week1, week2, name;
END IF;

RETURN returnInt;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 2;


--SELECT GetStats('Tom Brady', 2016, 'passing_yds');

--SELECT SUM(passing_yds) FROM play_player
--    WHERE gsis_id IN
--    (SELECT gsis_id FROM game WHERE season_year=2015 and season_type='Regular' AND week>=1 AND week<=17)
--    AND player_id in (SELECT player_id FROM player WHERE full_name='Tom Brady') AND team='ARI'

--SELECT SUM(passing_yds) FROM play_player
--    WHERE gsis_id IN
--    (SELECT gsis_id FROM game WHERE season_year=2015 and season_type='Regular' AND week>=1 AND week<=17 and home_team=ARI OR away_team=ARI)
--    AND player_id in (SELECT player_id FROM player WHERE full_name='Tom Brady');