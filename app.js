var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var request = require("request");

var path = require('path');
var async = require('async');
var _ = require('lodash');
var router = require('./routes');
var config = require('./config/config.json');

// all environments
app.enabled('trust proxy');

app.set('views', path.join(__dirname, 'views')); // 指定模板目录
app.engine('.html', require('ejs').__express); // 设置模板为ejs，后缀为html
app.set('view engine', 'html');
app.set('view cache', config['viewCache']); // 模板缓存

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/js/lib')));

app.use(session({
    name: config.cookie || 'user_sid', // cookie名称，默认为connect.id
    secret: config.secret,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 有效期一周
        httpOnly: true
    },
    resave: true, // store提供了touch方法可设置为false
    saveUninitialized: false//
}));

/** 设置变量供ejs模板访问 */
app.locals._ = _;

router(app);

process.on('uncaughtException', function (err) {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
});

app.use(function (err, req, res, next) {
    if (err.message.indexOf("Failed to lookup view") >= 0) {
        res.status(404).redirect('/error/404.html');
    } else {
        res.status(500).redirect('/error/500.html');
    }
});

var server = http.createServer(app);
server.listen(config.port, '0.0.0.0'); // 使用Ip4

console.log('visit localhost:' + config.port);
