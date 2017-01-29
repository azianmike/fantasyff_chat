var config =  require('./PostgresFunctions/PostgresConfig');

//config.executePostgresQuery('select GetPlayerPassingSeasonStats(\'Tom Brady\', 2015);');
function tempFunc(rows)
{
console.log("test");
console.log(rows.rows);
}
config.executePostgresQuery('select GetFuzzyNameSearch(\'Tom Bardy\');', tempFunc);
