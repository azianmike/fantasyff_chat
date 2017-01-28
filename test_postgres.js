var config =  require('./PostgresFunctions/PostgresConfig');

config.executePostgresQuery('select GetPlayerPassingSeasonStats(\'Tom Brady\', 2015);');
