var request = require('request')
var token = "EAACZCA9ChjZCIBAGaPiOq6YYb0LZCRPiORRrHUbhf9J1MZCv3T3ZApwjAswfDdbaesS3Ohl55dpLg4v9ZBUxCTUqdBZBTgewJ6ZCBSZB7pli7aUALjEfZB9iryw2ixAzUPQkZCn66bovUutVLz52tP2D1gUnytxGLaHaNFKGrGVaW9aVQZDZD"

/**
 *
 * @param sender
 * @param text
 */
function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

/**
 * Gets the user name (FB api call) and then puts it into the DB
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
module.exports.sendTextMessage = sendTextMessage
