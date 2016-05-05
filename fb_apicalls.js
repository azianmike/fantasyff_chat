var request = require('request')
var token = "EAACZCA9ChjZCIBAGaPiOq6YYb0LZCRPiORRrHUbhf9J1MZCv3T3ZApwjAswfDdbaesS3Ohl55dpLg4v9ZBUxCTUqdBZBTgewJ6ZCBSZB7pli7aUALjEfZB9iryw2ixAzUPQkZCn66bovUutVLz52tP2D1gUnytxGLaHaNFKGrGVaW9aVQZDZD"

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

function getUserName(sender) {
    console.log('getting name...')
    request({
        url: 'https://graph.facebook.com/v2.6/'+sender+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token,
        method: 'GET',
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        } else
        {
            var bodyJSON = JSON.parse(body)
            console.log('name=='+bodyJSON.first_name);
        }
    })
}

module.exports.getUserName = getUserName
module.exports.sendTextMessage = sendTextMessage
