var fs = require('fs-extra'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    EvernoteMail = require('../lib/EvernoteMail'),
    embeddedMongoDB = require('@kuronekomichael/node-embedded-mongodb'),
    todoist = require('../app/controllers/todoist');

embeddedMongoDB.silentMode(true);

// start mongod & connect via mongoose
var startMongod = function(done) {
    if (fs.existsSync('./test-db/')) {
        fs.removeSync('./test-db/');
    }
    fs.mkdirpSync('./test-db/');
    embeddedMongoDB.start('./test-db/', './test-db/logs', function() {
        var uri = 'mongodb://localhost:27017';
        var opt = { server: { socketOptions: { keepAlive: 1 } } };
        mongoose.connect(uri, opt, done);
    });
};

// disconnect mongoose & stop mongod
var stopMongod = function(done) {
    mongoose.disconnect(function() {
        embeddedMongoDB.stop(function() {
            fs.remove('./test-db/', done);
        });
    });
};

// disconnect mongoose & stop mongod
var stopMongodDebug = function(done) {
    mongoose.disconnect(function() {
        embeddedMongoDB.stop(function() {
            //$ mongod --dbpath ./test-db
            done();
        });
    });
};

describe('Todoist item:completed', function() {

    var _sendAsync;
    before(function() {
        // mock
        _sendAsync = EvernoteMail.prototype.sendAsync;
        EvernoteMail.prototype.sendAsync = function(mail) {
            var that = this;
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(true);
                }, 1);
            });
        };
    });
    after(function() {
        EvernoteMail.prototype.sendAsync = sendAsyncMock = _sendAsync;
    });

    // Start mongod & connect via mongoose
    before(startMongod);

    // Insert some fake notes
    before(function(done) {
        return Promise.all([
            todoist.note.added({id:991, item_id:10, content:'A\nB', posted:'Mon 13 Jul 2015 11:50:24 +0000'}),
            todoist.note.added({id:992, item_id:11, content:'C\nD', posted:'Tue 14 Jul 2015 12:51:25 +0000'}),
            todoist.note.added({id:993, item_id:10, content:'E\nF', posted:'Wed 15 Jul 2015 10:52:36 +0000'})
        ]).then(function() {
            done();
        });
    });

    // Disconnect & stop mongod &
    //after(stopMongodDebug);
    after(stopMongod);

    it('succeeds in sending the email to save at evernote', function(done) {
        var data = {
            "due_date":"Thu 16 Jul 2015 14:00:00 +0000",
            "assigned_by_uid":3609148,
            "due_date_utc":"Thu 16 Jul 2015 14:00:00 +0000",
            "is_archived":0,
            "labels":[318270],
            "sync_id":null,
            "in_history":0,
            "checked":0,
            "date_added":"Fri 06 Mar 2015 00:39:02 +0000",
            "date_lang":"en",
            "id":10,
            "priority":1,
            "indent":1,
            "user_id":3609148,
            "is_deleted":0,
            "content":"\u2702\ufe0f !!\u71c3\u3048\u308b\u3054\u307f!! \u306e\u65e5",
            "item_order":5,
            "responsible_uid":null,
            "project_id":136971683,
            "collapsed":0,
            "date_string":"every mon, thu at 23:00"
        };
        todoist.item.completed(data, function(err) {
            if (err) {
                console.error(err.stack);
            }
            expect(err).is.not.ok;
            done();
        });
    });
});
