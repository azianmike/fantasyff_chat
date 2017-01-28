/**
 * Created by michaell on 1/28/17.
 */
var config =  require('./PostgresConfig');


config.executePostgresQuery('select GetPlayerPassingSeasonStats(\'Tom Brady\', 2015);');
