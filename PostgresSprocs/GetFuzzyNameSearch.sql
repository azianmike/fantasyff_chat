CREATE OR REPLACE FUNCTION GetFuzzyNameSearch(name VARCHAR(70))
RETURNS refcursor AS
$BODY$
DECLARE
  ref refcursor;

BEGIN
        OPEN ref FOR SELECT full_name, levenshtein(full_name, name) as distance
                                 FROM player
                                 WHERE levenshtein(full_name, name) IS NOT NULL
                                 ORDER BY distance ASC LIMIT 3;
RETURN ref;
END;
$BODY$
LANGUAGE plpgsql STABLE
COST 2;