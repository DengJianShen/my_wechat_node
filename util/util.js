var fs = require('fs');
var Promise = require('bluebird');
var xml2js = require('xml2js');
var tpl = require('../wechat/tpl');

exports.readFileAsync = function(fpath, encoding) {
    return new Promise(function(resolve, reject) {
        fs.readFile(fpath, encoding, function(err, content) {
            if (err) reject(err);
            else resolve(content)
        })
    })
};

exports.writeFileAsync = function(fpath, content) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(fpath, content, function(err) {
            if (err) reject(err);
            else resolve()
        })
    })
};

exports.parseXMLAsync = function(xml) {
    return new Promise(function(resolve, reject) {
        xml2js.parseString(xml, {
            trim: true,
            explicitArray: false
        }, function(err, content) {
            if(err) reject(err);
            else resolve(content);
        })
    })
};

exports.tpl = function(content, message) {
    var info = {};
    var type = 'text';
    var fromUserName = message.FromUserName;
    var toUserName = message.ToUserName;

    if(Array.isArray(content)) {
        type = 'news'
    }

    if(!content) {
        content = 'Empty news'
    }

    type = content.type || type;
    info.content = content;
    info.createTime = new Date().getTime();
    info.msgType = type;
    info.toUserName = fromUserName;
    info.fromUserName = toUserName;

    return tpl.compiled(info);
};