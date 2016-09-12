// include file system
var fs = require('fs')
// include configs
var config = require('./config');

// set args
var args = {
    "language": "en",
    "analyzerIds": [
        "08ea174b-bfdb-4e64-987e-602f85da7f72",
        "4fa79af1-f22c-408d-98bb-b7d7aeef7f04"],
    "text": ""
};

var rp = require('request-promise');

var options = {
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': config.OcpApimSubscriptionKey
    },
    method: 'POST',
    uri: 'https://api.projectoxford.ai/linguistics/v1.0/analyze',
    body: args,
    json: true // Automatically stringifies the body to JSON
};

var dict;

fs.readFile('./dict.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    dict = JSON.parse(data);
});

var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'cdce3b5b-a642-4fec-90e7-e827fed2af19',
    appPassword: 'J6kCS2WHTpkvvas5gLEQigE'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
        function (session) {
            builder.Prompts.text(session, 'Hi! Enter sentence to rephrase:	');
        },
        function (session, results) {
            args["text"] = results.response;

            rp(options)
                .then(function (parsedBody) {

                    var rephrased = "";

                    var tokens = parsedBody[0].result[0].Tokens;
                    var posTags = parsedBody[1].result[0];

                    for (var i = 0; i < tokens.length; i++) {
                        var thisPosTag = posTags[i];
                        rephrased += dict[thisPosTag][Math.floor(Math.random()*dict[thisPosTag].length)].toLowerCase();
                        rephrased += " ";
                    }

                    session.send(rephrased);

                    session.endDialog();
                    session.beginDialog('/');
                })
                .catch(function (err) {
                    console.dir(err, {depth: null, colors: true});
                });

        }
    ]
);