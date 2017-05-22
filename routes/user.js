var express = require('express');
var router = express.Router();

/* 用户列表 */
router.get('/user/list', function (req, res, next) {
    res.render('userlist', {
        title: '用户列表'
    });
});

/* 黑名单列表 */
router.get('/user/blacklist', function (req, res, next) {
    res.render('userblacklist', {
        title: '黑名单列表'
    });
});

module.exports = router;