var request = require('request')
var token = "EAAXL4nltVEsBAJEXZCvuoEpAsRCb2E6YawTpiRz1ZA4cZBkpIWfDZAEP4PEZBDl0AilVsrbGFF23kCw54zy7vuJV4rZAbMrt57JffJw4rtKBueWG89REBlocD4o2n6EZBZC78U3fpHjZBHacMZAGb1QQjH1zeHWQpZBLxk1NYugRzIlomgY4C8vNt2UYMYTCaiXNm8ZD"

// var sportsBotToken = 'EAAXL4nltVEsBAHYI4qKTqMJXlpobM85drZApMiTVOY1UH52g0LA6rRwFgON5Pun3T6ZBvY4EJu1ZBOhFOAR64w2t2k8MRCZBiX4smjkrI318lzXc3eZBF375RPiuBUfBOEk2zUqWsRS8m3eKPOGtPGM80t8ngcIMiV5UfVnNlngZDZD'
// For page FantasyScout
var sportsBotToken = 'EAAXL4nltVEsBAJEXZCvuoEpAsRCb2E6YawTpiRz1ZA4cZBkpIWfDZAEP4PEZBDl0AilVsrbGFF23kCw54zy7vuJV4rZAbMrt57JffJw4rtKBueWG89REBlocD4o2n6EZBZC78U3fpHjZBHacMZAGb1QQjH1zeHWQpZBLxk1NYugRzIlomgY4C8vNt2UYMYTCaiXNm8ZD';

// var winston = require('winston');
// require('winston-loggly');
//
// var log = new (winston.Logger)({
//     transports: [
//         new (winston.transports.Console)(),
//         new (winston.transports.Loggly)( {
//             token: "eefdcc8d-96ac-44c9-b61f-cce64d15d027",
//             subdomain: "sportschat",
//             tags: ["Winston-NodeJS"],
//             json:true,
//             handleExceptions: true,
//             withStack: true
//         })
//     ]
// });

/**
 *
 * @param sender
 * @param text
 */
function sendTextMessageForSportsBot(sender, text) {
    if(sender <= 123) // Test user
    {
        return;
    }
    turnTypingDotsOff(sender);

    console.log("Trying to send FB message to " + sender + " - " + text)
    // log.info({"sender":sender, "text":text})
    if( sender && text ) {
        messageData = {
            text: text
        }
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: sportsBotToken},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData,
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }
}

function sendTypingDots(userID){
    console.log("Sending typing dots to " + userID);
    if( userID ) {

        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: sportsBotToken},
            method: 'POST',
            json: {
                recipient: {
                    id: userID
                },
                sender_action: "typing_on"
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }
}

function turnTypingDotsOff(userID){
    console.log("Sending typing dots to " + userID);
    if( userID ) {

        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: sportsBotToken},
            method: 'POST',
            json: {
                recipient: {
                    id: userID
                },
                sender_action: "typing_off"
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }
}

/**
 * Sends quick replies to FB messenger
 * @param userID
 * @param text
 * @param quick_replies MUST BE an array of quick replies
 */
function sendQuickReplies(sender, text, quick_replies){
    turnTypingDotsOff(sender);

    console.log("Trying to send FB quick replies to " + sender + " - " + text)
    // log.info({"sender":sender, "text":text})
    if( sender && text ) {
        messageData = {
            text: text,
            quick_replies:quick_replies
        }
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: sportsBotToken},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData,
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }

}

/**
 * Gets the user name (FB api call) and then puts it into the DB, means it is their first time
 *
 * @param userIDToGetNameFor
 * @param db
 */
function getUserName(userIDToGetNameFor, message, db, callback) {
    console.log('getting name...')
    request({
        url: 'https://graph.facebook.com/v2.6/' + userIDToGetNameFor + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + token,
        method: 'GET',
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        } else {
            var bodyJSON = JSON.parse(body)
            console.log('name==' + bodyJSON.first_name);
            var fullName = bodyJSON.first_name + " " + bodyJSON.last_name;
            var insertUserName = db.collection('user_names');
            console.log("inserted users name into db")
            insertUserName.insert({'userID': userIDToGetNameFor, 'usersName': fullName})
            if( callback != null )
            {
                callback(userIDToGetNameFor, message)
            }
            else
            {
                console.log('callback is null')
            }
            db.close()

        }

    })
}

module.exports.getUserName = getUserName
module.exports.sendTextMessage = sendTextMessageForSportsBot
module.exports.sendTypingDots = sendTypingDots
module.exports.sendQuickReplies = sendQuickReplies
