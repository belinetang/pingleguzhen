var express = require('express');
var request = require("request");
var querystring = require('querystring');
var _ = require('lodash');

var app = express.Router();

var config = require('../config/config.json');

/**
 * 天气接口
 */
app.get("/weather/:method", function (req, res) {
    var method = req.params.method;
    var params = querystring.stringify(req.query);
    var url = method;
    if (params) {
        url += '?' + params;
    }
    executeWeatherRequest({url: url}, req, res);
});


var prefix = '/server';
/**
 * 配置信息
 */
app.all(prefix + "/a/config/*", function (req, res) {
    res.send(config)
});
/**
 * 获取图片验证码
 */
app.all(prefix + "/a/vcode/*", function (req, res) {
    var beurl= 'member/getKaptchaImage'
    var params = _.extend({
        siteCode: config.siteCode, // 后台站点code
        lang: config.lang // 语言类型cn、en
    }, req.body, req.query);
    var clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    executeRequestVcode({
        method: req.method,
        url: beurl,
        data: params,
        clientIp: clientIP || ''
    }, function (result) {
        if (result.code === 1) {
            res.status(result.status).json({
                code: 1,
                message: result.message
            });
        } else {
            res.status(result.status).json(result);
        }
    });
});
/**
 * 资讯网接口
 */
app.all(prefix + "/a/*", function (req, res) {
    var url = req.url.slice(prefix.length).split('?')[0];// 去掉前缀以及get参数
    var beurl= url
    beurl = beurl.split('/a/')[1]
    var params = _.extend({
        siteCode: config.siteCode, // 后台站点code
        lang: config.lang // 语言类型cn、en
    }, req.body, req.query);


    //获取客户端ip
    var clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    executeRequest({
        method: req.method,
        url: beurl,
        data: params,
        clientIp: clientIP || ''
    }, function (result) {
        if (result.code === 1) {
            res.status(result.status).json({
                code: 1,
                message: result.message
            });
        } else {
            res.status(result.status).json(result);
        }
    });
});
/**
 * 电商接口
 */
app.all(prefix + "/b/*", function (req, res) {
    var url = req.url.slice(prefix.length).split('?')[0];// 去掉前缀以及get参数
    var beurl= url
    beurl = beurl.split('/b/')[1]
    var params = _.extend({
        siteCode: config.siteCode, // 后台站点code
        lang: config.lang // 语言类型cn、en
    }, req.body, req.query);


    //获取客户端ip
    var clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    executeRequest2({
        method: req.method,
        url: beurl,
        data: params,
        clientIp: clientIP || ''
    }, function (result) {
        if (result.code === 1) {
            res.status(result.status).json({
                code: 1,
                message: result.message
            });
        } else {
            res.status(result.status).json(result);
        }
    });
});


/**
 * 执行http请求
 * @param {object} options http请求参数，必传
 * {
 *  url: '',后台接口路由
 *  method: 'GET', POST/GET/DELETE/PUT 默认GET
 *  contentType: '', 默认application/json
 *  clientIp: '', 浏览器端ip
 *  data: '' 具体数据
 * }
 * @param {function} completed 请求后执行的回调，必传
 *
 * **注意**
 * 返回前端结构说明
 * {
 * 	code: 状态码，0成功/1失败/2重复操作（点赞、想去等）
 * 	message: 错误时的错误信息
 * 	data: 数据
 * 	datas: 列表数据
 * 	page: { 分页信息
 *   total: 总页码
 *   currPage: 当前页码
 *   pageSize: 分页大小
 *   totalPage: 总页数
 * }
 */

/**
 * 资讯网
 * @param options
 * @param completed
 */
