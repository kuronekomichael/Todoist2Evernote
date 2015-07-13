
describe('mock sample for new instance', function() {

    User = function(_id) { this.id = _id; };
    User.prototype.getNumber = function(name) { return this.id + '-' + name; };

    var mystub = sinon.createStubInstance(User);
    mystub.getNumber.returnsThis('xxx');
    //mystub.getNumber = function() { return 'xxx'; };
    //mystubreturnsThis
    //console.log(mystub.getNumber);

    User.prototype.getNumber = function(name) { return this.id + '+' + name; }

    it('mock', function() {
        var user = new User('abcd');
        var number = user.getNumber('example');

        expect(number).is.equals('abcd+example');
    });

});

describe('Test config', function() {

    before(function() {
        process.env.TODOIST_TOKEN = 'fasdgjlkadsjlkaelkkekekkeke';
        process.env.TODOIST_CLIENT_ID = '53qjfajsdfgjalsjflakjelkjaflejlkfae';
        process.env.TODOIST_CLIENT_SECRET = 'gaklesklganklengafsdmlkvaskdnafsedfgnalsdm';

        process.env.MAILACCOUNT_USER = 'my-mail-user';
        process.env.MAILACCOUNT_PASS = 'my-mail-password';
        process.env.MAILACCOUNT_FROM = 'helloworld <from@example.com>';
        process.env.EVERNOTE_MAILADDRESS = 'myevernote.12345@m.evernote.com';

        this.config = require('../config/config');
        this.configPassportTodoist = require('../config/passport/todoist');
    });

    it('config is ok', function() {
        expect(this.config).is.ok;
        expect(this.config.todoist.token).is.equals('fasdgjlkadsjlkaelkkekekkeke');
        expect(this.config.todoist.clientID).is.equals('53qjfajsdfgjalsjflakjelkjaflejlkfae');
        expect(this.config.todoist.clientSecret).is.equals('gaklesklganklengafsdmlkvaskdnafsedfgnalsdm');

        expect(this.config.evernote.mailUser).is.equals('my-mail-user');
        expect(this.config.evernote.mailPass).is.equals('my-mail-password');
        expect(this.config.evernote.mailFrom).is.equals('helloworld <from@example.com>');
        expect(this.config.evernote.AddNoteEmailAddress).is.equals('myevernote.12345@m.evernote.com');
    })

    it('passport is ok', function() {
        expect(this.configPassportTodoist).is.ok;
        expect(this.configPassportTodoist._oauth2._clientId).is.equals('53qjfajsdfgjalsjflakjelkjaflejlkfae');
        expect(this.configPassportTodoist._oauth2._clientSecret).is.equals('gaklesklganklengafsdmlkvaskdnafsedfgnalsdm');
    })
});
