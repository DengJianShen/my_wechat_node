var express = require('express');
var router = express.Router();

/* 素材列表 */
router.get('/material/list', function (req, res, next) {
    res.render('materiallist', {
        title: '素材列表'
    });
});

module.exports = router;