CREATE OR REPLACE FUNCTION GetCurrentWeek(year INT)
RETURNS smallint
as
$BODY$

select max(week) as week from game where season_year=year;

$BODY$
LANGUAGE sql;