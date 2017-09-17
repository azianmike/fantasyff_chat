CREATE OR REPLACE FUNCTION GetStandardFantasyPoints
(name VARCHAR(70), year int,
year2 int default -1,
seasonType season_phase default 'Regular',
week1 INT default -1,
week2 INT default -2,
teamID varchar(4) default '')
RETURNS REAL AS
$BODY$
DECLARE
  returnFantasyPts real;  -- For sacks, can have .5
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
        format('SELECT SUM(passing_yds)*.04 + SUM(passing_tds)*4 + SUM(passing_twoptm)*2 +'||
                       'SUM(passing_int)*-2 + SUM(rushing_tds)*6 + SUM(rushing_yds)*.1 +' ||
                       'SUM(rushing_twoptm)*2 + SUM(receiving_tds)*6 + SUM(receiving_yds)*.1 +' ||
                       'SUM(receiving_twoptm)*2 + SUM(kickret_tds)*6 + SUM(puntret_tds)*6 +' ||
                       'SUM(fumbles_lost)*-2 + SUM(kicking_fgm)*3 + SUM(kicking_xpmade)*1 '||
                       'FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s''' || teamSQL || ') AND player_id in (SELECT player_id FROM player WHERE full_name=$1)', yearSQL, seasonType)
        into returnFantasyPts
        USING name;

    ELSIF week1 > 0 AND week2 < 0
    THEN
        EXECUTE
        format('SELECT SUM(passing_yds)*.04 + SUM(passing_tds)*4 + SUM(passing_twoptm)*2 +'||
                      'SUM(passing_int)*-2 + SUM(rushing_tds)*6 + SUM(rushing_yds)*.1 +' ||
                      'SUM(rushing_twoptm)*2 + SUM(receiving_tds)*6 + SUM(receiving_yds)*.1 +' ||
                      'SUM(receiving_twoptm)*2 + SUM(kickret_tds)*6 + SUM(puntret_tds)*6 +' ||
                      'SUM(fumbles_lost)*-2 + SUM(kicking_fgm)*3 + SUM(kicking_xpmade)*1 '||
                      'FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s'' AND week=%s'|| teamSQL ||') AND player_id in (SELECT player_id FROM player WHERE full_name=$1)', yearSQL, seasonType, week1)
        into returnFantasyPts
        USING name;
    ELSE
        EXECUTE
        format('SELECT SUM(passing_yds)*.04 + SUM(passing_tds)*4 + SUM(passing_twoptm)*2 +'||
                      'SUM(passing_int)*-2 + SUM(rushing_tds)*6 + SUM(rushing_yds)*.1 +' ||
                      'SUM(rushing_twoptm)*2 + SUM(receiving_tds)*6 + SUM(receiving_yds)*.1 +' ||
                      'SUM(receiving_twoptm)*2 + SUM(kickret_tds)*6 + SUM(puntret_tds)*6 +' ||
                      'SUM(fumbles_lost)*-2 + SUM(kicking_fgm)*3 + SUM(kicking_xpmade)*1 '||
                      'FROM play_player WHERE gsis_id IN (SELECT gsis_id FROM game WHERE %s and season_type=''%s'' AND week>=%s AND week<=%s '|| teamSQL ||') AND player_id in (SELECT player_id FROM player WHERE full_name=$1)', yearSQL, seasonType, week1, week2)
        into returnFantasyPts
        USING name;
    END IF;

    RETURN returnFantasyPts;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 2;





--standard scoring
--passing_yds = .04
--passing_tds = 4
--passing_twoptm = 2 (passing two point attempts made)
--passing_int = -2
--
--rushing_tds = 6
--rushing_yds = .1
--rushing_twoptm = 2 (rushing two point attempts made)
--
--receiving_tds = 6
--receiving_yds = 0.1
--receiving_twoptm = 2
--
--kickret_tds = 6 (kick return tds)
--puntret_tds = 6 (punt return tds)
--fumbles_rec_tds = 6 (fumbles recovered for tds)

--fumbles_lost = -2
--kicking_fgm = 3 (field goals made)
--kicking_xpmade = 1 (extra point made)




--SELECT
--SUM(passing_yds)*.04 + SUM(passing_tds)*4 + SUM(passing_twoptm)*2 +
--SUM(passing_int)*-2 + SUM(rushing_tds)*6 + SUM(rushing_yds)*.1 +
--SUM(rushing_twoptm)*2 + SUM(receiving_tds)*6 + SUM(receiving_yds)*.1 +
--SUM(receiving_twoptm)*2 + SUM(kickret_tds)*6 + SUM(puntret_tds)*6 +
--SUM(fumbles_lost)*-2 + SUM(kicking_fgm)*3 + SUM(kicking_xpmade)*1
-- FROM play_player
--    WHERE gsis_id IN
--    (SELECT gsis_id FROM game WHERE season_year=2015 and season_type='Regular' AND week>=1 AND week<=17)
--    AND player_id in (SELECT player_id FROM player WHERE full_name='Tom Brady') AND team='ARI';