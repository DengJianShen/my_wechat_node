var mongoose = require('mongoose');
var User = require('../models/user').User;
var Black = require('../models/black').Black;
var Wechat = require('../wechat/wechat');
var config = require('../wechat/config');
var wechatApi = new Wechat(config.wechat);
var Promise = require('bluebird');
var _ = require('underscore');

/* 用户列表存储 */
exports.savelist = function (req, res) {
    wechatApi.listUsers().then(function (response) {
        var openidArr = response.data.openid;
        wechatApi.fetchUsers(openidArr).then(function (response) {
            var user_info_list = response.user_info_list;
            user_info_list.forEach((item)=> {
                User.findOne({openid: item.openid}, function (err, user) {
                    if (err) {
                        console.log(err);
                    }
                    if (user == null) {
                        var user = new User({
                            nickname: item.nickname,
                            sex: item.sex,
                            headimgurl: item.headimgurl,
                            groupid: item.groupid,
                            subscribe_time: item.subscribe_time,
                            openid: item.openid,
                            city: item.city,
                            province: item.province,
                            country: item.country,

                        });
                    }
                })
            })
        })
    })
};

/* 用户列表输出 */
exports.outputlist = function (req, res) {
    var page = req.body.page;
    return new Promise(function () {
        var limit = 10;
        var total;
        var count;
        var reply = {};
        wechatApi.listUsers().then(function (response) {
            total = response.total;
            count = response.total;
            if (total == count) {
                var openidArr = response.data.openid;
                var fetchUser = openidArr.slice((page - 1) * limit, (page - 1) * limit + limit);
                wechatApi.fetchUsers(fetchUser).then(function (response) {
                    var reply = {};
                    reply.total = total;
                    reply.count = count;
                    reply.limit = limit;
                    reply.user_info_list = response.user_info_list;
                    res.send(reply);
                })
            }
        })
    });
};

/* 用户备注 */
exports.updateremark = function (req, res) {
    var userObj = req.body;
    return new Promise(function () {
        wechatApi.remarkUser(userObj.id, userObj.remark).then(function (response) {
            res.send(response);
        })
    });
};

/* 黑名单列表 */
exports.blacklist = function (req, res) {
    var page = req.body.page;
    return new Promise(function () {
        var limit = 10;
        var total;
        var count;
        var reply = {};
        wechatApi.blackFetch().then(function (response) {
            total = response.total;
            count = response.total;
            if (total == count) {
                var openidArr = response.data.openid;
                var fetchUser = openidArr.slice((page - 1) * limit, (page - 1) * limit + limit);
                wechatApi.fetchUsers(fetchUser).then(function (response) {
                    var reply = {};
                    reply.total = total;
                    reply.count = count;
                    reply.limit = limit;
                    reply.user_info_list = response.user_info_list;
                    res.send(reply);
                })
            }
        })
    });
};

/* 拉黑用户 */
exports.black = function (req, res) {
    var userObj = req.body;
    return new Promise(function () {
        wechatApi.black(userObj.openid).then(function (response) {
            res.send(response);
        })
    })
};

/* 取黑用户 */
exports.delblack = function (req, res) {
    var userObj = req.body;
    return new Promise(function () {
        wechatApi.blackDelete(userObj.openid).then(function (response) {
            res.send(response);
        })
    })
};

/* 对openid发送内容 */
exports.send = function (req, res) {
    var userObj = req.body;
    return new Promise(function () {
        wechatApi.sendByOpenId(userObj.type, userObj.msg, userObj.openids).then(function (response) {
            res.send(response);
        })
    })
};