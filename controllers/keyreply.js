var mongoose = require('mongoose');
var Wechat = require('../wechat/wechat');
var KeyReply = require('../models/keyreply').KeyReply;
var Material = require('../models/material').Material;
var NewsMaterial = require('../models/newsmaterial').NewsMaterial;
var config = require('../wechat/config');
var wechatApi = new Wechat(config.wechat);
var Promise = require('bluebird');
var Q = require("q");
var _ = require('underscore');
/*关键字列表*/
exports.outputlist = function (req, res) {
    var page = req.body.page;
    var limit = 10;
    var reply = {};
    var totalpage;
    KeyReply.count({}, function (err, count) {
        totalpage = Math.ceil(count / limit);
    });
    KeyReply
        .find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(function (err, keyreply) {
            reply.totalpage = totalpage;
            reply.keyreplys = keyreply;
            res.send(reply);
        })
};
/*关键字创建*/
exports.createkeyreply = function (req, res) {
    var keyfontObj = req.body;
    var _saveObj = {
        name: keyfontObj.keyfontname,
        explain: keyfontObj.keyfontexplain,
        keyfont: keyfontObj.keyfont,
        type: keyfontObj.keyfonttype
    };
    if (keyfontObj.keyfonttype == 4) {
        _saveObj.content = keyfontObj.keyfonttext;
        var keyreply = new KeyReply(_saveObj);
        keyreply.save(function (err, keyreply) {
            if (err) {
                console.log(err);
            }
            res.send({"errcode": 0, "errmsg": "ok"});
        })
    } else {
        _saveObj.media_id = keyfontObj.keyfontmedia_id;
        if (keyfontObj.keyfonttype == 1) {
            var deferred = Q.defer();
            NewsMaterial.findOne({media_id: keyfontObj.keyfontmedia_id}, function (err, newsmaterial) {
                if (err) {
                    console.log(err);
                }
                deferred.resolve(newsmaterial);
            }).then(function (material) {
                _saveObj.content = "名称:" + material.name + " | " + "说明:" + material.explain;
                var keyreply = new KeyReply(_saveObj);
                keyreply.save(function (err, keyreply) {
                    if (err) {
                        console.log(err);
                    }
                    res.send({"errcode": 0, "errmsg": "ok"});
                });
            })
        } else {
            var deferred = Q.defer();
            Material.findOne({media_id: keyfontObj.keyfontmedia_id}, function (err, material) {
                if (err) {
                    console.log(err);
                }
                deferred.resolve(material);
            }).then(function (material) {
                _saveObj.content = "名称:" + material.name + " | " + "说明:" + material.explain;
                var keyreply = new KeyReply(_saveObj);
                keyreply.save(function (err, keyreply) {
                    if (err) {
                        console.log(err);
                    }
                     res.redirect('/keyreply/list');
                });
            })
        }
    }
};
/*关键字启用禁用*/
exports.usekeyreply = function (req, res) {
  var keyreplyObj = req.body;
    if(keyreplyObj.id instanceof Array){
        keyreplyObj.id.forEach(function(item,index){
            KeyReply.findById(item, function (err, keyreply) {
                if (err) {
                    console.log(err);
                }
                var old_keyreply = keyreply;
                old_keyreply.using = keyreplyObj.use;
                var new_keyreply = _.extend(keyreply, old_keyreply);
                new_keyreply.save(function (err, keyreply) {
                    if (err) {
                        console.log(err)
                    }
                    if(index == keyreplyObj.id.length-1){
                        res.send({"errcode": 0, "errmsg": "ok"});
                    }
                })
            })
        })
    }else{
        KeyReply.findById(keyreplyObj.id, function (err, keyreply) {
            if (err) {
                console.log(err);
            }
            var old_keyreply = keyreply;
            if(keyreplyObj.use==0){
                old_keyreply.using = 1;
            }else{
                old_keyreply.using = 0;
            }
            var new_keyreply = _.extend(keyreply, old_keyreply);
            new_keyreply.save(function (err, keyreply) {
                if (err) {
                    console.log(err)
                }
                res.send({"errcode": 0, "errmsg": "ok"});
            })
        })
    }
};
/*关键字删除*/
exports.delkeyreply = function(req,res){
    var id = req.body.id;
    if(id instanceof Array){
        id.forEach(function(item,index){
            KeyReply.remove({
                _id: item
            }, function (err) {
                if (err) {
                    console.log(err);
                }
            if(index == id.length-1){
                res.send({"errcode": 0, "errmsg": "ok"});
            }
            });
        })
    }else{
        KeyReply.remove({
            _id: id
        }, function (err) {
            if (err) {
                console.log(err);
            }
            res.send({"errcode": 0, "errmsg": "ok"});
        });
    }
};
/*关键字更新*/
exports.updatekeyreply = function(req,res){
    var keyfontObj = req.body;
    var _saveObj = {
        name: keyfontObj.keyfontname,
        explain: keyfontObj.keyfontexplain,
        keyfont: keyfontObj.keyfont,
        type: keyfontObj.keyfonttype
    };
    if (keyfontObj.keyfonttype == 4) {
        _saveObj.content = keyfontObj.keyfonttext;
        KeyReply.findById(keyfontObj.keyfontid,function(err,keyreply){
            var old_keyreply = keyreply;
            old_keyreply = _saveObj;
            var new_keyreply = _.extend(keyreply, old_keyreply);
            new_keyreply.save(function (err, keyreply) {
                if (err) {
                    console.log(err)
                }
            res.send({"errcode": 0, "errmsg": "ok"});
            })
        })
    } else {
        _saveObj.media_id = keyfontObj.keyfontmedia_id;
        if (keyfontObj.keyfonttype == 1) {
            var deferred = Q.defer();
            NewsMaterial.findOne({media_id: keyfontObj.keyfontmedia_id}, function (err, newsmaterial) {
                if (err) {
                    console.log(err);
                }
                deferred.resolve(newsmaterial);
            }).then(function (material) {
                _saveObj.content = "名称:" + material.name + " | " + "说明:" + material.explain;
                KeyReply.findById(keyfontObj.keyfontid,function(err,keyreply){
                    var old_keyreply = keyreply;
                    old_keyreply = _saveObj;
                    var new_keyreply = _.extend(keyreply, old_keyreply);
                    new_keyreply.save(function (err, keyreply) {
                        if (err) {
                            console.log(err)
                        }
                        res.send({"errcode": 0, "errmsg": "ok"});
                    })
                })
            })
        } else {
            var deferred = Q.defer();
            Material.findOne({media_id: keyfontObj.keyfontmedia_id}, function (err, material) {
                if (err) {
                    console.log(err);
                }
                deferred.resolve(material);
            }).then(function (material) {
                _saveObj.content = "名称:" + material.name + " | " + "说明:" + material.explain;
                KeyReply.findById(keyfontObj.keyfontid,function(err,keyreply){
                    var old_keyreply = keyreply;
                    old_keyreply = _saveObj;
                    var new_keyreply = _.extend(keyreply, old_keyreply);
                    new_keyreply.save(function (err, keyreply) {
                        if (err) {
                            console.log(err)
                        }
                        res.send({"errcode": 0, "errmsg": "ok"});
                    })
                })
            })
        }
    }
};