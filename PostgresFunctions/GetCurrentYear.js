/**
 * Created by michaell on 2/14/17.
 */

var config = require('./PostgresConfig');

/**
 * Current season is 2017
 * @returns {number}
 */
function getCurrentYear(){
    return new Date().getFullYear();
}

function getCurrentWeekPromise(){
    var sqlString = "select GetCurrentWeek("+getCurrentYear()+");";
    return config.executePostgresQuery(sqlString);
}


module.exports = {
    getCurrentYear: getCurrentYear,
    getCurrentWeekPromise: getCurrentWeekPromise
}

// getCurrentWeekPromise();