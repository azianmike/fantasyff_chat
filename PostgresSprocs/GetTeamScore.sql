CREATE OR REPLACE FUNCTION GetTeamScore(team VARCHAR, year INT, given_week INT default -1, team2 VARCHAR default null, given_season_type season_phase default 'Regular')
RETURNS TABLE (return_home_team VARCHAR, return_away_team VARCHAR, return_week usmallint,
return_season_year usmallint, return_season_type season_phase,
return_home_score usmallint, return_away_score usmallint, return_finished boolean) as
$BODY$

BEGIN
    IF given_week = -1 AND (team2 = '') IS NOT FALSE -- Checks to see if team2 is not empty or null
    THEN
        RETURN QUERY select home_team, away_team, week, season_year, season_type, home_score, away_score, finished from game where (home_team=team or away_team=team) and season_year=year and season_type=given_season_type ORDER by start_time desc limit 1;
    ELSIF given_week <> -1 AND (team2 = '') IS NOT FALSE  -- given a week but no team 2
    THEN
        RETURN QUERY select home_team, away_team, week, season_year, season_type, home_score, away_score, finished from game where (home_team=team or away_team=team) and season_year=year AND week = given_week and season_type=given_season_type limit 1;
    ELSIF given_week = -1 AND (team2 = '') IS NOT TRUE  -- Given a team 2 but no week
    THEN
        RETURN QUERY select home_team, away_team, week, season_year, season_type, home_score, away_score, finished from game where ((home_team=team and away_team=team2) or (home_team=team2 and away_team=team)) and season_year=year and season_type=given_season_type ORDER by start_time desc limit 1;
    ELSE  -- Given both a week and a team
        RETURN QUERY select home_team, away_team, week, season_year, season_type, home_score, away_score, finished from game where ((home_team=team and away_team=team2) or (home_team=team2 and away_team=team)) and season_year=year AND week = given_week and season_type=given_season_type limit 1;
    END IF;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 1;

--select home_team, away_team, week, season_year, season_type, home_score, away_score from game where home_team='PIT' or away_team='PIT' and season_year=2014 ORDER by start_time desc limit 1