function executeRequest(options, completed) {
    if (!options) {
        console.error('缺少options参数');
        return;
    }
    if (!completed || typeof completed !== 'function') {
        console.error('缺少completed参数');
        return;
    }

    var option = {
        baseUrl: config.serverUrl,//uri前缀，最后访问的url为baseUrl + uri
        uri: options.url,
        method: options.method || 'GET',
        headers: {
            'content-Type': options.contentType || 'application/json',
            'X-Real-IP': options.clientIP || '',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        json: true //true contentType自动设置为json，且按json格式解析响应的body
    };

    if (option.method === 'GET' || option.method === 'get') {
        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.useQuerystring = true;//true会把数组参数序列化为foo=bar&foo=baz替代默认的foo[0]=bar&foo[1]=baz
    } else if (option.method === 'POST' || option.method === 'post') {
        //json为true时，body必须是序列化的json对象        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.body = options.data ? ("data=" + JSON.stringify(options.data)) : '';
    }

    console.log(option.baseUrl + option.uri + '?' + querystring.stringify(option.qs));

    request(option, function (error, response, body) {
        var result = {
            status: 200,
            code: 1
        };

        try {
            if (error) {
                var status = response ? response.statusCode : 500;
                if (error.code === 'ETIMEDOUT') {
                    //是否需要重定向？
                    result = {
                        status: 504,
                        message: "服务器超时",
                        code: 1
                    };
                } else {
                    result = {
                        status: status,
                        message: "服务器错误",
                        code: 1
                    };
                }
            } else {
                if (response.statusCode === 200 && (body.code === 0 || body.code === 2)) {
                    result = _.extend({
                        status: 200
                    }, body);
                } else {
                    result = {
                        status: response.statusCode,
                        code: 1,
                        message: body.message || '后台获取数据失败'
                    };
                }
            }

        } catch (e) {
            result = {
                status: 500,
                message: "服务器错误",
                code: 1
            };
        }

        completed(result);
    });
}

/**
 * 电商网
 * @param options
 * @param completed
 */
function executeRequest2(options, completed) {

    if (!options) {
        console.error('缺少options参数');
        return;
    }
    if (!completed || typeof completed !== 'function') {
        console.error('缺少completed参数');
        return;
    }

    var option = {
        baseUrl: config.serverRetailersUrl,//uri前缀，最后访问的url为baseUrl + uri
        uri: options.url,
        method: options.method || 'GET',
        headers: {
            'content-Type': options.contentType || 'application/json',
            'X-Real-IP': options.clientIP || '',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        json: true //true contentType自动设置为json，且按json格式解析响应的body
    };

    if (option.method === 'GET' || option.method === 'get') {
        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.useQuerystring = true;//true会把数组参数序列化为foo=bar&foo=baz替代默认的foo[0]=bar&foo[1]=baz
    } else if (option.method === 'POST' || option.method === 'post') {
        //json为true时，body必须是序列化的json对象        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.body = options.data ? ("data=" + JSON.stringify(options.data)) : '';
    }

    console.log(option.baseUrl + option.uri + '?' + querystring.stringify(option.qs));

    request(option, function (error, response, body) {
        var result = {
            status: 200,
            code: 1
        };

        try {
            if (error) {
                var status = response ? response.statusCode : 500;
                if (error.code === 'ETIMEDOUT') {
                    //是否需要重定向？
                    result = {
                        status: 504,
                        message: "服务器超时",
                        code: 1
                    };
                } else {
                    result = {
                        status: status,
                        message: "服务器错误",
                        code: 1
                    };
                }
            } else {
                if (response.statusCode === 200 && (body.code === 0 || body.code === 2)) {
                    result = _.extend({
                        status: 200
                    }, body);
                } else {
                    result = {
                        status: response.statusCode,
                        code: 1,
                        message: body.message || '后台获取数据失败'
                    };
                }
            }

        } catch (e) {
            result = {
                status: 500,
                message: "服务器错误",
                code: 1
            };
        }

        completed(result);
    });
}

/**
 * 获取图片二维码
 */
function executeRequestVcode(options, completed) {
    if (!options) {
        console.error('缺少options参数');
        return;
    }
    if (!completed || typeof completed !== 'function') {
        console.error('缺少completed参数');
        return;
    }

    var option = {
        baseUrl: config.serverUrl,//uri前缀，最后访问的url为baseUrl + uri
        uri: options.url,
        method: options.method || 'GET',
        headers: {
            'content-Type': options.contentType || 'application/json',
            'X-Real-IP': options.clientIP || ''
        },
        json: true //true contentType自动设置为json，且按json格式解析响应的body
    };

    if (option.method === 'GET' || option.method === 'get') {
        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.useQuerystring = true;//true会把数组参数序列化为foo=bar&foo=baz替代默认的foo[0]=bar&foo[1]=baz
    } else if (option.method === 'POST' || option.method === 'post') {
        //json为true时，body必须是序列化的json对象        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.qs = options.data;//qs会自动转换为参数追加到url后面
        option.body = options.data ? ("data=" + JSON.stringify(options.data)) : '';
    }

    console.log(option.baseUrl + option.uri + '?' + querystring.stringify(option.qs));

    request(option, function (error, response, body) {
        var result = {
            status: 200,
            code: 1
        };

        try {
            if (error) {
                var status = response ? response.statusCode : 500;
                if (error.code === 'ETIMEDOUT') {
                    //是否需要重定向？
                    result = {
                        status: 504,
                        message: "服务器超时",
                        code: 1
                    };
                } else {
                    result = {
                        status: status,
                        message: "服务器错误",
                        code: 1
                    };
                }
            } else {
                if (response.statusCode === 200) {
                    result = _.extend({
                        status: 200
                    }, body);
                } else {
                    result = {
                        status: response.statusCode,
                        code: 1,
                        message: body.message || '后台获取数据失败'
                    };
                }
            }

        } catch (e) {
            result = {
                status: 500,
                message: "服务器错误",
                code: 1
            };
        }

        completed(result);
    });
}


var weatherServer = config.weatherServer;
function executeWeatherRequest(options, req, res) {
    var options = {
        method: req.method || 'get',
        url: weatherServer + options.url,
        json: true,
        headers: {
            'content-Type': 'application/json'
        }
    };
    console.log("天气接口:"+options.url);
    request(options, function (error, response, body) {
        try {
            if (error) {
                var status = response ? response.statusCode : 500;
                var errorMessage = "服务器错误";
                if (error.code === 'ETIMEDOUT') {
                    //是否需要重定向？
                    status = 504;
                    errorMessage = '服务器响应超时';
                }
                res.status(status).json({
                    code: 1,
                    errorMessage: errorMessage
                });
            } else {
                if (response.statusCode === 200 && body.msg === '1') {
                    res.status(response.statusCode).json({
                        data: body.weatherInfo,
                        code: 0
                    });
                } else {
                    res.status(response.statusCode).json({
                        code: 1,
                        errorMessage: body.weatherInfo
                    });
                }
            }
        } catch (e) {
            res.status(500).json({
                code: 1,
                errorMessage: "服务器错误"
            });
        }
    });
}

module.exports = app;
