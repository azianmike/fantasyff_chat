'use strict';

const fb_apicalls = require('./fb_apicalls')
const getStats = require('./PostgresFunctions/GetPlayerStats');
const getScore = require('./PostgresFunctions/GetTeamScore');
const currYear = require('./PostgresFunctions/GetCurrentYear');
const getPlayerInfo = require('./PostgresFunctions/GetPlayerInfo')
const getTopStats = require('./PostgresFunctions/GetTopStats')
const getHelp = require('./PostgresFunctions/GetHelp')

const winston = require('winston');
require('winston-loggly');

var log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.Loggly)( {
            token: "eefdcc8d-96ac-44c9-b61f-cce64d15d027",
            subdomain: "sportschat",
            tags: ["Winston-NodeJS"],
            json:true,
            handleExceptions: true,
            withStack: true
        })
    ]
});

const analytics = require('./Analytics/GoogleAnalytics')

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

function getTeamScoreWitAi(context, callbackFunc) {
    console.log(context.entities);
    // Lets get a football score! Need a team OR super bowl (since only 2 teams)
    if (context.entities.football_team || (context.entities.season_type && context.entities.season_type[0].value == 'Super Bowl'))
    {

        var team1 = context.entities.football_team?context.entities.football_team[0].value:null;
        var team2 = null;
        var year = null;
        var week = null;
        var season_type = null;
        if (context.entities.football_team && context.entities.football_team.length > 1) { // Means two teams
            team2 = context.entities.football_team[1].value;
        }

        if (context.entities.datetime) {
            year = context.entities.datetime[0].value.substring(0, 4);
        }

        if (context.entities.week1) {
            week = context.entities.week1[0].value;
        }

        if (context.entities.season_type) {
            season_type = context.entities.season_type[0].value
            if(season_type == "Super Bowl") {  // Hard code week 5 of postseason for superbowl
                season_type = "Postseason";
                week = 5;
            }
        }

        analytics.trackGetTeamScore(team1, team2);
        getScore.getTeamScorePromise(team1, year, week, team2, season_type).then(function (rows) {
            if (rows && rows[0]) {
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
            } else {
                console.log(rows)
                log.warn("Did not get any team score " + team1 + team2 + season_type)
                callbackFunc('Sorry, we couldn\'t find anything');
            }

        });
    }
    else  // No football team name
    {
        if (callbackFunc) {
            callbackFunc("Sorry, I think you forgot a team name or misspelled it")
        }
    }
}

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
        getTeamScoreWitAi(context, callbackFunc);

    },
    'getStats': function getTeamScore(context, callbackFunc) {
        getStats.getStatsWitAi(context, callbackFunc);
    },
    'getStarted': function getStarted(context, callbackFunc) {
        callbackFunc("Hello! Ask me anything about the NFL! Like \"How many passing yards does Peyton manning have in 2014\" or \"What was the score of dolphins game\"");
        sendMessageAfterTimeout(callbackFunc, "I specialize in NFL player stats over a specific time period, like asking for \'Tom Brady\'s passing yards between week 12 and 18 in 2013\'");
    },
    'getHelp': function helpFunc(context, callbackFunc, sender) {
        getHelp.getHelp(context, callbackFunc, sender, sendMessageAfterTimeout)
    },
    'getPlayerInfo': getPlayerInfo.getPlayerInfo,
    'getTopStats': getTopStats.getTopStatsWitAi,
    'getPlayerOptions':function getHelp(context, callbackFunc, sender) {
        if (context.entities.player)  // Lets get a players passing yards!
        {
            var quick_replies = [];
            var player = context.entities.player[0].value;
            var yardsQuickReply = {
                "content_type":"text",
                "title":"Get Yards",
                "payload":"give me yards for " + player
            }
            var tdsQuickReply = {
                "content_type":"text",
                "title":"Get TDs",
                "payload":"give me tds for " + player
            }
            var weightQuickReply = {
                "content_type":"text",
                "title":"Get Weight",
                "payload":"get weight for " + player
            }
            var teamQuickReply = {
                "content_type":"text",
                "title":"Get Team",
                "payload":"get team of " + player
            }
            quick_replies.push(yardsQuickReply);
            quick_replies.push(weightQuickReply);
            quick_replies.push(tdsQuickReply);
            quick_replies.push(teamQuickReply);
            fb_apicalls.sendQuickReplies(sender, "What do you need help with? (note, you can scroll left/right through the quick replies)", quick_replies);
        } else {
            callbackFunc("Sorry, we weren't sure what you meant. Try something else")
        }
    }
};

function sendMessageAfterTimeout(callbackFunc, text) {
    var func = function() {
        callbackFunc(text);
    }

    setTimeout(func, 50);
}

/**
 * Helper which analyzes the context intent and correctly calls the right function
 * @param context context with all the information
 */
function callActionHelper(context, callbackFunc, sender) {
    // throw new Error("testing anoother error2");
    if (context && context.entities && context.entities.intent && context.entities.intent[0].confidence > 0.5) {
            var funcToCall = actions[context.entities.intent[0].value]
            funcToCall(context, callbackFunc, sender)
    }
    else {
        context['errorMsg'] = "No context/bad context";
        log.warn(context);
        callbackFunc("We\'re not sure what you meant. Type \'help\' for guidance from the bot!")
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
            log.info(data);

            var sendTextHelper = function(text){
                fb_apicalls.sendTextMessage(sender, text)
            }
            callActionHelper(data, sendTextHelper, sender)
        })
        .catch(function(error){
            console.log(error);
            log.error(error);
        });
}

module.exports.getResponse = getResponse


// getResponse('10157076165585601', "what is the score of ravens game")
// getResponse(null, "what is the score of ravens game in 2014 in week 3")
// winston.remove(winston.transports.Console)
// getResponse(null, "what is the score of the potato game")
// getResponse(null, "how many passing yards does Eli Maning have")
// getResponse(null, "passing yards for Joe Flacco in the regular season of 2013 between week 5 and 11")
// getResponse(null, "Doug Baldwin receiving yards 2014")
// getResponse(null, "Tom brady passing tds between week 13 and 10")
// getResponse(null, "Tom brady passing tds between week 10 and 10")
// getResponse(null, "Tom Brady interceptions from 2014 to 2016 against the Giants")
// getResponse(null, "Carson Palmer rushing yards from 2014 to 2016 against the Giants")
// getResponse(null, "stats")
// getResponse(null, "how many tackles does jj watt have in 2015?")
// getResponse(null, "who was the top rusher in 2015?")
// getResponse(null, "who was the top tackler in 2015?")
// getResponse(null, "blargh! tom brady!")
// getResponse(null, "what was the score of the super bowl in 2015?")
// getResponse(null, "peyton manning")
// getResponse(null, "who had the most sacks in 2015")
// getResponse(null, "who had the most field goals in 2015")


