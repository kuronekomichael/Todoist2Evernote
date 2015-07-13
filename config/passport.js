var todoist = require('./passport/todoist');

module.exports = function (passport, config) {
    // use these strategies
    passport.use(todoist);
    passport.use('provider', todoist);
};
