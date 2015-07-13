var Promise = require('bluebird');
var config = require('../config/config');
var nodemailer = require('nodemailer');

function EvernoteMail(userid) {
    //TODO: useridのバリデーション
    this.transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: config.evernote.mailUser,
            pass: config.evernote.mailPass
        }
    });
    this.mailFrom = config.evernote.mailFrom;
    this.mailTo = config.evernote.AddNoteEmailAddress;
};

EvernoteMail.prototype.sendAsync = function(mail) {
    //TODO: ユーザー毎に送信先変更する
    var that = this;

    mail.from = that.mailFrom;
    mail.to = that.mailTo;

    return new Promise(function(resolve, reject) {
        that.transporter.sendMail(mail, function(err, info){
            if (err) {
                return reject(err);
            }
            resolve(true);
        });
    });
};

module.exports = EvernoteMail;
