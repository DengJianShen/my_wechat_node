var mongoose = require('mongoose');
var Admin = require('../models/admin').Admin;

var bcrypt = require('bcrypt');

var SALT_WORK_FACTOR = 10;

/* 用户注册 */
exports.dosignup = function (req, res) {
    var adminObj = req.body;
    Admin.find({name: adminObj.adminname}, function (err, admin) {
        if (err) {
            console.log(err);
        }
        // 因为find出来的是数组,因此可通过长度判断
        if (admin.length > 0) {
            return res.redirect('/admin/signin');
        } else {
            // 密码加密保存
            bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
                if (err) {
                    console.log(err);
                }
                bcrypt.hash(adminObj.adminpassword, salt, function (err, crypted) {
                    if (err) {
                        console.log(err);
                    }
                    var admin = new Admin({
                        name: adminObj.adminname,
                        password: crypted
                    });
                    admin.save(function (err, admin) {
                        if (err) {
                            console.log(err);
                        }
                        res.redirect('/admin/signin');
                    });
                });
            });
        }
    });
};

/* 用户登录 */
exports.dosignin = function (req, res) {
    var adminObj = req.body;
    Admin.findOne({name: adminObj.adminname}, function (err, admin) {
        if (err) {
            console.log(err);
        }
        if (admin != null) {
            // 用户登录校正解密
            bcrypt.compare(adminObj.adminpassword, admin.password, function (err, isMatch) {
                if (err) {
                    console.log(err);
                }
                if (isMatch) {
                    console.log('登录成功');
                    req.session.admin = admin;
                    return res.redirect('/');
                } else {
                    console.log('登录失败');
                    return res.redirect('/admin/signin');
                }
            });
        }
    })
};

/* 用户登出 */
exports.dologout = function (req, res) {
    delete req.session.admin;
    return res.redirect('/admin/signin');
};

/* 登录状态检查 */
exports.signinRequire = function(req, res, next) {
    if (!req.session.admin) {
        return res.redirect('/admin/signin');
    }
    next();
};