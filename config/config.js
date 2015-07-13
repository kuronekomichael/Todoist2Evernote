var path = require('path');

//TODO: switch between production and test
module.exports = {
    db: process.env.MONGOLAB_URI,
    root: path.join(__dirname, '..'),
    todoist: {
        token: process.env.TODOIST_TOKEN,
        clientID: process.env.TODOIST_CLIENT_ID,
        clientSecret: process.env.TODOIST_CLIENT_SECRET
    },
    evernote: {
        mailUser: process.env.MAILACCOUNT_USER,
        mailPass: process.env.MAILACCOUNT_PASS,
        mailFrom: process.env.MAILACCOUNT_FROM,
        // Email notes to:
        AddNoteEmailAddress: process.env.EVERNOTE_MAILADDRESS,
        // save notebook to:
        notebook: '@910.Todoist',
        tag: '#Todoist'
    }
};
