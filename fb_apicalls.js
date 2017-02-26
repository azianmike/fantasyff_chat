var request = require('request')
var token = "EAAJRYaZBz8mABAAMFg8eZCP7ZCnNGWVudg9ZCTeeL47CAnCAIq7OwxdzhmlyZCUTToAZARAOr9Kt314ZB6Ginnns0MUCgjFyM1LOyEvkiZAABkupLVDvfNWjzwuQJZCpizoIt5CS8lijy8dU6R06lhNlZABdqK0skCzIxNPCkTgLfnwAZDZD"

var sportsBotToken = 'EAAXL4nltVEsBAHYI4qKTqMJXlpobM85drZApMiTVOY1UH52g0LA6rRwFgON5Pun3T6ZBvY4EJu1ZBOhFOAR64w2t2k8MRCZBiX4smjkrI318lzXc3eZBF375RPiuBUfBOEk2zUqWsRS8m3eKPOGtPGM80t8ngcIMiV5UfVnNlngZDZD'

var Logger = require('le_node');
var log = new Logger({
    token:'b07ae47b-c124-4387-9f58-8870b66a570a'
});

/**
 *
 * @param sender
 * @param text
 */
function sendTextMessageForSportsBot(sender, text) {
    console.log("Trying to send FB message to " + sender + " - " + text)
    log.info({"sender":sender, "text":text})
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
                    id: recipient
                },
                sender_action: senderAction
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
