var path = require('path');
var util = require('../util/util');
var KeyReply = require('../models/keyreply').KeyReply;
var FollowReply = require('../models/followreply').FollowReply;
var Material = require('../models/material').Material;
var NewsMaterial = require('../models/newsmaterial').NewsMaterial;

module.exports = function () {
    var message = this.message;
    var weixin = this.weixin;
    var content;
    var reply;
    if (message.MsgType == 'event') {
        if (message.Event == 'subscribe') {
            FollowReply.findOne({using:0},function(err,followreply){
                if(err){
                    console.log(err);
                }
                if(followreply!=null){
                    if(followreply.type==0){
                        content = {
                            type: 'image',
                            mediaId: followreply.media_id
                        };
                        reply = util.tpl(content, message);
                        weixin.send(reply);
                    }else if(followreply.type==2){
                        content = {
                            type: 'voice',
                            mediaId: followreply.media_id
                        };
                        reply = util.tpl(content, message);
                        weixin.send(reply);
                    }else if(followreply.type==3){
                        content = {
                            type: 'video',
                            mediaId: followreply.media_id,
                            description: followreply.explain,
                            title: followreply.name
                        };
                        reply = util.tpl(content, message);
                        weixin.send(reply);
                    }else if(followreply.type==4){
                        content = followreply.content;
                        reply = util.tpl(content, message);
                        weixin.send(reply);
                    }
                }else{
                    content = '你所拨打的用户已关机,请不要再拨';
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                }
            })
        }
    } else if (message.MsgType == 'text') {
        KeyReply.findOne({keyfont:message.Content,using:0},function(err,keyfontreply){
            if(err){
                console.log(err);
            }
            if(keyfontreply!=null){
                if(keyfontreply.type==0){
                    content = {
                        type: 'image',
                        mediaId: keyfontreply.media_id
                    };
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                }else if(keyfontreply.type==1){
                    NewsMaterial.findOne({media_id:keyfontreply.media_id},function(err,newsmaterial){
                        content = [{
                            title: newsmaterial.name,
                            description: newsmaterial.explain,
                            picUrl: newsmaterial.thumburl,
                            url: newsmaterial.allurl
                        }];
                        reply = util.tpl(content, message);
                        weixin.send(reply);
                    })
                }
                else if(keyfontreply.type==2){
                    content = {
                        type: 'voice',
                        mediaId: keyfontreply.media_id
                    };
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                }else if(keyfontreply.type==3){
                    content = {
                        type: 'video',
                        mediaId: keyfontreply.media_id,
                        description: keyfontreply.explain,
                        title: keyfontreply.name
                    };
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                }else if(keyfontreply.type==4){
                    content = keyfontreply.content;
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                }
            }else{
                content = '没有你想要的指令';
                reply = util.tpl(content, message);
                weixin.send(reply);
            }
        });
    }
};