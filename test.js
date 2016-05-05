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

var fb_apicalls = require('./fb_apicalls');

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.get('/', function (req, res) {
  res.send('Hello World!');
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
        console.log('got message from '+JSON.stringify(event.sender))
        if (event.message && event.message.text) {
            text = event.message.text
            fb_apicalls.sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})


app.listen(80, function () {
  console.log('Example app listening on port 80!');
});

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);
