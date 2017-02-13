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
    year = year ||  new Date().getFullYear() - 1;
    seasonType = seasonType || "Regular";

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

function getStatTypeString(statToGet){
    if(statToGet === "passing_yds")
    {
        return "passing yards";
    }else if(statToGet === "rushing_yds"){
        return "rushing yards";
    }else if(statToGet === "rushing_tds"){
        return "rushing tds";
    }else if(statToGet === "passing_tds"){
        return "passing tds";
    }else{
        throw new Error("Bad state type string conversion");
    }
}

function getStatsString(name, year, statToGet, seasonType, week1, week2, stat){
    if(stat === null)
    {
        stat = 0;
    }
    var returnString = name + " had " + stat;
    returnString += " " + getStatTypeString(statToGet);
    returnString += " in " + year;
    if(seasonType){
        if(seasonType === "Regular")
        {
            returnString += " during the " + seasonType + " season";
        }
        else
        {
            returnString += " during the " + seasonType;
        }
    }

    if(week1 && week2){
        returnString += " between weeks " + week1 + " and " + week2;
    }else if(week1){
        returnString += " in week " + week1;
    }

    return returnString;
}

module.exports = {
    getStatsPromise: getStatsPromise,
    getStatsString: getStatsString
}

// var outputFunc = function(rows){console.log(rows[0].getstats)};
// var statsPromise = getStatsPromise('Tom Brady', 2015, 'passing_yds');
// var statsPromise2 = getStatsPromise('Tom Brady', 2014, 'rushing_yds', 'Postseason');
// console.log(statsPromise.then(outputFunc));
// statsPromise2.then(outputFunc);


// console.log(getStatsString('Tom Brady', 2013, 'passing_yds', null, null, null, 3));
// console.log(getStatsString('Tom Brady', 2013, 'passing_yds', "postseason", 3, 5, 3));