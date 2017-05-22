var express = require('express');
var router = express.Router();

/* 创建菜单 */
router.get('/menu/create', function (req, res, next) {
    res.render('menucreate', {
        title: '创建菜单'
    });
});

/* 菜单列表 */
router.get('/menu/list', function (req, res, next) {
    res.render('menulist', {
        title: '菜单列表'
    });
});

/* 更新菜单 */
router.get('/menu/update/:id', function (req, res, next) {
    res.render('menuupdate', {
        title: '菜单更新'
    });
});

module.exports = router;