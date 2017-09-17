CREATE OR REPLACE FUNCTION GetStats
(name VARCHAR(70), year int,
statToGet VARCHAR(15),
year2 int default -1,
seasonType season_phase default 'Regular',
week1 INT default -1,
week2 INT default -2,
teamID varchar(4) default '')
RETURNS REAL AS
$BODY$
DECLARE
  returnInt real;  -- For sacks, can have .5
  teamSQL varchar(50) := '';
  yearSQL varchar(50) := '';

BEGIN

IF teamID <> ''
THEN
    teamSQL := format(' AND (home_team=''%s'' or away_team=''%s'')', teamID, teamID);
END IF;

IF year2 > 0
THEN
    yearSQL := format(' season_year>= %s AND season_year <= %s ', year, year2);
ELSE
    yearSQL := format(' season_year=%s ', year);
END IF;


IF week1 < 0 AND week2 < 0
THEN
    EXECUTE
    format('SELECT SUM(' || statToGet ||') FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s''' || teamSQL || ') AND player_id in (SELECT player_id FROM player WHERE full_name=$1)', yearSQL, seasonType)
    into returnInt
    USING name;

ELSIF week1 > 0 AND week2 < 0
THEN
    EXECUTE
    format('SELECT SUM(' || statToGet ||') FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s'' AND week=%s'|| teamSQL ||') AND player_id in (SELECT player_id FROM player WHERE full_name=$1)', yearSQL, seasonType, week1)
    into returnInt
    USING name;
ELSE
    EXECUTE
    format('SELECT SUM(' || statToGet ||') FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s'' AND week>=%s AND week<=%s '|| teamSQL ||') AND player_id in (SELECT player_id FROM player WHERE full_name=$1)', yearSQL, seasonType, week1, week2)
    into returnInt
    USING name;
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
--    AND player_id in (SELECT player_id FROM player WHERE full_name='Tom Brady') AND team='ARI';

--SELECT SUM(passing_yds) FROM play_player
--    WHERE gsis_id IN
--    (SELECT gsis_id FROM game WHERE season_year=2015 and season_type='Regular' AND week>=1 AND week<=17 and home_team=ARI OR away_team=ARI)
--    AND player_id in (SELECT player_id FROM player WHERE full_name='Tom Brady');