var express = require('express');
var router = express.Router();

/* 短链接列表 */
router.get('/qrcode/list', function (req, res, next) {
    res.render('qrcodelist', {
        title: '参数二维码列表'
    });
});

module.exports = router;