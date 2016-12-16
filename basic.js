'use strict';

var nfl = require('./getNFLData')
var fb_apicalls = require('./fb_apicalls')

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
    console.log('usage: node examples/basic.js <wit-access-token>');
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
    'score': function getTeamScore(context, callbackFunc) {
        console.log(context.entities)
        if( context.entities.football_team && context.entities.football_team[0].confidence > 0.8 )  // Lets get a football score!
        {
            if (callbackFunc) {
                nfl.getTeamLiveScore(context.entities.football_team[0].value, callbackFunc)
            }
            else {
                nfl.getTeamLiveScore(context.entities.football_team[0].value, function (string) {
                    console.log(string)
                })
            }
        }

        ;
    },
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

// getResponse('10157076165585601', "what is the score of ravens game")
// getResponse(null, "what is the score of ravens game")

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
