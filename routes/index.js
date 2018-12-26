var staCtrl = require('./statics');
var dynCtrl = require('./dynamics');

module.exports = function (app) {
    app.use('/', staCtrl);
    app.use('/', dynCtrl);
};
