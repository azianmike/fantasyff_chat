'use strict';

var nfl = require('./getNFLData')
var fb_apicalls = require('./fb_apicalls')
var getStats = require('./PostgresFunctions/GetPlayerSeasonStats');
var getScore = require('./PostgresFunctions/GetTeamScore');
var currYear = require('./PostgresFunctions/GetCurrentYear')

let Wit = null;
let interactive = null;
try {
    // if running from repo
    Wit = require('../').Wit;
    interactive = require('../').c;
} catch (e) {
    Wit = require('node-wit').Wit;
    interactive = require('node-wit').interactive;
}

const accessToken = (() => {
        if (process.argv.length !== 3) {
    console.log('usage: node examples/witai.js <wit-access-token>');
    process.exit(1);
}
return process.argv[2];
})();

const actions = {
    'send': function send(request, response) {
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;
        console.log('user said...', request.text);
        console.log('sending...', JSON.stringify(response));
    },
    /**
     *
     * @param context
     * @param callbackFunc Takes one string parameter to send back to the user
     */
    'score': function getTeamScore(context, callbackFunc) {
        console.log(context.entities)
        if( context.entities.football_team )  // Lets get a football score!
        {

            var team1 = context.entities.football_team[0].value;
            var team2 = null;
            var year = null;
            var week = null;
            var season_type = null;
            if(context.entities.football_team.length > 1){ // Means two teams
                team2 = context.entities.football_team[1].value;
            }

            if(context.entities.datetime){
                year = context.entities.datetime[0].value.substring(0, 4);
            }

            if(context.entities.week1){
                week = context.entities.week1[0].value;
            }

            if(context.entities.season_type){
                season_type = context.entities.season_type[0].value
            }

            getScore.getTeamScorePromise(team1, year, week, team2, season_type).then(function(rows){
                if(row && row[0]) {
                    var row = rows[0];
                    var home_team = row.return_home_team;
                    var away_team = row.return_away_team;
                    var week = row.return_week;
                    var year = row.return_season_year;
                    var seasonType = row.return_season_type;
                    var home_score = row.return_home_score;
                    var away_score = row.return_away_score;
                    var finished = row.return_finished;

                    var returnString = getScore.getTeamScoreString(home_team, away_team, week, year, seasonType, home_score, away_score, finished);
                    callbackFunc(returnString);
                }else{
                    callbackFunc('Sorry, we couldn\'t find anything');
                }

            });
        }
        else  // No football team name
        {
            if( callbackFunc )
            {
                callbackFunc( "Sorry, I think you forgot a team name or misspelled it" )
            }
        }

    },
    'getStats':function getTeamScore(context, callbackFunc) {
        console.log('enter get stats ' + JSON.stringify(context.entities.player));
        if( context.entities.player )  // Lets get a players passing yards!
        {
            console.log("found player name! " + context.entities.player)
            if(context.entities.statToGet)
            {
                var name = context.entities.player[0].value;
                var year = currYear.getCurrentYear();
                var seasonType = null;
                var week1 = null;
                var week2 = null;
                var statToGet = null;
                if(context.entities.datetime) {
                    year = context.entities.datetime[0].value.substring(0, 4);
                }

                if(context.entities.statToGet) {
                    statToGet = context.entities.statToGet[0].value;
                }

                if(context.entities.season_type){
                    seasonType = context.entities.season_type[0].value
                }

                if(context.entities.week1){
                    week1 = context.entities.week1[0].value
                }

                if(context.entities.week2){
                    week2 = context.entities.week2[0].value
                    if(week1>week2){
                        var temp = week2;
                        week2 = week1;
                        week1 = week2;
                    }
                }

                getStats.getStatsPromise(name, year, statToGet, seasonType, week1, week2).then(
                    function (row) {
                        if(row && row[0]) {
                            var stringToSend = getStats.getStatsString(name, year, statToGet, seasonType, week1, week2, row[0].getstats);
                            callbackFunc(stringToSend)
                        }else{
                            callbackFunc('Sorry, we couldn\'t find anything')
                        }

                    }
                );
            }else
            {
                callbackFunc("Sorry, enter in a stat to get! Like passing yards or rushing yards!")
            }

        }else  // Need to fuzzy search for player name
        {
            callbackFunc("Sorry, I think you forgot a name!")
        }
    }
};

/**
 * Helper which analyzes the context intent and correctly calls the right function
 * @param context context with all the information
 */
function callActionHelper(context, callbackFunc) {
    if (context && context.entities && context.entities.intent) {
        if (context.entities.intent[0].confidence > 0.8) {
            var funcToCall = actions[context.entities.intent[0].value]
            funcToCall(context, callbackFunc)
        }
    }
    else {
        console.log("No context")
    }
}

const client = new Wit({accessToken}); // No actions, manually choose actions

/**
 * Gets a wit.ai response based on the text and sender
 * @param sender the person who we send the response to eventually
 * @param text text that we want to parse with wit.ai
 */
function getResponse(sender, text) {
    client.message(text, {})
        .then((data) => {
            console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));

            var sendTextHelper = function(text){
                fb_apicalls.sendTextMessage(sender, text)
            }
            callActionHelper(data, sendTextHelper)
        })
        .catch(console.error);
}

module.exports.getRespone = getResponse


// getResponse('10157076165585601', "what is the score of ravens game")
// getResponse(null, "what is the score of ravens game in 2014 in week 3")

// getResponse(null, "what is the score of the potato game")
// getResponse(null, "how many passing yards does Eli Maning have")
// getResponse(null, "passing yards for Joe Flacco in the regular season of 2013 between week 5 and 11")