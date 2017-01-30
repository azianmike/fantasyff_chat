CREATE OR REPLACE FUNCTION GetFuzzyNameSearch(orig_full_name VARCHAR(70), orig_last_name VARCHAR(70))
RETURNS TABLE (full_name VARCHAR, distance INT) as
$BODY$

BEGIN
        RETURN QUERY (SELECT player.full_name, levenshtein(player.last_name, orig_last_name) as distance
                                                      FROM player
                                                      WHERE levenshtein(player.last_name,orig_last_name) IS NOT NULL and levenshtein(player.last_name,orig_last_name) < 6
                                                      ORDER BY distance ASC LIMIT 3) UNION

                     (SELECT player.full_name, levenshtein(player.full_name, orig_full_name) as distance
                                                           FROM player
                                                           WHERE levenshtein(player.full_name,orig_full_name) IS NOT NULL and levenshtein(player.full_name, orig_full_name) < 6
                                                           ORDER BY distance ASC LIMIT 3) ORDER BY distance;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 2;



