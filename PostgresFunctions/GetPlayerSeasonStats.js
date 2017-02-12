/**
 * Created by michaell on 1/28/17.
 */
var config = require('./PostgresConfig');
Promise = require('bluebird')
var SqlString = require('sqlstring');

/**
 * Returns a PROMISE for stats
 * @param name
 * @param year
 * @param statToGet
 * @param seasonType
 * @param week1
 * @param week2
 * @returns {*}
 */
function getStatsPromise(name, year, statToGet, seasonType, week1, week2) {
    year = year ||  new Date().getFullYear();

    var queryString = 'select GetStats(';
    queryString += SqlString.escape(name) + ', ';
    queryString += SqlString.escape(year) + ',';
    queryString += SqlString.escape(statToGet)
    if(seasonType){
        queryString += ',' + SqlString.escape(seasonType)
    }

    if(week1){
        queryString += ',' + SqlString.escape(week1)
    }

    if(week2){
        queryString += ',' + SqlString.escape(week2)
    }

    queryString += ');'  // Closing query string
    // return config.executePostgresQuery('select GetStats(\'' + name + '\', 2015, \'passing_yds\');');
    console.log(queryString);
    return config.executePostgresQuery(queryString);
}

// var outputFunc = function(rows){console.log(rows[0].getstats)};
// var statsPromise = getStatsPromise('Tom Brady', 2015, 'passing_yds');
// var statsPromise2 = getStatsPromise('Tom Brady', 2014, 'rushing_yds', 'Postseason');
// console.log(statsPromise.then(outputFunc));
// statsPromise2.then(outputFunc);