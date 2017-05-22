var mongoose = require('mongoose');
var Menu = require('../models/menu').Menu;
var Wechat = require('../wechat/wechat');
var config = require('../wechat/config');
var wechatApi = new Wechat(config.wechat);
var Promise = require('bluebird');
var _ = require('underscore');

/* 菜单创建 */
exports.docreate = function (req, res) {
    var menuObj = req.body;
    var menu = new Menu({
        menunametpl: menuObj.menunametpl,
        menuexplaintpl: menuObj.menuexplaintpl,
        button: menuObj.button
    });
    menu.save(function (err, menu) {
        if (err) {
            console.log(err);
        }
        res.send({"errcode": 0, "errmsg": "ok"});
    });
};
/* 菜单列表输出 */
exports.outputlist = function (req, res) {
    var page = req.body.page;
    var limit = 10;
    var reply = {};
    var totalpage;
    Menu.count({}, function (err, count) {
        totalpage = Math.ceil(count/limit);
    });
    Menu
        .find({})
        .skip((page-1)*limit)
        .limit(limit)
        .exec(function(err, menu){
            reply.totalpage = totalpage;
            reply.menus = menu;
            res.send(reply);
        })
};
/* 菜单启用 */
exports.douse = function (req, res) {
    var id = req.body.id;
    if (id) {
        Menu.findOne({using: 1}, function (err, menu) {
            if (err) {
                console.log(err);
            }
            var new_menu = menu;
            new_menu.using = 0;
            new_menu.save(function (err, menu) {
                if (err) {
                    console.log(err)
                }
            })

        });
        Menu.findById(id, function (err, menu) {
            if (err) {
                console.log(err);
            }
            var new_menu = menu;
            new_menu.using = 1;
            new_menu.save(function (err, menu) {
                if (err) {
                    console.log(err)
                }
                var ues_menu = menu;
                for (var i = 0; i < ues_menu.button.length; i++) {
                    if (ues_menu.button[i].menuselected == 0) {
                        delete ues_menu.button[i].sub_button;
                    } else {
                        delete ues_menu.button[i].type;
                        delete ues_menu.button[i].media_id;
                        delete ues_menu.button[i].key;
                        delete ues_menu.button[i].url;
                    }
                    delete ues_menu.button[i].menuselected;
                    for (var key in ues_menu.button[i]) {
                        if (ues_menu.button[i][key] == '') {
                            delete ues_menu.button[i][key];
                        }
                    }
                    if (ues_menu.button[i].sub_button != undefined && ues_menu.button[i].sub_button.length > 0) {
                        for (var j = 0; j < ues_menu.button[i].sub_button.length; j++) {
                            for (var key in ues_menu.button[i].sub_button[j]) {
                                if (ues_menu.button[i].sub_button[j][key] == '') {
                                    delete ues_menu.button[i].sub_button[j][key];
                                }
                            }
                        }
                    }
                }
                var reply = {
                    button: ues_menu.button
                };
                reply = JSON.parse(JSON.stringify(reply));
                return new Promise(function () {
                    wechatApi.deleteMenu().then(function () {
                        return wechatApi.createMenu(reply)
                    }).then(function (msg) {
                        if (msg.errcode == 0) {
                            res.send({"errcode": 0, "errmsg": "ok"});
                        }
                    })
                });
            })
        });
    }
};
/* 删除菜单 */
exports.dodelete = function (req, res) {
    var id = req.body.id;
    if (id) {
        Menu.remove({
            _id: id
        }, function (err) {
            if (err) {
                console.log(err);
            }
            res.send({"errcode": 0, "errmsg": "ok"});
        });
    }
};
/* 读取菜单 */
exports.loadmenu = function (req, res) {
    var id = req.body.id;
    if (id) {
        Menu.findById(id, function (err, menu) {
            if (err) {
                console.log(err);
            }
            res.send(menu);
        })
    }
};
/* 更新菜单 */
exports.doupdate = function (req, res) {
    var menuObj = req.body;
    var id = menuObj._id;
    if (id) {
        Menu.findById(id, function (err, menu) {
            if (err) {
                console.log(err);
            }
            var new_menu = _.extend(menu, menuObj);
            new_menu.save(function (err, menu) {
                if (err) {
                    console.log(err)
                }
                res.send({"errcode": 0, "errmsg": "ok"});
            })
        })
    }
};