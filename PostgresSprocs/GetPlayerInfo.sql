CREATE OR REPLACE FUNCTION GetPlayerInfo(name VARCHAR)
RETURNS TABLE (player_position player_pos, team VARCHAR, birthdate varchar,
height_inches usmallint, weight usmallint,
uniform_number usmallint, years_pro usmallint) as
$BODY$

BEGIN
    Return Query select player.position, player.team, player.birthdate, player.height, player.weight, player.uniform_number, player.years_pro from player where full_name = name;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 1;

