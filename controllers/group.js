var mongoose = require('mongoose');
var Wechat = require('../wechat/wechat');
var config = require('../wechat/config');
var wechatApi = new Wechat(config.wechat);
var Promise = require('bluebird');

/* 分组列表输出 */
exports.outputgroup = function (req, res) {
    var page = req.body.page;
    var limit = 10;
    var reply = {};
    return new Promise(function () {
        wechatApi.fetchGroups().then(function (response) {
            if(page!=0){
                reply.total = response.groups.length;
                reply.limit = limit;
                reply.groups = response.groups.slice((page-1)*limit,(page-1)*limit+limit);
            }else{
                reply.groups = response.groups;
            }
            res.send(reply);
        })
    });
};

/* 创建分组 */
exports.creategroup = function (req, res) {
    var name = req.body.name;
    return new Promise(function () {
        wechatApi.createGroup(name).then(function (response) {
            res.send(response);
        })
    });
};
/* 删除分组 */
exports.deletegroup = function (req, res) {
    var id = req.body.id;
    return new Promise(function () {
        wechatApi.deleteGroup(id).then(function (response) {
            res.send(response);
        })
    });
};
/* 更新分组 */
exports.updategroup = function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    return new Promise(function () {
        wechatApi.updateGroup(id,name).then(function (response) {
            res.send(response);
        })
    });
};
/* 批量移入 */
exports.batchadd = function (req, res) {
    var groupid = req.body.id;
    var openids = req.body.openids;
    return new Promise(function () {
        wechatApi.moveGroup(openids,groupid).then(function (response) {
            res.send(response);
        })
    });
};
/* 分组发送 */
exports.batchsend = function (req, res) {
    var type = req.body.type;
    var msg = req.body.msg;
    var groupid = req.body.groupid;
    return new Promise(function () {
        wechatApi.sendByGroup(type,msg,groupid).then(function (response) {
            res.send(response);
        })
    });
};