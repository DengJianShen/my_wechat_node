var mongoose = require('mongoose');
var Shorturl = require('../models/shorturl').Shorturl;
var Wechat = require('../wechat/wechat');
var config = require('../wechat/config');
var wechatApi = new Wechat(config.wechat);
var Promise = require('bluebird');

/* 短链接列表输出 */
exports.shorturllist = function (req, res) {
    var page = req.body.page;
    var limit = 10;
    var reply = {};
    var totalpage;
    Shorturl.count({}, function (err, count) {
        totalpage = Math.ceil(count / limit);
    });
    Shorturl
        .find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(function (err, url) {
            reply.totalpage = totalpage;
            reply.urls = url;
            res.send(reply);
        })
};
/* 短链接转换 */
exports.createshorturl = function (req, res) {
    var originalurl = req.body.url;
    var urlname = req.body.urlname;
    var urlexplain = req.body.urlexplain;
    return new Promise(function () {
        wechatApi.createShorturl(null, originalurl).then(function (response) {
            if (response.errcode == 0) {
                var newurl = new Shorturl({
                    urlname: urlname,
                    urlexplain: urlexplain,
                    originalurl: originalurl,
                    shorturl: response.short_url,
                });
                newurl.save(function (err, url) {
                    if (err) {
                        console.log(err);
                    }
                    res.send(url);
                });
            }
        })
    });
};
/* 短链接删除 */
exports.deleteurl = function (req, res) {
    var id = req.body.id;
    Shorturl.remove({
        _id: id
    }, function (err) {
        if (err) {
            console.log(err);
        }
        res.send({"errcode": 0, "errmsg": "ok"});
    });
};