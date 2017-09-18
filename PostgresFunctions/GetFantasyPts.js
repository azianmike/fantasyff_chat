/**
 * Created by michaell on 1/28/17.
 */
var config = require('./PostgresConfig');
var SqlString = require('sqlstring');
var currYear = require('./GetCurrentYear')
const analytics = require('../Analytics/GoogleAnalytics');

/**
 * Returns a PROMISE for stats
 * @param name
 * @param year
 * @param seasonType
 * @param week1
 * @param week2
 * @returns {*}
 */
function getFantasyPtsPromise(name, year, year2, seasonType, week1, week2, team) {
    year = year ||  currYear.getCurrentYear();
    seasonType = seasonType || "Regular";

    var queryString = 'select GetStandardFantasyPoints(';
    var escapedName = SqlString.escape(name);
    escapedName = escapedName.replace("\\", "\'")
    queryString += escapedName + ', ';
    queryString += SqlString.escape(year);

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

    if (team) {  // Need to add week1 and week2 if doesnt exist
        if(!week1){
            queryString += ',' + SqlString.escape('-1')
        }
        if(!week2){
            queryString += ',' + SqlString.escape('-1')
        }
        queryString += ',' + SqlString.escape(team)
    }

    queryString += ');'  // Closing query string
    // return config.executePostgresQuery('select GetStats(\'' + name + '\', 2015, \'passing_yds\');');
    console.log(queryString);
    return config.executePostgresQuery(queryString);
}

function getFantasyPtsString(name, year, year2, seasonType, week1, week2, teamID, stat){
    if (stat === null) {
        stat = 0;
    }
    var returnString = name + " had " + stat + " fantasy points";
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

    if (teamID) {
        returnString += " against " + teamID;
    }

    returnString += ". (Standard scoring)"

    return returnString;
}

function getFantasyPtsWithAi(context, callbackFunc) {
    console.log('enter get stats ' + JSON.stringify(context.entities.player));
    if (context.entities.player)  // Lets get a players passing yards!
    {
        console.log("found player name! " + context.entities.player)
        var name = context.entities.player[0].value;
        var year = currYear.getCurrentYear();
        var year2 = -1;
        var seasonType = null;
        var week1 = null;
        var week2 = null;
        var teamID = '';
        if (context.entities.datetime) {
            if(context.entities.datetime[0].value) {
                year = context.entities.datetime[0].value.substring(0, 4);
            } else {
                year = context.entities.datetime[0].from.value.substring(0, 4);
                year2 = context.entities.datetime[0].to.value.substring(0, 4);
            }

            if(context.entities.datetime[1] && context.entities.datetime[1].value) {
                year2 = context.entities.datetime[0].to.value.substring(0, 4);
            }
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

        analytics.trackGetFantasyStats();
        analytics.trackPlayer(name);
        getFantasyPtsPromise(name, year, year2, seasonType, week1, week2, teamID).then(
            function (row) {
                if (row && row[0]) {
                    var stringToSend = getFantasyPtsString(name, year, year2, seasonType, week1, week2, teamID, row[0].getstandardfantasypoints);
                    callbackFunc(stringToSend)
                } else {
                    callbackFunc('Sorry, we couldn\'t find anything')
                }

            }
        );
    } else {
        callbackFunc("Sorry, I think you're missing a player name! (Or we don't recognize that name)")
    }

}

module.exports = {
    getFantasyPtsWithAi: getFantasyPtsWithAi
}

// var outputFunc = function(rows){console.log(rows[0].getstats)};
// var statsPromise = getStatsPromise('Tom Brady', 2015, 'passing_yds');
// var statsPromise2 = getStatsPromise('Tom Brady', 2014, 'rushing_yds', 'Postseason');
// console.log(statsPromise.then(outputFunc));
// statsPromise2.then(outputFunc);


// console.log(getStatsString('Tom Brady', 2013, 'passing_yds', null, null, null, 3));
// console.log(getStatsString('Tom Brady', 2013, 'passing_yds', "postseason", 3, 5, 3));

// console.log(getStatTypeString("passing_yds+rushing_yds+receiving_yds"))
