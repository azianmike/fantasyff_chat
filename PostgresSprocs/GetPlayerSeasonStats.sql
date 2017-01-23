CREATE OR REPLACE FUNCTION GetPlayerSeasonStats(name VARCHAR(70), year INT)
RETURNS INT AS $$ LANGUAGE plpgsql
BEGIN
	RETURN SELECT SUM(passing_yds) FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE season_year=2014 AND season_type='Regular') AND
player_id in (SELECT player_id FROM player WHERE full_name='Tom Brady');

END 

$$;
