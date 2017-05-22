var express = require('express');
var router = express.Router();

/* 关键字列表 */
router.get('/followreply/list', function (req, res, next) {
    res.render('followreplylist', {
        title: '被关注回复列表'
    });
});

module.exports = router;