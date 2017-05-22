var express = require('express');
var router = express.Router();

var adminCtrol = require('../controllers/admin');

/* GET home page. */
router.get('/group/list', adminCtrol.signinRequire,function(req, res, next) {
    res.render('grouplist');
});

module.exports = router;