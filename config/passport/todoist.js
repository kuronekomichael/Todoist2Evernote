
/**
 * Module dependencies.
 */

var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var config = require('../../config/config');

// see https://developer.todoist.com/appconsole.html
module.exports = new OAuth2Strategy({
        authorizationURL: 'https://todoist.com/oauth/authorize',
        tokenURL: 'https://todoist.com/oauth/access_token',
        callbackURL: 'http://todoist2evernote.herokuapp.com/auth/provider/callback',
        clientID: config.todoist.clientID,
        clientSecret: config.todoist.clientSecret
    },
    function(accessToken, refreshToken, profile, done) {
        console.log('[Auth]>>>>', accessToken);
        done();
    });
