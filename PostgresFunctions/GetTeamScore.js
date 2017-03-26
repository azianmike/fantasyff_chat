/**
 * Created by michaell on 2/14/17.
 */

var config = require('./PostgresConfig');
var SqlString = require('sqlstring');
var currYear = require('./GetCurrentYear')

/**
 * Returns a PROMISE to get team scores
 * @param team1
 * @param year
 * @param week
 * @param team2
 */
function getTeamScorePromise(team1, year, week, team2, season_type){
    if(team1) {
        team1 = team1.replace('*', ''); // Replace special team names * with empty string, like WAS* 
    }
    year = year || currYear.getCurrentYear();
    var query = 'select * from GetTeamScore(';
    query += SqlString.escape(team1);
    query += ',' + SqlString.escape(year);
    if(week){
        query += ',' + SqlString.escape(week);
    }

    if(team2){
        if(!week){
            query += ',' + SqlString.escape('-1');
            week = -1;  // Reset week
        }
        query += ',' + SqlString.escape(team2);
    }

    if(season_type){
        if(!week){
            query += ',' + SqlString.escape('-1');
        }

        if(!team2){
            query += ',' + SqlString.escape(null);
        }
        query += ',' + SqlString.escape(season_type);
    }

    query += ');'
    console.log(query);
    return config.executePostgresQuery(query);
}

function getTeamScoreString(home_team, away_team, week, season_year, season_type, home_score, away_score, finished){
    var queryString = '';
    if(finished) {  // Historical score
        queryString += 'The score of ' + home_team + ' vs ' + away_team + ' was ';
        queryString += home_score + ' - ' + away_score + ' in week ' + week;
        queryString += ' of the ' + season_type

        if(season_type === 'Regular'){
            queryString += ' season'
        }
        queryString += '.'
    }else{  // Live game, still have yet to do
        queryString += 'Not implemented yet';
    }

    return queryString;
}

module.exports = {
    getTeamScorePromise: getTeamScorePromise,
    getTeamScoreString: getTeamScoreString
}


// var test = function(rows){
//     console.log(rows);
//     console.log(rows[0].return_home_team)
// }
// var test1 = getTeamScorePromise('PIT');
// test1.then(test);
//
// var test2 = getTeamScorePromise('PIT', 2013);
// test2.then(test);
//
// var test3 = getTeamScorePromise('PIT', 2013, 2);
// test3.then(test);
//
// var test4 = getTeamScorePromise('PIT', 2013, -1 /* 4 does not work */, 'BAL');
// test4.then(test);
//
// console.log(SqlString.escape(null))
// console.log(SqlString.escape('null'))