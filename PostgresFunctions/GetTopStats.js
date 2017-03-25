/**
 * Created by michaell on 3/25/17.
 */

var config = require('./PostgresConfig');
var SqlString = require('sqlstring');
var currYear = require('./GetCurrentYear')
const analytics = require('../Analytics/GoogleAnalytics');

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
function getTopStatsPromise(year, year2, statToGet, seasonType, week1, week2, num_limit) {
    year = year ||  currYear.getCurrentYear();
    seasonType = seasonType || "Regular";

    var queryString = 'select * from GetTopStats(';
    queryString += SqlString.escape(year) + ',';
    queryString += SqlString.escape(statToGet)

    if(year2) {
        queryString += ',' + SqlString.escape(year2)
    }

    if (seasonType) {
        queryString += ',' + SqlString.escape(seasonType)
    }

    if (week1) {
        queryString += ',' + SqlString.escape(week1)
    }

    if (week2) {
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
    if(statToGet.includes("kickret_yds")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "kick return yards";
    }
    if(statToGet.includes("kickret_tds")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "kick return touchdowns";
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
        statType += "def pass interceptions";
    }
    if(statToGet.includes("passing_int")){
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
    if(statToGet.includes("passing_att")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "pass attempts";
    }
    if(statToGet.includes("passing_cmp")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "pass completions";
    }
    if(statToGet.includes("receiving_tar")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "pass targets";
    }
    if(statToGet.includes("receiving_rec")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "pass receptions";
    }
    if(statToGet.includes("rushing_att")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "rushing attempts";
    }
    if(statToGet.includes("fumbles_forced")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "fumbles forced";
    }
    if(statToGet.includes("fumbles_lost")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "fumbles lost";
    }
    if(statToGet.includes("fumbles_rec")){
        if(statType.length > 2){
            statType += " and "
        }
        statType += "fumbles recovered";
    }
    return statType;
}

function getTopStatsString(name, year, year2, statToGet, seasonType, week1, week2, num_limit, stat){
    if (stat === null) {
        stat = 0;
    }
    var returnString = name + " had the most " + getStatTypeString(statToGet);
    returnString += " with " + stat
    if (year2 && year2 > 1) {
        returnString += " between " + year + " and " + year2;
    } else {
        returnString += " in " + year;
    }
    if (seasonType) {
        if (seasonType === "Regular") {
            returnString += " during the " + seasonType + " season";
        }
        else {
            returnString += " during the " + seasonType;
        }
    }

    if (week1 && week2){
        returnString += " between weeks " + week1 + " and " + week2;
    }else if(week1){
        returnString += " in week " + week1;
    }

    return returnString;
}

function getTopStatsWitAi(context, callbackFunc) {
    console.log('enter get TOP stats ' + JSON.stringify(context.entities.player));

    var year = currYear.getCurrentYear();
    var year2 = -1;
    var seasonType = null;
    var week1 = null;
    var week2 = null;
    var statToGet = null;
    var num_limit = null;
    var position = null;
    if (context.entities.datetime) {
        if (context.entities.datetime[0].value) {
            year = context.entities.datetime[0].value.substring(0, 4);
        } else {
            year = context.entities.datetime[0].from.value.substring(0, 4);
            year2 = context.entities.datetime[0].to.value.substring(0, 4);
        }

        if (context.entities.datetime[1] && context.entities.datetime[1].value) {
            year2 = context.entities.datetime[0].to.value.substring(0, 4);
        }
    }

    try {
        statToGet = constructStatsToGet(context.entities);
    } catch (err) {
        callbackFunc(err);
        return;
    }

    if (context.entities.season_type) {
        seasonType = context.entities.season_type[0].value
    }

    if (context.entities.week1) {
        week1 = context.entities.week1[0].value
    }

    if (context.entities.week2) {
        week2 = context.entities.week2[0].value
        if (week1 > week2) {
            var temp = week2;
            week2 = week1;
            week1 = temp;
        }
    }

    if (context.entities.football_team) {
        teamID = context.entities.football_team[0].value
    }

    analytics.trackGetTopStats(statToGet);
    getTopStatsPromise(year, year2, statToGet, seasonType, week1, week2, num_limit).then(
        function (row) {
            if (row && row[0]) {

                var stringToSend = getTopStatsString(row[0].player_name, year, year2, statToGet, seasonType, week1, week2, num_limit, row[0].sum_of_stat);
                callbackFunc(stringToSend)
            } else {
                callbackFunc('Sorry, we couldn\'t find anything')
            }

        }
    );

}

function constructStatsToGet(entities) {
    var returnString = "";
    if (entities.statToGet_prefix) {
        var suffix = "_yds" // No suffix, assume yards
        if (entities.statToGet_suffix) {
            // TODO Ask user if they want yards or TD - Need to implement user specific session
            suffix = entities.statToGet_suffix[0].value;
        }
        for (var prefix of entities.statToGet_prefix) {
            if (returnString.length == 0) {
                returnString += prefix.value + suffix
            } else {
                returnString += "+" + prefix.value + suffix
            }
        }
    } else if (entities.statToGet_suffix) {  // Assume they want total yards or tds
        var suffix = entities.statToGet_suffix[0].value
        if(entities.statToGet_suffix[0].value != '_int') {
            returnString = "rushing%s+passing%s+receiving%s".replace(/%s/g, suffix)
        } else {
            returnString = "passing%s".replace(/%s/g, suffix)
        }
    } else if ( entities.statToGet_standalone) {
        returnString = entities.statToGet_standalone[0].value
    }


    if(returnString.length == 0) {
        throw "Sorry, I think you forgot a stat to get like \'passing yards\'!"
    }
    return returnString;
}


module.exports = {
    getTopStatsWitAi: getTopStatsWitAi
}

// var outputFunc = function(rows){console.log(rows[0].getstats)};
// var statsPromise = getStatsPromise('Tom Brady', 2015, 'passing_yds');
// var statsPromise2 = getStatsPromise('Tom Brady', 2014, 'rushing_yds', 'Postseason');
// console.log(statsPromise.then(outputFunc));
// statsPromise2.then(outputFunc);


// console.log(getStatsString('Tom Brady', 2013, 'passing_yds', null, null, null, 3));
// console.log(getStatsString('Tom Brady', 2013, 'passing_yds', "postseason", 3, 5, 3));

// console.log(getStatTypeString("passing_yds+rushing_yds+receiving_yds"))
