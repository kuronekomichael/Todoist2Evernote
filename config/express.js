var express = require('express');
var bodyParser = require('body-parser');
var config = require('../config/config');

module.exports = function (app, passport) {
    // Static files middleware
    app.use(express.static(config.root + '/public'));

    // bodyParser should be above methodOverride
    //app.use(bodyParser.json());
    app.use(bodyParser.text({ type: 'application/json' }))
    app.use(bodyParser.urlencoded({ extended: true }));
};
