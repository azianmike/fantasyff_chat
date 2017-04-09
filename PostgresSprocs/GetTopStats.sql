CREATE OR REPLACE FUNCTION GetTopStats
(year int,
statToGet VARCHAR(15),
year2 int default -1,
seasonType season_phase default 'Regular',
week1 INT default -1,
week2 INT default -2,
num_limit int default 1)
RETURNS TABLE (player_name varchar, sum_of_stat real) as
$BODY$
DECLARE
  returnInt real;  -- For sacks, can have .5
  yearSQL varchar(50) := '';

BEGIN

    IF year2 > 0
    THEN
        yearSQL := format(' season_year>= %s AND season_year <= %s ', year, year2);
    ELSE
        yearSQL := format(' season_year=%s ', year);
    END IF;

    IF week1 < 0 AND week2 < 0 -- No week given
    THEN
        raise notice 'select player_id, count(gsis_id), count(drive_id), count(play_id), sum(%) FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE % and season_type=%) GROUP BY player_id ORDER BY sum(%) DESC limit %', statToGet, yearSQL, seasonType, statToGet, num_limit;

        RETURN QUERY
        EXECUTE
        format('select player.full_name, CAST(result.sum_result as real) from (select player_id, count(gsis_id), count(drive_id), count(play_id), sum(' || statToGet ||') as sum_result FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s'') GROUP BY player_id ORDER BY sum('|| statToGet ||') DESC limit %s) as result left join player on result.player_id=player.player_id', yearSQL, seasonType, num_limit);

    ELSIF week1 > 0 AND week2 < 0
    THEN
        RETURN QUERY
        EXECUTE
        format('select player.full_name, CAST(result.sum_result as real) from (select player_id, count(gsis_id), count(drive_id), count(play_id), sum(' || statToGet ||') as sum_result FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s'' AND week=%s) GROUP BY player_id ORDER BY sum('|| statToGet ||') DESC limit %s) as result left join player on result.player_id=player.player_id', yearSQL, seasonType, week1, num_limit);
    ELSE
        RETURN QUERY
        EXECUTE
        format('select player.full_name, CAST(result.sum_result as real) from (select player_id, count(gsis_id), count(drive_id), count(play_id), sum(' || statToGet ||') as sum_result FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s'' AND (week>=%s AND week<=%s)) GROUP BY player_id ORDER BY sum('|| statToGet ||') DESC limit %s) as result left join player on result.player_id=player.player_id', yearSQL, seasonType, week1, week2, num_limit);

    END IF;



END;
$BODY$
LANGUAGE plpgsql STABLE
COST 2;


--        select player_id, gsis_id, count(drive_id), count(play_id), sum(passing_yds)
--        from play_player
--        WHERE player_id=(select player_id from player where full_name='Tom Brady') GROUP BY player_id, gsis_id  ORDER BY sum(passing_yds) DESC limit 5;


--Select * from GetTopStats(2015, 'passing_yds');
--Select * from GetTopStats(2015, 'passing_yds');
--Select * from GetTopStats(2015, 'passing_yds+rushing_yds', -1, 'Regular', 1, 3, 4);