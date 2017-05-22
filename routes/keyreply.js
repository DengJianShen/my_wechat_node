var express = require('express');
var router = express.Router();

/* 关键字列表 */
router.get('/keyreply/list', function (req, res, next) {
    res.render('keyreplylist', {
        title: '关键字回复列表'
    });
});

module.exports = router;