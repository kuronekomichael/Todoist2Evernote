var fs = require('fs-extra'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    embeddedMongoDB = require('@kuronekomichael/node-embedded-mongodb'),
    todoist = require('../app/controllers/todoist');

embeddedMongoDB.silentMode(true);

describe('Make text for the item completed', function() {

    before(function() {
        var today = moment("2015-01-22T13:33:12");
        this.clock = sinon.useFakeTimers(today.valueOf());
    });

    after(function() {
        this.clock.restore();
    });

    it('makes it', function() {
        var subject = '[Todoist Completed] 図書館に本を返却する at 2015/01/22 13:33:12 @910.Todoist #Todoist';
        var html = '<style>' +
            'pre {' +
            '    border: 1px solid silver;' +
            '    margin-bottom: 0;' +
            '    padding: 1em;' +
            '}' +
            'article div {' +
            '    font-size: .7em;' +
            '    text-align: right;' +
            '}' +
            '</style>' +
            '<h1>図書館に本を返却する</h1>' +
            '<div>id=27586900,project_id=124445,priority=2</div>' +
            '<div>Created at:<date>2014/11/10 15:23:11</date></div>' +
            '<div>DateString is:<date>every mon, thu at 23:00</date></div>' +
            '<hr/>' +
            '<h4>Notes</h4>' +
            '<article>' +
            '<pre>content: ５冊\n' +
            '①オブジェクト指向入門 [1] 2015/04/02 2015/05/01\n' +
            '②オブジェクト指向入門 [2] 2015/04/02 2015/05/01\n' +
            '③エンジニアのための図解思考再入門講座 2015/04/02 2015/05/01\n' +
            '④「しなやか脳」でストレスを消す技術 2015/04/02 2015/05/01\n' +
            '⑤朝、スッキリ目覚め「いい眠りだったな」とつい言ってしまう本</pre>' +
            '<div>Noted at <date>2014/11/10 15:23:11</date></div>' +
            '</article>' +
            '<article>' +
            '<pre>MauMau!!!</pre>' +
            '<div>Noted at <date>2014/11/15 10:25:59</date></div>' +
            '</article>';

        var item = {
            id: 27586900,
            priority: 2,
            project_id: 124445,
            date_added: "Mon 10 Nov 2014 06:23:11 +0000",
            date_string: 'every mon, thu at 23:00',
            content: '図書館に本を返却する',
        };
        var notes = [
            {
                content: 'content: ５冊\n' +
                    '①オブジェクト指向入門 [1] 2015/04/02 2015/05/01\n' +
                    '②オブジェクト指向入門 [2] 2015/04/02 2015/05/01\n' +
                    '③エンジニアのための図解思考再入門講座 2015/04/02 2015/05/01\n' +
                    '④「しなやか脳」でストレスを消す技術 2015/04/02 2015/05/01\n' +
                    '⑤朝、スッキリ目覚め「いい眠りだったな」とつい言ってしまう本',
                posted: moment("2014-11-10T15:23:11").toISOString()
            },
            {
                content: 'MauMau!!!',
                posted: moment("2014-11-15T10:25:59").toISOString()
            }
        ];

        var mail = todoist.item.makeCompletedItemMail(item, notes);

        var toString = function(str) {
            return str
                    .replace(/\s*$/mg, '')
                    .replace(/^\s*/mg, '');
        };

        expect(mail.subject).is.equals(subject);
        expect(toString(mail.html)).is.equals(toString(html));
    });
});

describe('Todoist proceed', function() {
    var stubItemCompleted;

    before(function() {
        var done = function(json, done) {
            setTimeout(done, 1);
        };
        stubItemCompleted = sinon.stub(todoist.item, "completed", done);
        stubNoteAdded = sinon.stub(todoist.note, "added", done);
        stubNoteUpdated = sinon.stub(todoist.note, "updated", done);
        stubNoteDeleted = sinon.stub(todoist.note, "deleted", done);
    });
    after(function() {
        stubItemCompleted.restore();
        stubNoteAdded.restore();
        stubNoteUpdated.restore();
        stubNoteDeleted.restore();
    });

    it('Call the target method each event', function(done) {
        todoist.save([
            {event_name:'item:completed'},
            {event_name:'note:added'},
            {event_name:'note:updated'},
            {event_name:'note:deleted'}
        ], function() {
            expect(todoist.item.completed.calledOnce).is.true;
            expect(todoist.note.added.calledOnce).is.true;
            expect(todoist.note.updated.calledOnce).is.true;
            expect(todoist.note.deleted.calledOnce).is.true;
            done();
        });
    });
});

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


describe('Todoist note:added', function() {

    // start mongod & connect via mongoose
    before(startMongod);

    // disconnect mongoose & stop mongod
    after(stopMongod);

    it('succeeds in adding a note', function(done) {
        var Note = mongoose.model('Note');
        var data = {
            is_deleted: 0,
            is_archived: 0,
            content: "\u3093\u3075\u3075\u3075\n\u3075\u3075\u3075",
            posted_uid: 3609148,
            uids_to_notify: null,
            item_id: 48961841,
            project_id: 136971682,
            id: 10680526,
            posted: "Mon 13 Jul 2015 11:50:24 +0000"
        };
        todoist.note.added(data, function(err) {
            expect(err).is.not.ok;

            Note.find().then(function(docs) {
                expect(docs.length).is.equals(1);

                var note = docs.pop();
                expect(note.content).is.equals(data.content);
                expect(note.is_deleted).is.equals(data.is_deleted);
                expect(note.is_archived).is.equals(data.is_archived);
                expect(note.item_id).is.equals("" + data.item_id);
                expect(note.posted.toString()).is.equals(new Date(data.posted).toString());
                done();
            }).catch(function(err) {
                done(err);
            });
        });
    });

    it('fails in adding a note because these IDs are duplicated', function(done) {
        var duplicateData = {
            id: 10680526
        };
        todoist.note.added(duplicateData, function(err) {
            
            expect(err).is.ok;
            expect(err.toString()).is.match(/duplicate key error/);
            done();
        });
    });
});

describe('Todoist note:updated', function() {

    // start mongod & connect via mongoose
    before(startMongod);

    // disconnect & stop mongod &
    after(stopMongod);

    it('succeeds in updating a note with Promise', function(done) {
        var Note = mongoose.model('Note');

        var data = {
            is_deleted: 0,
            is_archived: 0,
            content: "\u3093\u3075\u3075\u3075\n\u3075\u3075\u3075",
            posted_uid: 3609148,
            uids_to_notify: null,
            item_id: 48961841,
            project_id: 136971682,
            id: 10680526,
            posted: "Mon 13 Jul 2015 11:50:24 +0000"
        };

        var updatedData = {
            is_deleted: 1,
            is_archived: 2,
            content: "だばだば",
            posted_uid: 3609149,
            uids_to_notify: null,
            item_id: 48961841,
            project_id: 136971682,
            id: 10680526,
            posted: "Mon 14 Jul 2015 11:50:24 +0000"
        };

        // まずは登録
        todoist.note.added(data).then(function() {
            return Note.findOne({ id: "10680526" })
        }).then(function(doc) {
            // 正常に登録されたっぽい
            expect(doc.id).is.equals("10680526");
            expect(doc.content).is.equals(data.content);

            //TODO: 次に更新
            return todoist.note.updated(updatedData);
        }).then(function() {
            return Note.findOne({id: "10680526"});
        }).then(function(note) {
            // 結果的に更新されていることをテスト！
            expect(note.id).is.equals("10680526");
            expect(note.is_deleted).is.equals(updatedData.is_deleted);
            expect(note.is_archived).is.equals(updatedData.is_archived);
            expect(note.content).is.equals(updatedData.content);
            expect(note.posted.toString()).is.equals(new Date(updatedData.posted).toString());
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it('succeeds in updating a note without Promise', function(done) {
        var Note = mongoose.model('Note');

        var moreUpdatedData = {
            is_deleted: 3,
            is_archived: -1,
            content: "どばどば",
            posted_uid: 3609149,
            uids_to_notify: null,
            item_id: 48961841,
            project_id: 136971682,
            id: 10680526,
            posted: "Mon 15 Jul 2015 11:50:24 +0000"
        };

        todoist.note.updated(moreUpdatedData, function(err) {
            expect(err).is.not.ok;
            Note.findOne({id: "10680526"}, function(err, note) {
                expect(err).is.not.ok;
                // 結果的に更新されていることをテスト！
                expect(note.id).is.equals("10680526");
                expect(note.is_deleted).is.equals(moreUpdatedData.is_deleted);
                expect(note.is_archived).is.equals(moreUpdatedData.is_archived);
                expect(note.content).is.equals(moreUpdatedData.content);
                expect(note.posted.toString()).is.equals(new Date(moreUpdatedData.posted).toString());
                done();
            });
        });
    });

    it('cannot update with promise because ID is not found', function(done) {
        var invalidUpdatedData = {
            is_deleted: 1,
            is_archived: 2,
            content: "だばだば",
            posted_uid: 3609149,
            uids_to_notify: null,
            item_id: 48961841,
            project_id: 136971682,
            id: 10680999,
            posted: "Mon 14 Jul 2015 11:50:24 +0000"
        };

        todoist.note.updated(invalidUpdatedData).then(function() {
            throw new Error('no errors occured');
        }, function(err) {
            expect(err).is.match(/nothing updated/i);
        }).finally(done);
    });

    it('cannot update without promise because ID is not found', function(done) {
        var invalidUpdatedData = {
            is_deleted: 1,
            is_archived: 2,
            content: "だばだば",
            posted_uid: 3609149,
            uids_to_notify: null,
            item_id: 48961841,
            project_id: 136971682,
            id: 10680999,
            posted: "Mon 14 Jul 2015 11:50:24 +0000"
        };

        todoist.note.updated(invalidUpdatedData, function(err) {
            expect(err).is.match(/nothing updated/i);
            done();
        });
    });
});

describe('Todoist note:deleted', function() {

    // start mongod & connect via mongoose
    before(startMongod);

    before(function(done) {
        return Promise.all([
            todoist.note.added({id:12345, content:'Hasta la vista'}),
            todoist.note.added({id:56789, content:'Baby, good night'})
        ]).then(function() {
            done();
        });
    });

    // disconnect & stop mongod &
    after(stopMongod);

    it('succeeds in deleting the note with promise', function(done) {
        todoist.note.deleted({id: 12345}, function(err) {
            expect(err).is.not.ok;
            done();
        });
    });
    it('succeeds in deleting the note without promise', function(done) {
        todoist.note.deleted({id: 56789}).then(function(){
            done();
        }, done);
    });
    it('fails in deleting the note with promise because ID is blank', function(done) {
        todoist.note.deleted({id: 99999}, function(err) {
            try {
                expect(err).is.ok;
                expect(err).is.match(/nothing deleted/i);
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it('fails in deleting the note without promise because ID is blank', function(done) {
        todoist.note.deleted({id: 99999}).then(function() {
            done(new Error('no errors occured'));
        }, function(err) {
            try {
                expect(err).is.match(/nothing deleted/i);
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});
