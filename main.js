var fs = require('fs');
var http = require('http');
var https = require('https');
var fb_apicalls = require('./fb_apicalls')
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var caKey = fs.readFileSync('chattt_me_bundle.ca', 'utf8');
var bodyParser = require('body-parser')
var request = require('request')
var credentials = {key: privateKey, cert: certificate, ca:caKey};
var express = require('express');
var app = express();
var sendMessageToPartner = require('./mongodb').sendMessageToPartner;
// Set up wit AI stuff
var Wit = null;
var interactive = null;
try {
    // if running from repo
    Wit = require('../').Wit;
    interactive = require('../').interactive;
} catch (e) {
    Wit = require('node-wit').Wit;
    interactive = require('node-wit').interactive;
}
var witAI = require('./witai')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/privacypolicy', function (req, res) {
    res.sendfile('privacypolicy.htm');
});

app.get('/random/', function (req, res) {
  res.send('got random URL');
});

app.get('/webhookverify/', function (req, res) {
    console.log('entered')
    if (req.query['hub.verify_token'] === 'chattt_verify_token') {
        res.send(req.query['hub.challenge'])
    }
    res.send('error')
})

app.post('/webhookverify/', function (req, res) {

    messaging_events = req.body.entry[0].messaging
    var sender = null;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        console.log("received message from "+sender);
        if (event.message && event.message.text) {
            text = event.message.text

            sendMessageToPartner(sender, text);  //Commenting out for demo purposes
        }
    }

    res.sendStatus(200)
})

/**
 * Checks if the message sent is a specific chat function (i.e. get a new person to chat, leave current chat, etc)
 * @param userID userID of who sent the specific chat function
 * @param message message of the user (to check if it is a function)
 */
function isChatFunction(userID, message){
    switch (message.toLowerCase())
    {
        case "/newchat":
            // Currently just implementing for demo purposes
            sendTextMessage(sender, "You are now connected to a new chat with Alex K.!")
            return true;
            break;

        case "/leave":
            // Currently just implementing for demo purposes
            sendTextMessage(sender, "You have left the chat. Type /newchat for a new chat!")
            return true;
            break;
        default:
            return false;
    }
}

// Web hook to verify the hodor path
app.get('/webhookverifyhodor/', function (req, res) {
    console.log('entered')
    if (req.query['hub.verify_token'] === 'chattt_verify_token') {
        res.send(req.query['hub.challenge'])
    }
    res.send('error')
})

// Web hook where the hodor messages get sent to
app.post('/webhookverifyhodor/', function (req, res) {

    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        console.log("received message from "+sender); // Sender is the sender ID we use to send message BACK
        if (event.message && event.message.text) {
            text = event.message.text

            // var hodorString = "Hodor"
            // var howManyHodors = Math.floor((Math.random() * 10) + 1);
            // for (i = 0; i < howManyHodors; i++) {
            //     hodorString += " hodor"
            // }
            //
            // hodorString += "."
            // sendHodorTextMessage(sender, hodorString);

            /**
             * Testing out Wit.ai stuff
             */
            witAI.getResponse(sender, text);

        }
    }
    res.sendStatus(200)
})

// Web hook to verify the hodor path
app.get('/webhookverifysports/', function (req, res) {
    console.log('entered')
    if (req.query['hub.verify_token'] === 'chattt_verify_token') {
        res.send(req.query['hub.challenge'])
    }
    res.send('error')
})

// Web hook where the hodor messages get sent to
app.post('/webhookverifysports/', function (req, res) {

    messaging_events = req.body.entry[0].messaging
    var sender = null;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        console.log("received message from " + sender); // Sender is the sender ID we use to send message BACK
        console.log("event is " + JSON.stringify(event));
        if (event.message && event.message.text) {
            text = event.message.text
            fb_apicalls.sendTypingDots(sender)  // Sends typing dots of "..."
            witAI.getResponse(sender, text);
        } else if (event.postback && event.postback.payload) {
            text = event.postback.payload
            fb_apicalls.sendTypingDots(sender)  // Sends typing dots of "..."
            witAI.getResponse(sender, text);
        }
    }
    res.sendStatus(200)
})

var hodorToken = "EAAJRYaZBz8mABAAMFg8eZCP7ZCnNGWVudg9ZCTeeL47CAnCAIq7OwxdzhmlyZCUTToAZARAOr9Kt314ZB6Ginnns0MUCgjFyM1LOyEvkiZAABkupLVDvfNWjzwuQJZCpizoIt5CS8lijy8dU6R06lhNlZABdqK0skCzIxNPCkTgLfnwAZDZD"

function sendHodorTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:hodorToken},
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

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

// var httpsServer = https.createServer(credentials, app);
// httpsServer.listen(443);
