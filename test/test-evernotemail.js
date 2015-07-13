var EvernoteMail = require('../lib/EvernoteMail');
var config = require('../config/config');

describe('Send a mail to Evernote', function() {
    var evernoteMail;

    before(function() {
        config.evernote.mailUser = 'sample.example@gmail.com';
        config.evernote.mailPass = 'u2Uqu7XBhQEDbBxA';
        config.evernote.mailFrom = 'todoist2evernote <writer@todoist2evernote.herokuapp.com>';
        config.evernote.AddNoteEmailAddress = 'fdkfjaslkfad.82272@m.evernote.com';

        var that = this;
        that.calledCount = 0;

        evernoteMail = new EvernoteMail("<my-fake-userid>");

        // ドライバ
        evernoteMail.transporter.sendMail = function(mail, cb) {
            that.calledCount++;
            that.calledArgs = mail;
            cb();
        };
    });

    it('config is ok', function() {
        expect(evernoteMail.transporter.transporter.options.auth.user).is.equals('sample.example@gmail.com');
        expect(evernoteMail.transporter.transporter.options.auth.pass).is.equals('u2Uqu7XBhQEDbBxA');
        expect(evernoteMail.mailTo).is.equals('fdkfjaslkfad.82272@m.evernote.com');
        expect(evernoteMail.mailFrom).is.equals('todoist2evernote <writer@todoist2evernote.herokuapp.com>');
    });

    it('sends a mail', function(done) {
        var that = this;
        var mail = {
            subject: 'サンプル2',
            html: '<h1>文字化けしている？</h1>'
        };
        return evernoteMail.sendAsync(mail).then(function() {
            expect(that.calledCount).is.equals(1);
            expect(that.calledArgs).is.deep.equals({
                subject: 'サンプル2',
                html: '<h1>文字化けしている？</h1>',
                from: config.evernote.mailFrom,
                to: config.evernote.AddNoteEmailAddress
            });
            done();
        }, done);
    })
});
