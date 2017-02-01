var config =  require('./PostgresFunctions/PostgresConfig');

var temp = config.executePostgresQuery('select GetFuzzyNameSearch(\'Tom Bady\');');

temp.then(function(row){console.log(row.rows)})
