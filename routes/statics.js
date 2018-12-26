var express = require('express');
var app = express.Router();
var request = require("request");
var _ = require('lodash');
var config = require('../config/config.json');
var async = require('async');

// app.dynamicHelpers
app.use(function (req, res, next) {
    /** 动态设置变量供ejs模板访问 */
    res.locals.session = req.session;
    res.locals.config = config;
    // 请求参数
    res.locals.params = req.query; // get时有效
    next();
});
/* 二级页面和首页 */
app.get('/', function (req, res) {
    var obj = {
        menu: 'index'
    };
    res.render('index', obj);
});
/* 新闻详情页面 */
app.get('/newsdesc.html', function (req, res) {
    var id = req.query.id;
    // var typeCode = req.query.typeCode;
    var params = _.extend({
        apikey: config.apiKey, // 后台apikey
        siteCode: config.siteCode, // 后台站点code
        lang: config.lang // 语言类型cn、en
    }, req.body, req.query);

    var options = {
        method: "GET",
        url: config.serverUrl+"/news/detail/"+id+"?apikey=9c869d726d3f4fa788fd3d1a62726d8a&siteCode=cdzxw&lang=cn&page=1&rows=9&tag=&channelCode=zxdt",
        params:params,
        json: true,
        timeout: 80000,
        headers: {
            'content-Type': 'application/json'
        }
    };
    // console.log(options)

    request(options, function (error, response, body) {
        try {
            if (error) {
                var status = response ? response.statusCode : 500;

                if(error.code === 'ETIMEDOUT'){
                    //是否需要重定向？
                    status = 504;
                }
                res.status(status).json({
                    error: error,
                    state: "error"
                });
            } else {
                // console.log(body,999);
                if (response.body.code === 0) {
                    res.render('scene-cont04', {
                        title:body.data.title,
                        summary:body.data.summary,
                        src:body.data.src || '暂无',
                        author:body.data.author || '暂无',
                        createTime:body.data.createTime || '暂无',
                        viewCount:body.data.viewCount || '暂无',
                        content:body.data.content || '暂无',
                        results:body.data
                    });
                } else {
                    res.status(response.statusCode).json({
                        error: body.msg || "未正常获取数据",
                        state: body.state
                    });
                }
            }
        } catch (e) {
            res.status(500).json({
                error: "数据错误",
                state: 'error'
            });
        }
    });
})



/* 四级页面 */
app.get('/:code-:type-:id.html', function (req, res) {
    var url = req.params.code;
    var type = req.params.type;
    var id = req.params.id;
    var obj = req.query;

    obj.menu = url;
    obj.id = id;
    res.render(url + "-" + type, obj);
});
/* 三级页面 */
app.get('/:code-:type.html', function (req, res) {
    var url = req.params.code;
    var type = req.params.type;
    var obj = req.query;

    obj.menu = url;
    res.render(url + "-" + type, obj);
});

/* 二级页面和首页 */
app.get('/:code.html', function (req, res) {
    var url = req.params.code;
    var obj = req.query;

    obj.menu = url;

    res.render(url, obj);
});

/* 提示页面 */
app.get('/:code/:errorCode.html', function (req, res) {
    var url = req.params.code;

    res.render(url, errorResponse(req.params.errorCode));
});

app.use(function (err, req, res, next) {
    if (err.message.indexOf("Failed to lookup view") >= 0) {
        res.redirect(req.baseUrl + '/404.html');
    } else {
        console.error(err.stack);
        res.redirect(req.baseUrl + '/error/500.html');
    }
});

function errorResponse(errorCode) {
    var obj = {};
    switch (errorCode) {
        case "404":
            obj.msg = "抱歉，您查找的页面不存在，可能已被删除或转移请点击以下链接继续浏览网站其他信息！";
            break;
        case "500":
            obj.msg = "服务器出问题啦！<br>工程师们正在努力抢修，请稍后再试!";
            break;
        case "555":
            obj.msg = "接口出现问题了！";
            break;
    }
    obj.num = errorCode;
    return obj;
}

module.exports = app;
