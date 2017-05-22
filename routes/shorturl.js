var express = require('express');
var router = express.Router();

/* 短链接列表 */
router.get('/shorturl/list', function (req, res, next) {
    res.render('shorturllist', {
        title: '短链接列表'
    });
});

module.exports = router;