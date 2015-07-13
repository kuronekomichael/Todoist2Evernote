var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var config = require('./config/config');
var express = require('express');
var todoist = require('./app/controllers/todoist');
var passport = require('passport');
var mongoose = require('mongoose');

var app = express();
var port = process.env.PORT || 3000;

// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', console.error);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(path.join(__dirname, 'app/models')).forEach(function (file) {
    if (/\.js$/i.test(file)) {
        require(path.join(__dirname, 'app/models', file));
    }
});

require('./config/passport')(passport, config);
require('./config/express')(app, passport);

// The OAuth 2.0 provider has redirected the user back to the application.
// Finish the authentication process by attempting to obtain an access token.
// If authorization was granted, the user will be logged in.
// Otherwise, authentication has failed.
app.get('/auth/provider/callback', passport.authenticate('provider', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/provider', passport.authenticate('provider', { scope: 'data:read' }));

app.get('/', function (req, res) { res.send('Here is index-page! <a href="/login">login</a>'); });
app.get('/login', function (req, res) { res.send('Here is login-page! <a href="/auth/provider">auth todoist</a>'); });
app.post('/notify', function(req, res) {
    // verify request
    var shasum = crypto.createHmac('sha256', config.todoist.clientSecret);
    shasum.update(req.body);
    var digest = shasum.digest('base64');

    if (digest !== req.headers['x-todoist-hmac-sha256']) {
        console.error('Invalid Request - sha256 not matched.', digest, req.headers['x-todoist-hmac-sha256']);
        res.send(403);
        return;
    }

    var body = JSON.parse(req.body);

    console.log('/nofity');
    if (body.length) {
        body.forEach(function(evt) {
            console.log(evt.event_name, evt.user_id);
            //console.log(evt.eventa_data);
        });
    }
    var data = body.length ? body : [body];
    todoist.save(data, function(err) {
        console.log('/nofity res 200-OK');
        if (err) {
            console.error('/nofity error', err, err.stack);
        }
        res.send('200OK');
    });
});

app.listen(port, function () {
    var serverInfo = this.address();
    console.log('App listening at http://%s:%s', serverInfo.address, serverInfo.port);
});

module.exports = app;
