var express = require('express');
var contentType = require('content-type');
var Promise = require('bluebird');
var sha1 = require('sha1');
var getRawBody = require('raw-body');
var config = require('./config');
var util = require('../util/util');
var reply = require('./../wx/reply');

module.exports = function (req, res, next) {
    var token = config.wechat.token;
    var signature = req.query.signature;
    var nonce = req.query.nonce;
    var timestamp = req.query.timestamp;
    var echostr = req.query.echostr;

    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);
    // 首次验证
    if (req.method === 'GET') {
        // 是否从微信提交过来的
        if (sha === signature) {
            res.send(echostr);
        } else {
            res.send('error');
        }
    }
    else if (req.method === 'POST') {
        // 是否从微信提交过来的
        if (sha !== signature) {
            res.send('error');
            return false
        }
        var data;
        return new Promise(function (resolve, reject) {
            getRawBody(req, {
                length: req.headers['content-length'],
                limit: '1mb',
                encoding: contentType.parse(req).parameters.charset
            }, function (err, string) {
                if (err) return next(err);
                data = string.toString();
                var content = util.parseXMLAsync(data);
                var message = content._rejectionHandler0.xml;
                this.message = message;
                this.weixin = res;
                reply.call(this);
            });
        });
    }
};