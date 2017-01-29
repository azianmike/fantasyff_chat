CREATE OR REPLACE FUNCTION GetFuzzyNameSearch(name VARCHAR(70))
RETURNS TABLE (full_name VARCHAR, distance INT) as
$BODY$

BEGIN
        RETURN QUERY SELECT player.full_name, levenshtein(player.full_name, name) as distance
                                 FROM player
                                 WHERE levenshtein(player.full_name, name) IS NOT NULL and levenshtein(player.full_name, name) < 6
                                 ORDER BY distance ASC LIMIT 3;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 2;