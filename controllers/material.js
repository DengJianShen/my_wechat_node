var mongoose = require('mongoose');
var Material = require('../models/material').Material;
var NewsMaterial = require('../models/newsmaterial').NewsMaterial;
var Wechat = require('../wechat/wechat');
var config = require('../wechat/config');
var wechatApi = new Wechat(config.wechat);
var Promise = require('bluebird');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

/* 获取素材列表 */
exports.outputlist = function (req, res) {
    var page = req.body.page;
    var limit = req.body.limit;
    var type = req.body.type==4?0:req.body.type;
    var reply = {};
    var totalpage;
        Material.count({type:type}, function (err, count) {
            totalpage = Math.ceil(count / limit);
        });
        Material
            .find({type:type})
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(function (err, materials) {
                reply.totalpage = totalpage;
                reply.materials = materials;
                res.send(reply);
            });
};
/* 获取图文素材列表 */
exports.outputnewslist = function (req, res) {
    var page = req.body.page;
    var limit = req.body.limit;
    var reply = {};
    var totalpage;
    NewsMaterial.count({}, function (err, count) {
        totalpage = Math.ceil(count / limit);
    });
    NewsMaterial
        .find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(function (err, materials) {
            reply.totalpage = totalpage;
            reply.materials = materials;
            res.send(reply);
        });
};
/* 删除素材 */
exports.delete = function(req,res){
  var media_id = req.body.media_id;
    return new Promise(function(){
        wechatApi.deleteMaterial(media_id).then(function(response){
            if(response.errcode==0){
                Material.findOne({media_id: media_id}, function (err, media) {
                    if (err) {
                        console.log(err);
                    }
                    Material.remove({
                        media_id: media_id
                    }, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        fs.unlinkSync('./public' + media.url);
                        res.send({"errcode": 0, "errmsg": "ok"});
                    });
                });
            }
        })
    })
};
/* 素材上传_图片 */
exports.uploadimgmaterial = function (req, res) {
    var _data = {};
    var form = new formidable.IncomingForm();
    form.uploadDir = './public/upload/material/images';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.multiples = false;
    form.on('field', function (name, value) {
        _data[name] = value;
    });
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.send(err);
            return;
        }
    });
    form.on('file', function (name, file) {
            if (file.type != 'image/jpg' && file.type != 'image/jpeg' && file.type != 'image/png' && file.type != 'image/bmp') {
                this.emit('error', "不允许的类型");
                fs.unlink(file.path);
            } else {
                _data.url = file.path.replace('public','');
                if(_data.timer=='temporary'){
                    return new Promise(function () {
                        wechatApi.uploadMaterial('image', file.path).then(function (response) {
                            _data.media_id = response.media_id;
                            var img = new Material({
                                name: _data.materialname,
                                type: _data.materialtype,
                                url: _data.url,
                                media_id: _data.media_id,
                                explain: _data.materialexplain,
                                timer: _data.timer
                            });
                            img.save(function (err, img) {
                                if (err) {
                                    console.log(err);
                                }
                                res.redirect('/material/list');
                            });
                        })
                    })
                }else if(_data.timer=='permanent'){
                    return new Promise(function () {
                        wechatApi.uploadMaterial('image', file.path,{type: 'image'}).then(function (response) {
                            _data.media_id = response.media_id;
                            var img = new Material({
                                name: _data.materialname,
                                type: _data.materialtype,
                                url: _data.url,
                                media_id: _data.media_id,
                                explain: _data.materialexplain,
                                timer: _data.timer
                            });
                            img.save(function (err, img) {
                                if (err) {
                                    console.log(err);
                                }
                                res.redirect('/material/list');
                            });
                        })
                    })
                }
            }
    });
    form.on('end', function () {
        // res.send({"errcode": 1, "errmsg": "not"});
    });
    form.on('error', function (err) {
        res.send(err);
    });
};
/* 素材上传_视频 */
exports.uploadvideomaterial = function (req, res) {
    var _data = {};
    var form = new formidable.IncomingForm();
    form.uploadDir = './public/upload/material/videoes';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.multiples = false;
    form.on('field', function (name, value) {
        _data[name] = value;
    });
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.send(err);
            return;
        }
    });
    form.on('file', function (name, file) {
            if (file.type != 'video/mp4') {
                this.emit('error', "不允许的类型");
                fs.unlink(file.path);
            }
            else {
                _data.url = file.path.replace('public','');
                if(_data.timer=='temporary'){
                    return new Promise(function () {
                        wechatApi.uploadMaterial('video', file.path).then(function (response) {
                            _data.media_id = response.media_id;
                            var video = new Material({
                                name: _data.materialname,
                                type: _data.materialtype,
                                url: _data.url,
                                media_id: _data.media_id,
                                explain: _data.materialexplain,
                                timer: _data.timer
                            });
                            video.save(function (err, video) {
                                if (err) {
                                    console.log(err);
                                }
                                res.redirect('/material/list');
                            });
                        })
                    })
                }else if(_data.timer=='permanent'){
                    var description = {
                        "title":_data.materialname,
                        "introduction":_data.materialexplain
                    };
                    return new Promise(function () {
                        wechatApi.uploadMaterial('video', file.path,{type: 'video', description: JSON.stringify(description)}).then(function (response) {
                            _data.media_id = response.media_id;
                            var video = new Material({
                                name: _data.materialname,
                                type: _data.materialtype,
                                url: _data.url,
                                media_id: _data.media_id,
                                explain: _data.materialexplain,
                                timer: _data.timer
                            });
                            video.save(function (err, video) {
                                if (err) {
                                    console.log(err);
                                }
                                res.redirect('/material/list');
                            });
                        })
                    })
                }
            }
    });
    form.on('end', function () {
        // res.send({"errcode": 1, "errmsg": "not"});
    });
    form.on('error', function (err) {
        res.send(err);
    });
};
/* 素材上传_音频 */
exports.uploadvoicematerial = function (req, res) {
    var _data = {};
    var form = new formidable.IncomingForm();
    form.uploadDir = './public/upload/material/voices';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.multiples = false;
    form.on('field', function (name, value) {
        _data[name] = value;
    });
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.send(err);
            return;
        }
    });
    form.on('file', function (name, file) {
        if (file.type != 'audio/mp3' && file.type != 'audio/wav' && file.type != 'audio/wma' && file.type != 'audio/amr') {
            this.emit('error', "不允许的类型");
            fs.unlink(file.path);
        } else {
            _data.url = file.path.replace('public','');
            if(_data.timer=='temporary'){
                return new Promise(function () {
                    wechatApi.uploadMaterial('voice', file.path).then(function (response) {
                        _data.media_id = response.media_id;
                        var voice = new Material({
                            name: _data.materialname,
                            type: _data.materialtype,
                            url: _data.url,
                            media_id: _data.media_id,
                            explain: _data.materialexplain,
                            timer: _data.timer
                        });
                        voice.save(function (err, voice) {
                            if (err) {
                                console.log(err);
                            }
                            res.redirect('/material/list');
                        });
                    })
                })
            }else if(_data.timer=='permanent'){
                return new Promise(function () {
                    wechatApi.uploadMaterial('voice', file.path,{type: 'voice'}).then(function (response) {
                        _data.media_id = response.media_id;
                        var voice = new Material({
                            name: _data.materialname,
                            type: _data.materialtype,
                            url: _data.url,
                            media_id: _data.media_id,
                            explain: _data.materialexplain,
                            timer: _data.timer
                        });
                        voice.save(function (err, voice) {
                            if (err) {
                                console.log(err);
                            }
                            res.redirect('/material/list');
                        });
                    })
                })
            }
        }
    });
    form.on('end', function () {
        // res.send({"errcode": 1, "errmsg": "not"});
    });
    form.on('error', function (err) {
        res.send(err);
    });
};
/* 新增图文 */
exports.uploadnewsmaterial = function(req,res){
    var newsObj = req.body;
    var _media = {
        articles: [{
            title: newsObj.materialname,
            thumb_media_id: newsObj.materialthumb,
            author: newsObj.materialauthor,
            digest: newsObj.materialdigest,
            show_cover_pic: newsObj.materialtitlepage,
            content: newsObj.materialcontent,
            content_source_url: newsObj.materialallurl
        }]
    };
    return new Promise(function(){
        wechatApi.uploadMaterial('news', _media, {}).then(function(response){
            var media_id = response.media_id;
            var thumburl;
            Material.findOne({media_id: newsObj.materialthumb}, function (err, material) {
                if (err) {
                    console.log(err);
                }
                thumburl = material.url;
                var news = new NewsMaterial({
                    name: newsObj.materialname,
                    type: newsObj.materialtype,
                    allurl: newsObj.materialallurl,
                    thumburl: thumburl,
                    thumbmedia_id: newsObj.materialthumb,
                    digest: newsObj.materialdigest,
                    media_id: media_id,
                    explain: newsObj.materialexplain,
                    content: newsObj.materialcontent,
                    author: newsObj.materialauthor,
                    titlepage: newsObj.materialtitlepage,
                });
                news.save(function (err, news) {
                    if (err) {
                        console.log(err);
                    }
                    res.send({"errcode": 0, "errmsg": "ok"});
                });
            });
        })
    })
};
/* 修改图文 */
exports.updatenewsmaterial = function(req,res){
    var newsObj = req.body;
    var _media = {
        media_id:newsObj.materialmedia_id,
        index:0,
        articles: {
            title: newsObj.materialname,
            thumb_media_id: newsObj.materialthumb,
            author: newsObj.materialauthor,
            digest: newsObj.materialdigest,
            show_cover_pic: newsObj.materialtitlepage,
            content: newsObj.materialcontent,
            content_source_url: newsObj.materialallurl
        }
    };
    return new Promise(function(){
        wechatApi.updateMaterial(_media).then(function(response){
            console.log(response);
            if(response.errcode==0){
                var thumburl;
                Material.findOne({media_id: newsObj.materialthumb}, function (err, material) {
                    if (err) {
                        console.log(err);
                    }
                    thumburl = material.url;
                    var news = new NewsMaterial({
                        name: newsObj.materialname,
                        type: newsObj.materialtype,
                        allurl: newsObj.materialallurl,
                        thumburl: thumburl,
                        thumbmedia_id: newsObj.materialthumb,
                        digest: newsObj.materialdigest,
                        media_id: newsObj.materialmedia_id,
                        explain: newsObj.materialexplain,
                        content: newsObj.materialcontent,
                        author: newsObj.materialauthor,
                        titlepage: newsObj.materialtitlepage,
                    });
                    news.save(function (err, news) {
                        if (err) {
                            console.log(err);
                        }
                        res.send({"errcode": 0, "errmsg": "ok"});
                    });
                });
            }
        })
    })
};