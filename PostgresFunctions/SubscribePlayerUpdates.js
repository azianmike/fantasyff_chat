/**
 * Created by michaell on 3/25/17.
 */

const config = require('./PostgresConfig');
const SqlString = require('sqlstring');
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
function getAddSubscriptionPromise(sender, player_name) {
    var queryString = 'select AddPlayerSubscription('+SqlString.escape(sender)+","+SqlString.escape(player_name)+");";

    return config.executePostgresQuery(queryString);
}

function getRemoveubscriptionPromise(sender, player_name) {
    var queryString = 'select RemovePlayerSubscription('+SqlString.escape(sender)+","+SqlString.escape(player_name)+");";

    return config.executePostgresQuery(queryString);
}

function addPlayerSubscription(context, callbackFunc, sender) {
    if (context.entities.player)  // Lets get a players passing yards!
    {
        console.log("found player name! " + context.entities.player)
        var name = context.entities.player[0].value;

        analytics.trackSubscribe(name);
        if(context.entities.unsubscribe){ // Unsubscribe user
            getRemoveubscriptionPromise(sender, name).then(
                function (row) {
                    // Finish
                    callbackFunc("We've unsubscribed you for player updates for "+name);
                }
            );
        } else {
            getAddSubscriptionPromise(sender, name).then(
                function (row) {
                    // Finish
                    callbackFunc("We've subscribed you for player updates for "+name);
                }
            );
        }
    }else {
        callbackFunc("Sorry, I think you're missing a player name! (Or we don't recognize that name)")
    }

}

module.exports = {
    addPlayerSubscription: addPlayerSubscription
}

// var outputFunc = function(rows){console.log(rows[0].getstats)};
// var statsPromise = getStatsPromise('Tom Brady', 2015, 'passing_yds');
// var statsPromise2 = getStatsPromise('Tom Brady', 2014, 'rushing_yds', 'Postseason');
// console.log(statsPromise.then(outputFunc));
// statsPromise2.then(outputFunc);


// console.log(getStatsString('Tom Brady', 2013, 'passing_yds', null, null, null, 3));
// console.log(getStatsString('Tom Brady', 2013, 'passing_yds', "postseason", 3, 5, 3));

// console.log(getStatTypeString("passing_yds+rushing_yds+receiving_yds"))
