var mongoose = require('mongoose');
var Wechat = require('../wechat/wechat');
var FollowReply = require('../models/followreply').FollowReply;
var Material = require('../models/material').Material;
var NewsMaterial = require('../models/newsmaterial').NewsMaterial;
var config = require('../wechat/config');
var wechatApi = new Wechat(config.wechat);
var Promise = require('bluebird');
var Q = require("q");
var _ = require('underscore');
/*被关注回复列表*/
exports.outputlist = function (req, res) {
    var page = req.body.page;
    var limit = 10;
    var reply = {};
    var totalpage;
    FollowReply.count({}, function (err, count) {
        totalpage = Math.ceil(count / limit);
    });
    FollowReply
        .find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(function (err, FollowReply) {
            reply.totalpage = totalpage;
            reply.followreplys = FollowReply;
            res.send(reply);
        })
};
/*被关注回复创建*/
exports.createfollowreply = function (req, res) {
    var followreplyObj = req.body;
    var _saveObj = {
        name: followreplyObj.followreplyname,
        explain: followreplyObj.followreplyexplain,
        type: followreplyObj.followreplytype
    };
    if (followreplyObj.followreplytype == 4) {
        _saveObj.content = followreplyObj.followreplytext;
        var followreply = new FollowReply(_saveObj);
        followreply.save(function (err, followreply) {
            if (err) {
                console.log(err);
            }
            res.send({"errcode": 0, "errmsg": "ok"});
        })
    } else {
        _saveObj.media_id = followreplyObj.followreplymedia_id;
        if (followreplyObj.followreplytype == 1) {
            var deferred = Q.defer();
            NewsMaterial.findOne({media_id: followreplyObj.followreplymedia_id}, function (err, newsmaterial) {
                if (err) {
                    console.log(err);
                }
                deferred.resolve(newsmaterial);
            }).then(function (material) {
                _saveObj.content = "名称:" + material.name + " | " + "说明:" + material.explain;
                var followreply = new FollowReply(_saveObj);
                followreply.save(function (err, followreply) {
                    if (err) {
                        console.log(err);
                    }
                    res.send({"errcode": 0, "errmsg": "ok"});
                });
            })
        } else {
            var deferred = Q.defer();
            Material.findOne({media_id: followreplyObj.followreplymedia_id}, function (err, material) {
                if (err) {
                    console.log(err);
                }
                deferred.resolve(material);
            }).then(function (material) {
                _saveObj.content = "名称:" + material.name + " | " + "说明:" + material.explain;
                var followreply = new FollowReply(_saveObj);
                followreply.save(function (err, followreply) {
                    if (err) {
                        console.log(err);
                    }
                    res.send({"errcode": 0, "errmsg": "ok"});
                });
            })
        }
    }
};
/*被关注回复启用禁用*/
exports.usefollowreply = function (req, res) {
    var followreplyObj = req.body;
    FollowReply.findOne({using: 0}, function (err, followreply) {
        if (err) {
            console.log(err);
        }
        if(followreply!=null){
            var old_followreply = followreply;
            old_followreply.using = 1;
            var new_followreply = _.extend(followreply, old_followreply);
            new_followreply.save(function (err, followreply) {
                if (err) {
                    console.log(err)
                }
            })
        }
    });
    FollowReply.findById(followreplyObj.id,function(err,followreply){
        if (err) {
            console.log(err);
        }
        var old_followreply = followreply;
        old_followreply.using = 0;
        var new_followreply = _.extend(followreply, old_followreply);
        new_followreply.save(function (err, followreply) {
            if (err) {
                console.log(err)
            }
            res.send({"errcode": 0, "errmsg": "ok"});
        })
    })
};
/*被关注回复删除*/
exports.delfollowreply = function(req,res){
    var id = req.body.id;
    if(id instanceof Array){
        id.forEach(function(item,index){
            FollowReply.remove({
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
        FollowReply.remove({
            _id: id
        }, function (err) {
            if (err) {
                console.log(err);
            }
            res.send({"errcode": 0, "errmsg": "ok"});
        });
    }
};
/*被关注回复更新*/
exports.updatefollowreply = function(req,res){
    var followreplyObj = req.body;
    var _saveObj = {
        name: followreplyObj.followreplyname,
        explain: followreplyObj.followreplyexplain,
        type: followreplyObj.followreplytype
    };
    if (followreplyObj.followreplytype == 4) {
        _saveObj.content = followreplyObj.followreplytext;
        FollowReply.findById(followreplyObj.followreplyid,function(err,followreply){
            var old_followreply = followreply;
            old_followreply = _saveObj;
            var new_followreply = _.extend(followreply, old_followreply);
            new_followreply.save(function (err, FollowReply) {
                if (err) {
                    console.log(err)
                }
                res.send({"errcode": 0, "errmsg": "ok"});
            })
        })
    } else {
        _saveObj.media_id = followreplyObj.followreplymedia_id;
        if (followreplyObj.followreplytype == 1) {
            var deferred = Q.defer();
            NewsMaterial.findOne({media_id: followreplyObj.followreplymedia_id}, function (err, newsmaterial) {
                if (err) {
                    console.log(err);
                }
                deferred.resolve(newsmaterial);
            }).then(function (material) {
                _saveObj.content = "名称:" + material.name + " | " + "说明:" + material.explain;
                FollowReply.findById(followreplyObj.followreplyid,function(err,followreply){
                    var old_followreply = followreply;
                    old_followreply = _saveObj;
                    var new_followreply = _.extend(followreply, old_followreply);
                    new_followreply.save(function (err, FollowReply) {
                        if (err) {
                            console.log(err)
                        }
                        res.send({"errcode": 0, "errmsg": "ok"});
                    })
                })
            })
        } else {
            var deferred = Q.defer();
            Material.findOne({media_id: followreplyObj.followreplymedia_id}, function (err, material) {
                if (err) {
                    console.log(err);
                }
                deferred.resolve(material);
            }).then(function (material) {
                _saveObj.content = "名称:" + material.name + " | " + "说明:" + material.explain;
                FollowReply.findById(followreplyObj.followreplyid,function(err,followreply){
                    var old_followreply = followreply;
                    old_followreply = _saveObj;
                    var new_followreply = _.extend(followreply, old_followreply);
                    new_followreply.save(function (err, FollowReply) {
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