CREATE OR REPLACE FUNCTION GetPlayerPassingSeasonStats(name VARCHAR(70), year INT)
RETURNS INT AS
$BODY$
DECLARE
  returnInt int;

BEGIN
        SELECT SUM(passing_yds) into returnInt FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE season_year=year and season_type='Regular')
        AND player_id in (SELECT player_id FROM player WHERE full_name=name);
RETURN returnInt;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 2;