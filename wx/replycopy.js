var path = require('path');
var util = require('../util/util');
var Promise = require('bluebird');
var config = require('./../wechat/config');
var Wechat = require('./../wechat/wechat');
var wechatApi = new Wechat(config.wechat);
module.exports = function () {
    var message = this.message;
    var weixin = this.weixin;
    var content;
    var reply;
    var data;
    console.log(message);
    // 接收事件推送消息
    if (message.MsgType == 'event') {
        // 未关注时扫描二维码关注事件
        if (message.Event == 'subscribe') {
            content = '感谢你的关注';
            reply = util.tpl(content, message);
            weixin.send(reply);
            console.log('关注成功');
        }
        // 取消关注事件
        else if (message.Event == 'unsubscribe') {
            content = '';
            reply = util.tpl(content, message);
            weixin.send(reply);
            console.log('无情取关');
        }
        // 上报地理位置事件
        else if (message.Event == 'LOCATION') {
            content = '您上报的位置是： ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision;
        }
        // 关注后扫描二维码事件
        else if (message.Event == 'SCAN') {
            content = '看到你扫了一下哦';
            reply = util.tpl(content, message);
            weixin.send(reply);
            console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
        }
        // 点击菜单跳转链接时的事件推送
        else if (message.Event == 'VIEW') {
            content = '你点击了菜单中的链接 ： ' + message.EventKey;
            reply = util.tpl(content, message);
            weixin.send(reply);
        }
        else if (message.Event == 'CLICK') {
            content = '你点击了菜单';
            reply = util.tpl(content, message);
            weixin.send(reply);
        }
        // 点击自定义菜单事件
        // else if(message.Event == 'scancode_push') {
        //     console.log(message.ScanCodeInfo.ScanType);
        //     console.log(message.ScanCodeInfo.ScanResult);
        //     content = '您点击了菜单中 ： ' + message.EventKey;
        // }
        // else if(message.Event == 'scancode_waitmsg') {
        //     console.log(message.ScanCodeInfo.ScanType);
        //     console.log(message.ScanCodeInfo.ScanResult);
        //     content = '您点击了菜单中 ： ' + message.EventKey
        // }
        // else if(message.Event == 'pic_sysphoto') {
        //     console.log(message.SendPicsInfo.PicList);
        //     console.log(message.SendPicsInfo.Count);
        //     content = '您点击了菜单中 ： ' + message.EventKey
        // }
        // else if(message.Event == 'pic_photo_or_album') {
        //     console.log(message.SendPicsInfo.PicList);
        //     console.log(message.SendPicsInfo.Count);
        //     content = '您点击了菜单中 ： ' + message.EventKey
        // }
        // else if(message.Event == 'pic_weixin') {
        //     console.log(message.SendPicsInfo.PicList);
        //     console.log(message.SendPicsInfo.Count);
        //     content = '您点击了菜单中 ： ' + message.EventKey
        // }
        // else if(message.Event == 'location_select') {
        //     console.log(message.SendLocationInfo.Location_X);
        //     console.log(message.SendLocationInfo.Location_Y);
        //     console.log(message.SendLocationInfo.Scale);
        //     console.log(message.SendLocationInfo.Label);
        //     console.log(message.SendLocationInfo.Poiname);
        //     content = '您点击了菜单中 ： ' + message.EventKey;
        // }
    }
    // 接收普通消息文本
    else if (message.MsgType == 'text') {
        if (message.Content == '1') {
            content = '第一';
            reply = util.tpl(content, message);
            weixin.send(reply);
        } else if (message.Content == '2') {
            content = '第二';
            reply = util.tpl(content, message);
            weixin.send(reply);
        } else if (message.Content == '3') {
            content = '第三';
            reply = util.tpl(content, message);
            weixin.send(reply);
        } else if (message.Content == '4') {
            content = [{
                title: '技术改变世界',
                description: '只是个描述而已',
                picUrl: 'http://res.cloudinary.com/moveha/image/upload/v1441184110/assets/images/Mask-min.png',
                url: 'https://github.com/'
            }];
            reply = util.tpl(content, message);
            weixin.send(reply);
        } else if (message.Content == '5') {
            content = [{
                title: '技术改变世界',
                description: '只是个描述而已',
                picUrl: 'http://res.cloudinary.com/moveha/image/upload/v1441184110/assets/images/Mask-min.png',
                url: 'https://github.com/'
            }, {
                title: 'Nodejs 开发微信',
                description: '爽到爆',
                picUrl: 'https://res.cloudinary.com/moveha/image/upload/v1431337192/index-img2_fvzeow.png',
                url: 'https://nodejs.org/'
            }];
            reply = util.tpl(content, message);
            weixin.send(reply);
        } else if (message.Content == '6') {
            return new Promise(function (resolve, reject) {
                wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg')).then(function (response) {
                    data = response;
                    content = {
                        type: 'image',
                        mediaId: data.media_id
                    };
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                });
            });
        } else if (message.Content == '7') {
            return new Promise(function (resolve, reject) {
                wechatApi.uploadMaterial('video', path.join(__dirname, '../6.mp4')).then(function (response) {
                    data = response;
                    content = {
                        type: 'video',
                        mediaId: data.media_id,
                        description: '我是描述',
                        title: '我是标题'
                    };
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                });
            });
        } else if (message.Content == '8') {
            return new Promise(function (resolve, reject) {
                wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg')).then(function (response) {
                    data = response;
                    content = {
                        type: 'music',
                        thumbMediaId: data.media_id,
                        description: '放松一下',
                        title: '回复音乐内容',
                        musicUrl: 'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3'
                    };
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                });
            });
        } else if (message.Content == '9') {
            return new Promise(function (resolve, reject) {
                wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'), {
                    type: 'image'
                }).then(function (response) {
                    data = response;
                    content = {
                        type: 'image',
                        mediaId: data.media_id
                    };
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                });
            });
        } else if (message.Content == '10') {
            return new Promise(function (resolve, reject) {
                wechatApi.uploadMaterial('video', path.join(__dirname, '../6.mp4'), {
                    type: 'video',
                    description: '{"title": "Really a nice place", "introduction": "Never think it so easy"}'
                }).then(function (response) {
                    data = response;
                    content = {
                        type: 'video',
                        mediaId: data.media_id,
                        description: '我是描述',
                        title: '我是标题'
                    };
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                });
            });
        }
        // 未检测
        else if (message.Content == '11') {
            return new Promise(function (resolve, reject) {
                wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'), {}).then(function (response) {
                        var picData = response;
                        var media = {
                            articles: [{
                                title: 'tututu4',
                                thumb_media_id: picData.media_id,
                                author: 'Scott',
                                digest: '没有摘要',
                                show_cover_pic: 1,
                                content: '没有内容',
                                content_source_url: 'https://github.com'
                            }, {
                                title: 'tututu5',
                                thumb_media_id: picData.media_id,
                                author: 'Scott',
                                digest: '没有摘要',
                                show_cover_pic: 1,
                                content: '没有内容',
                                content_source_url: 'https://github.com'
                            }]
                        };
                        return media;
                    }).then(function (media) {
                    var data = wechatApi.uploadMaterial('news', media, {});
                    return data;
                }).then(function (media_id) {
                    console.log(media_id.media_id);
                    var data = wechatApi.fetchMaterial(media_id.media_id, 'news', {});
                    console.log(data);
                    return data;
                }).then(function(response){
                    console.log(response);
                    var data =response;
                    var items = data.news_item;
                    var news = [];
                    items.forEach(function (item) {
                        news.push({
                            title: item.title,
                            decription: item.digest,
                            picUrl: picData.url,
                            url: item.url
                        })
                    });
                });
            });
        } else if (message.Content == '12') {
            return new Promise(function (resolve, reject) {
                wechatApi.createGroup('two').then(function () {
                    wechatApi.fetchGroups('two').then(function (data) {
                        console.log(data);
                    });
                });
            });
        } else if(message.Content=='13'){
            // oQlKmwzqG5gu0iJ689_bjO6KzTHQ
            return new Promise(function (resolve, reject) {
                wechatApi.blackDelete('oQlKmwzqG5gu0iJ689_bjO6KzTHQ');
            })
        } else if(message.Content=='14'){
            return new Promise(function(){
                wechatApi.blackFetch().then(function(res){
                    console.log(res);
                })
            })
        } else if(message.Content=='15'){
            // 临时二维码
            // var tempQr = {
            //   expire_seconds: 400000,
            //   action_name: 'QR_SCENE',
            //   action_info: {
            //     scene: {
            //       scene_id: 123
            //     }
            //   }
            // }
            // 永久二维码
            // var permQr = {
            //   action_name: 'QR_LIMIT_SCENE',
            //   action_info: {
            //     scene: {
            //       scene_id: 123
            //     }
            //   }
            // }
            // 字符串形式二维码
            // var permStrQr = {
            //   action_name: 'QR_LIMIT_STR_SCENE',
            //   action_info: {
            //     scene: {
            //       scene_str: 'abc'
            //     }
            //   }
            // }
            // var qr1 = yield wechatApi.createQrcode(tempQr)
            // var qr2 = yield wechatApi.createQrcode(permQr)
            // var qr3 = yield wechatApi.createQrcode(permStrQr)
        } else if(message.Content=='16'){
            return new Promise(function(){
                var semanticData = {
                    query: '寻龙诀',
                    city: '杭州',
                    category: 'movie',
                    uid: message.FromUserName
                };
                wechatApi.semantic(semanticData).then(function(_semanticData){
                    content = JSON.stringify(_semanticData);
                    reply = util.tpl(content, message);
                    weixin.send(reply);
                })
            });
        }
    }
    // 接收普通消息图片
    else if (message.MsgType == 'image') {
        content = '你输入的是图片消息';
        reply = util.tpl(content, message);
        weixin.send(reply);
    }
    // 接收普通消息语音
    else if (message.MsgType == 'voice') {
        content = '你输入的是语音消息';
        reply = util.tpl(content, message);
        weixin.send(reply);
    }
    // 接收普通消息视频
    else if (message.MsgType == 'video') {
        content = '你输入的是视频消息';
        reply = util.tpl(content, message);
        weixin.send(reply);
    }
    // 接收普通消息短视频
    else if (message.MsgType == 'shortvideo') {
        content = '你输入的是视频消息';
        reply = util.tpl(content, message);
        weixin.send(reply);
    }
    // 接收普通消息地理位置
    else if (message.MsgType == 'location') {
        content = '你当前在' + message.Label + '坐标' + message.Location_X + message.Location_Y;
        reply = util.tpl(content, message);
        weixin.send(reply);
    }
    // 接收普通消息链接
    else if (message.MsgType == 'link') {
        content = '你输入的是链接消息';
        reply = util.tpl(content, message);
        weixin.send(reply);
    }
};