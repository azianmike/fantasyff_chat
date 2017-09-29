/**
 * Created by michaell on 9/26/17.
 */

const config = require('../PostgresFunctions/PostgresConfig');
const fb_apicalls = require('../fb_apicalls')


function sendMessengerNotificationsOut() {
    var queryString = 'select * from GetNotificationsToSend();';

    config.executePostgresQuery(queryString).then(processNotifications());
}

function processNotifications(rows) {
    if(rows) {
        for (var notifToSend of rows){
            var stringToSend = constructNotificationToSendString(notifToSend);
            fb_apicalls.sendTextMessage(notifToSend.messengersenderidstosend, stringToSend);
        }
    }
}

function constructNotificationToSendString(notif) {
    if(notif) {
        var returnString = "Alert! " + notif.playername + " just got a touchdown! Currently has " +
                notif.touchdowns + " tds"
        if(notif.passing_yards && notif.passing_yards > 5) {
            returnString += ", " + notif.passing_yards + " passing yds"
        }

        if(notif.yards && notif.yards > 5) {
            returnString += ", " + notif.passing_yards + " rushing and receiving yds"
        }

    }

    return returnString;
}

sendMessengerNotificationsOut();