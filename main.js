console.log("reached 1")
var fs = require('fs');
// var http = require('http');
// var https = require('https');
var fb_apicalls = require('./fb_apicalls')
// var privateKey  = fs.readFileSync('server.key', 'utf8');
// var certificate = fs.readFileSync('server.crt', 'utf8');
// var caKey = fs.readFileSync('chattt_me_bundle.ca', 'utf8');
var bodyParser = require('body-parser')
// var request = require('request')
// var credentials = {key: privateKey, cert: certificate, ca:caKey};
var express = require('express');
const addMessengerUser = require('./PostgresFunctions/AddMessengerUser')

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

app.post('/webhookverify/', function (req, res) {

    messaging_events = req.body.entry[0].messaging
    var sender = null;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        console.log("received message from "+sender);
        addMessengerUser.addMessengerUser(sender);
        if (event.message && event.message.text) {
            text = event.message.text

            sendMessageToPartner(sender, text);  //Commenting out for demo purposes
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

//EAAXL4nltVEsBAIEL4Gzt1Y2ZCA4mQA1nYSqPPi55AsszH6mAer1mLl7FGZCZA5IxrAwG2NMYfad5ibZCUMpmBl9DR7OfqGZCfbUYTbUg4nKbCARLfAfSYPyIjsEZCovbyD7i2AF4nyv1ZAyoE4mUA97DVfZCSNQMXf0hoobSrTUeUxclXXrkOARkdQKnsVueRN4ZD

// Web hook where the hodor messages get sent to
app.post('/webhookverifysports/', function (req, res) {

    messaging_events = req.body.entry[0].messaging
    var sender = null;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        console.log("received message from " + sender); // Sender is the sender ID we use to send message BACK
        console.log("event is " + JSON.stringify(event));
        if (event.message && event.message.text && !event.message.quick_reply) {
            text = event.message.text
            fb_apicalls.sendTypingDots(sender)  // Sends typing dots of "..."
            witAI.getResponse(sender, text);
            addMessengerUser.addMessengerUser(sender);
        } else if (event.postback && event.postback.payload) {
            text = event.postback.payload
            fb_apicalls.sendTypingDots(sender)  // Sends typing dots of "..."
            witAI.getResponse(sender, text);
            addMessengerUser.addMessengerUser(sender);
        } else if (event.message && event.message.quick_reply && event.message.quick_reply.payload) {  // Quick reply payload
            text = event.message.quick_reply.payload;
            fb_apicalls.sendTypingDots(sender)  // Sends typing dots of "..."
            witAI.getResponse(sender, text);
            addMessengerUser.addMessengerUser(sender);
        }
    }
    res.sendStatus(200)
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

// var httpsServer = https.createServer(credentials, app);
// httpsServer.listen(443);
