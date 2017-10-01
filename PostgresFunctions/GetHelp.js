/**
 * Created by michaell on 4/1/17.
 */

const fb_apicalls = require('../fb_apicalls')


function getHelp(context, callbackFunc, sender, sendMessageAfterTimeout) {
    // ALWAYS send to fb_apicalls.sendQuickReplies

    if (context.entities.helpEntities)  // Means user has chosen a help quick reply
    {
        var helpEntity = context.entities.helpEntities[0].value
        if(helpEntity == "stats_help") {  // Stats help
            callbackFunc("You can ask for lots of different stats, including fantasy points, from defensive tackles to touchdowns (receiving, rushing, passing) " +
                "to yardage (receiving, rushing, passing)");
            sendMessageAfterTimeout(callbackFunc, "You can also ask for a week time range and/or a year! Try \'Give me passing tds for russell wilson between weeks 2 and 10 in 2013\'")
            sendMessageAfterTimeout(callbackFunc, "You can also ask fantasy points! Try \'Tom brady fantasy points\' or \'Eli manning fantasy points week 2\'")

        }
        else if(helpEntity == "subscribe_help") {  // Stats help
            callbackFunc("Subscribe to a player for updates! We'll notify you when the player has a major play, like a touchdown");
            sendMessageAfterTimeout(callbackFunc, "Try it out! Just say \'give me updates for eli manning\'");
        }
        else if(helpEntity == "top_stats_help") {  // Stats help
            callbackFunc("You can ask for category leaders for any stat (yards, touchdowns, sacks, etc) during any given time period!");
            sendMessageAfterTimeout(callbackFunc, "Try it out! Ask \'who was the top rusher in 2014 between week 4 and 10\' or \'who had the most sacks in week 10?\'");
        }
        else if(helpEntity == "player_info_help") {  // Stats help
            callbackFunc("You can ask for player info, like how tall a player is or what team they play for!");
            sendMessageAfterTimeout(callbackFunc, "Try it out! Ask \'how tall is tom brady\' or \'how many years has cam newton played in the league\'");
        }
        else if(helpEntity == "stats_type_help") {  // Stats help
            callbackFunc("These are the types of stats you can ask:\n•Passing yds, tds, ints, completions, attempts\n•Rushing yds, tds, attempts\n•Receiving yds, tds, targets, receptions\n•Fumbles lost or forced\n•Defensive tackles, sacks, ints\n•Field goals made, attempts, and blocked ");
        }
        else {  // Score help
            callbackFunc("You can ask for lots of different scores of different teams! If you don't specify a week/year, we'll give you the latest game (or live score!)");
            sendMessageAfterTimeout(callbackFunc, "You can also ask for scores between teams, like \'score of the ravens steelers game\'");
        }
    } else {
        var quick_replies = [];
        var statsQuickReply = {
            "content_type":"text",
            "title":"Player Fantasy Stats",
            "payload":"stats_help"
        }
        var subscribeQuickReply = {
            "content_type":"text",
            "title":"Player updates",
            "payload":"subscribe_help"
        }
        var scoreQuickReply = {
            "content_type":"text",
            "title":"Get Scores of Games",
            "payload":"score_help"
        }
        var getTopStatsReply = {
            "content_type":"text",
            "title":"Get Top Stats",
            "payload":"top_stats_help"
        }
        var getPlayerInfoHelp = {
            "content_type":"text",
            "title":"Get Player Info",
            "payload":"player_info_help"
        }
        var typesOfStatsHelp = {
            "content_type":"text",
            "title":"Types of Stats",
            "payload":"stats_type_help"
        }
        quick_replies.push(statsQuickReply);
        quick_replies.push(subscribeQuickReply);
        quick_replies.push(scoreQuickReply);
        quick_replies.push(getPlayerInfoHelp);
        quick_replies.push(getTopStatsReply);
        quick_replies.push(typesOfStatsHelp);
        fb_apicalls.sendQuickReplies(sender, "What do you need help with? We specialize in player stats over a specific time period (like \'between week 4 and 8 in 2014\')", quick_replies);
    }
}

module.exports = {
    getHelp: getHelp
}