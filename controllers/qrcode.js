var mongoose = require('mongoose');
var Qrcode = require('../models/qrcode').Qrcode;
var Wechat = require('../wechat/wechat');
var config = require('../wechat/config');
var wechatApi = new Wechat(config.wechat);
var Promise = require('bluebird');

/* 二维码列表输出 */
exports.qrcodelist = function (req, res) {
    var page = req.body.page;
    var limit = 10;
    var reply = {};
    var totalpage;
    Qrcode.count({}, function (err, count) {
        totalpage = Math.ceil(count / limit);
    });
    Qrcode
        .find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(function (err, qrcode) {
            reply.totalpage = totalpage;
            reply.qrcodes = qrcode;
            res.send(reply);
        })
};
/* 创建二维码 */
exports.createqrcode = function (req, res) {
    var type = req.body.qrcodetype;
    var qrcodeObj = req.body;
    if(type=='QR_SCENE'){
        var createObj = {};
        createObj.expire_seconds = qrcodeObj.effectivetime;
        createObj.action_name = 'QR_SCENE';
        createObj.action_info = {
            scene: {
              scene_id: qrcodeObj.sceneid
            }
        };
    }else if(type=='QR_LIMIT_SCENE'){
        var createObj = {};
        createObj.action_name = 'QR_LIMIT_SCENE';
        createObj.action_info = {
            scene: {
                scene_id: qrcodeObj.sceneid
            }
        };
    }else if(type=='QR_LIMIT_STR_SCENE'){
        var createObj = {};
        createObj.action_name = 'QR_LIMIT_STR_SCENE';
        createObj.action_info = {
            scene: {
                scene_str: qrcodeObj.scenestr
            }
        };
    }
    return new Promise(function () {
        wechatApi.createQrcode(createObj).then(function (data) {
            return data;
        }).then(function(data){
            var imgurl = wechatApi.showQrcode(data.ticket);
            var qrcode = new Qrcode({
                sceneid: qrcodeObj.sceneid,
                scenestr: qrcodeObj.scenestr,
                scenename: qrcodeObj.scenename,
                sceneexplain: qrcodeObj.sceneexplain,
                qrcodetype: qrcodeObj.qrcodetype,
                qrcodeurl: imgurl,
                effectivetime: qrcodeObj.effectivetime!=''?parseInt(new Date().getTime())+parseInt(qrcodeObj.effectivetime)*86400000:0
            });
            qrcode.save(function (err, qrcode) {
                if (err) {
                    console.log(err);
                }
                res.send(qrcode);
            });
        })
    });
};
/* 删除二维码 */
exports.deleteurl = function (req, res) {
    var id = req.body.id;
    Qrcode.remove({
        _id: id
    }, function (err) {
        if (err) {
            console.log(err);
        }
        res.send({"errcode": 0, "errmsg": "ok"});
    });
};