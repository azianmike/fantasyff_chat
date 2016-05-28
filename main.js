var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var caKey = fs.readFileSync('chattt_me_bundle.ca', 'utf8');
var bodyParser = require('body-parser')
var request = require('request')
var credentials = {key: privateKey, cert: certificate, ca:caKey};
var express = require('express');
var app = express();
var sendMessageToPartner = require('./mongodb').sendMessageToPartner;

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.get('/', function (req, res) {
  res.send('Hello World!');
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
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        console.log("received message from "+sender);
        if (event.message && event.message.text) {
            text = event.message.text
            sendMessageToPartner(sender, message);
            // sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})


app.get('/webhookverifyhodor/', function (req, res) {
    console.log('entered')
    if (req.query['hub.verify_token'] === 'chattt_verify_token') {
        res.send(req.query['hub.challenge'])
    }
    res.send('error')
})

app.post('/webhookverifyhodor/', function (req, res) {

    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        console.log("received message from "+sender);
        if (event.message && event.message.text) {
            var hodorString = "Hodor"
            var howManyHodors = Math.floor((Math.random() * 10) + 1);
            for (i = 0; i < howManyHodors; i++) {
                hodorString += " hodor"
            }

            hodorString += "."
            sendTextMessage(sender, hodorString);
            // sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})


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

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);
