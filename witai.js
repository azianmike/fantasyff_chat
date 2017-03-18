'use strict';

const fb_apicalls = require('./fb_apicalls')
const getStats = require('./PostgresFunctions/GetPlayerStats');
const getScore = require('./PostgresFunctions/GetTeamScore');
const currYear = require('./PostgresFunctions/GetCurrentYear');
const getPlayerInfo = require('./PostgresFunctions/GetPlayerInfo')

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
    if (context.entities.football_team)  // Lets get a football score!
    {

        var team1 = context.entities.football_team[0].value;
        var team2 = null;
        var year = null;
        var week = null;
        var season_type = null;
        if (context.entities.football_team.length > 1) { // Means two teams
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
        callbackFunc("Hello! Ask me anything like \"How many passing yards does Peyton manning have in 2014\" or \"What was the score of dolphins game\"");
    },
    'getHelp': function getHelp(context, callbackFunc, sender) {
        // ALWAYS send to fb_apicalls.sendQuickReplies

        if (context.entities.helpEntities)  // Means user has chosen a help quick reply
        {
            var helpEntity = context.entities.helpEntities[0].value
            if(helpEntity == "stats_help") {  // Stats help
                callbackFunc("You can ask for lots of different stats, from defensive tackles to touchdowns (receiving, rushing, passing) " +
                    "to yardage (receiving, rushing, passing)");
                callbackFunc("You can also ask for a week time range and/or a year! Try \'Give me passing tds for russell wilson between weeks 2 and 10 in 2013\'");
            } else {  // Score help
                callbackFunc("You can ask for lots of different scores of different teams! If you don't specify a week/year, we'll give you the latest game (or live score!)");
                callbackFunc("You can also ask for scores between teams, like \'score of the ravens steelers game\'");
            }
        } else {
            var quick_replies = [];
            var statsQuickReply = {
                "content_type":"text",
                "title":"Getting Player Stats",
                "payload":"stats_help"
            }
            var scoreQuickReply = {
                "content_type":"text",
                "title":"Get Scores of Games",
                "payload":"score_help"
            }
            quick_replies.push(statsQuickReply);
            quick_replies.push(scoreQuickReply);
            fb_apicalls.sendQuickReplies(sender, "What do you need help with?", quick_replies);
        }
    },
    'getPlayerInfo': getPlayerInfo.getPlayerInfo
};

/**
 * Helper which analyzes the context intent and correctly calls the right function
 * @param context context with all the information
 */
function callActionHelper(context, callbackFunc, sender) {
    // throw new Error("testing anoother error2");
    if (context && context.entities && context.entities.intent && context.entities.intent[0].confidence > 0.7) {
            var funcToCall = actions[context.entities.intent[0].value]
            funcToCall(context, callbackFunc, sender)
    }
    else {
        context['errorMsg'] = "No context/bad context";
        log.warning(context);
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

// getResponse(null, "what is the score of the potato game")
// getResponse(null, "how many passing yards does Eli Maning have")
// getResponse(null, "passing yards for Joe Flacco in the regular season of 2013 between week 5 and 11")
// getResponse(null, "Doug Baldwin receiving yards 2014")
// getResponse(null, "Tom brady passing tds between week 13 and 10")
// getResponse(null, "Tom brady passing tds between week 10 and 10")
// getResponse(null, "Le'veon Bell rushing yards 2016")

