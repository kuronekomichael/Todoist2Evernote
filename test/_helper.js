global.expect = require('chai').expect;
global.sinon = require('sinon');

// clear console
process.stdout.write('\u001b[2J\u001b[0;0H');

// environment variables for tests
process.env.TODOIST_TOKEN = 'fasdgjlkadsjlkaelkkekekkeke';
process.env.TODOIST_CLIENT_ID = '53qjfajsdfgjalsjflakjelkjaflejlkfae';
process.env.TODOIST_CLIENT_SECRET = 'gaklesklganklengafsdmlkvaskdnafsedfgnalsdm';

process.env.MAILACCOUNT_USER = 'my-mail-user';
process.env.MAILACCOUNT_PASS = 'my-mail-password';
process.env.MAILACCOUNT_FROM = 'helloworld <from@example.com>';
process.env.EVERNOTE_MAILADDRESS = 'myevernote.12345@m.evernote.com';
