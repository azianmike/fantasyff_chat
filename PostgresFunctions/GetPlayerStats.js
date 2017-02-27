/**
 * Created by michaell on 1/28/17.
 */
var config = require('./PostgresConfig');
var SqlString = require('sqlstring');
var currYear = require('./GetCurrentYear')

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
    year = year ||  currYear.getCurrentYear();
    seasonType = seasonType || "Regular";

    var queryString = 'select GetStats(';
    var escapedName = SqlString.escape(name);
    escapedName = escapedName.replace("\\", "\'")
    queryString += escapedName + ', ';
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
    var statType = "";
    if(statToGet.includes("passing_yds"))
    {
        if(statType.length > 2){
            statType += " and "
        }
        statType += "passing yards";
    }
    if(statToGet.includes("rushing_yds")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "rushing yards";
    }
    if(statToGet.includes("rushing_tds")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "rushing tds";
    }
    if(statToGet.includes("passing_tds")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "passing tds";
    }
    if(statToGet.includes("receiving_yds")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "receiving yards";
    }
    if(statToGet.includes("receiving_tds")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "receiving tds";
    }
    if(statToGet.includes("defense_int")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "pass interceptions";
    }
    if(statToGet.includes("defense_sk")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "defensive sacks";
    }
    if(statToGet.includes("fumbles_forced")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "fumbles forced";
    }
    if(statToGet.includes("fumbles_rec")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "fumbles recovered";
    }
    if(statToGet.includes("defense_tkl")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "defensive tackles";
    }
    return statType;
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

// console.log(getStatTypeString("passing_yds+rushing_yds+receiving_yds"))
