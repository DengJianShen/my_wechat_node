var express = require('express');
var router = express.Router();

var adminCtrol = require('../controllers/admin');

/* GET home page. */
router.get('/', adminCtrol.signinRequire,function(req, res, next) {
  res.render('index');
});

module.exports = router;
