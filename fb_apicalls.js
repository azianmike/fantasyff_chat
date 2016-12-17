var request = require('request')
var token = "EAAJRYaZBz8mABAAMFg8eZCP7ZCnNGWVudg9ZCTeeL47CAnCAIq7OwxdzhmlyZCUTToAZARAOr9Kt314ZB6Ginnns0MUCgjFyM1LOyEvkiZAABkupLVDvfNWjzwuQJZCpizoIt5CS8lijy8dU6R06lhNlZABdqK0skCzIxNPCkTgLfnwAZDZD"

var sportsBotToken = 'EAADIe0RCeBwBAGNgnuoKaACZA2c6XIXW0tPOO2n1tsibUoYsLypAoWGopoyKbYXJhNbpQFxIFcDcm59er4b5UIWvoBFn85ZAZA3ZBcIAMdeCSgGZB75Ak5RaZAhYsCq7v6pDT8AtdZCaq5uwGny8eeNwOd7BSWUq0iGKLHAJcHBXgZDZD'

/**
 *
 * @param sender
 * @param text
 */
function sendTextMessageForSportsBot(sender, text) {
    console.log("Trying to send FB message to " + sender + " - " + text)
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
