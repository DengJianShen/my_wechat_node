var express = require('express');
var router = express.Router();

/* 注册页面 */
router.get('/admin/signup', function (req, res, next) {
    res.render('adminsignup', {
        title: '注册页面'
    });
});

/* 登录页面 */
router.get('/admin/signin', function (req, res, next) {
    res.render('adminsignin', {
        title: '登录页面'
    });
});

module.exports = router;