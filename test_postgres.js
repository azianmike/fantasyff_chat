var config =  require('./PostgresFunctions/PostgresConfig');

config.executePostgresQuery('select GetPlayerSeasonStats(\'Tom Brady\', 2015);');
