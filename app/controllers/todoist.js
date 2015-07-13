var moment = require('moment'),
    Promise = require('bluebird'),
    mongoose = require('mongoose');

var Note = require('../models/note');
var EvernoteMail = require('../../lib/EvernoteMail');
var config = require('../../config/config');

var Todoist = {
    item: {},
    note: {}
};

Todoist.save = function(json, cb) {
    Promise.all(json.map(function(event) {
        var store;
        var obj;
        if (event.event_name === 'item:completed') {
            obj = Todoist.item;
            store = Todoist.item.completed;
        } else if (event.event_name === 'note:added') {
            obj = Todoist.note;
            store = Todoist.note.added;
        } else if (event.event_name === 'note:updated') {
            obj = Todoist.note;
            store = Todoist.note.updated;
        } else if (event.event_name === 'note:deleted') {
            obj = Todoist.note;
            store = Todoist.note.deleted;
        } else {
            console.error('Receive unknown events:', event);
            return;
        }
        return new Promise(function(resolve, reject) {
            store.apply(obj, [event.event_data, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            }]);
        });
    })).then(function() {
        cb(null);
    }).catch(function(err) {
        cb(err);
    });
};

var TODOIST_DATE_FORMAT = 'ddd DD MMM YYYY HH:mm:ss ZZ';
var DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

// itemとnotesをベースに、メールタイトルや本文を作成する
Todoist.item.makeCompletedItemMail = function(item, notes) {
    if (!notes) notes = [];
    var subject = '[Todoist Completed] ' + item.content + ' at ' + moment().format(DATE_FORMAT) + ' ' + config.evernote.notebook + ' ' + config.evernote.tag;
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
        '<h1>' + item.content + '</h1>' +
        '<div>id=' + item.id + ',project_id=' + item.project_id + ',priority=' + item.priority + '</div>' +
        '<div>Created at:<date>' + moment(item.date_added, TODOIST_DATE_FORMAT).format(DATE_FORMAT) + '</date></div>' +
        '<div>DateString is:<date>' + item.date_string + '</date></div>' +
        '<hr/>' +
        '<h4>Notes</h4>';

    html += notes.map(function(note) {
        return '<article><pre>' + note.content + '</pre><div>Noted at <date>' + moment(note.posted).format(DATE_FORMAT) + '</date></div></article>';
    }).join('');

    return {subject:subject, html:html};
};

Todoist.item.completed = function(item, done) {
    var that = this;

    var itemCompletedPromise = new Promise(function(resolve, reject) {
        var notesCount;

        // item_idのマッチする全てのnoteを取得する
        Note.find({item_id: item.id}).then(function(notes) {
            notesCount = notes.length;
            return that.makeCompletedItemMail(item, notes);
        // noteとitemを使って記事を作成
        }).then(function(text) {
            var evernoteMail = new EvernoteMail(item.user_id);
            return evernoteMail.sendAsync(text);
        // メールで送信する
        }).then(function(ret) {
            if (!ret) {
                throw new Error('fail to evernoteMail.send');
            }
            return Note.update({item_id: "" + item.id}, {$set: {is_send: true}}, {multi: true});
        // メール送信が完了したら、ノートすべてに送信済みをマークする
        }).then(function(ret) {
            if (ret.ok !== 1) {
                throw new Error('cannot update. mongoose.update returns ret.ok=' + ret.ok);
            } else if (notesCount !== ret.nModified) {
                throw new Error('cannot update. mongoose.update returns ret.nModified = ' + ret.nModified + ', but expects is ' + notesCount);
            }
            resolve();
        }).catch(reject);
    });

    if (done) {
        itemCompletedPromise.then(done, done);
    } else {
        return itemCompletedPromise;
    }
};

Todoist.note.added = function(data, done) {
    if (done) {
        return new Note(data).save(done);
    } else {
        return new Promise(function(resolve, reject) {
            new Note(data).save(function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
};

Todoist.note.updated = function(data, done) {
    if (!data) {
        throw new Error('updater is blank');
    }
    if (!data.id) {
        throw new Error('updater.id is not found');
    }
    var checkResult = function(ret) {
        if (ret.ok !== 1) {
            throw new Error('cannot update. mongoose.update returns ret.ok=' + ret.ok);
        } else if (1 > ret.nModified) {
            throw new Error('Nothing updated');
        }
        return ret;
    };

    var updatePromise = Note.update({id: data.id}, {$set: data});
    if (done) {
        updatePromise.then(function(ret) {
            var error = null;
            try {
                checkResult(ret);
            } catch(err) {
                error = err;
            }
            done(error);
        }, done);
    } else {
        return new Promise(function(resolve, reject) {
            updatePromise.then(function(ret) {
                checkResult(ret);
                resolve(null);
            }).catch(reject);
        });

    }
};

Todoist.note.deleted = function(data, done) {
    var removePromise = new Promise(function(resolve, reject) {
        Note.remove({id: data.id}).then(function(ret) {
            if (ret.result.ok !== 1) {
                reject(new Error('cannot deleted: ' + ret));
                return;
            }
            if (0 >= ret.result.n) {
                reject(new Error('Nothing deleted'));
                return;
            }
            resolve(null);
        }, reject);
    });

    if (done) {
        removePromise.then(done, done);
    } else {
        return removePromise;
    }
};

module.exports = Todoist;
