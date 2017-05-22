var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


var dbUrl = 'mongodb://localhost/wechat';

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// 验证微信
var wechat = require('./wechat/g');

// 页面
var index = require('./routes/index');
var admin = require('./routes/admin');
var menu = require('./routes/menu');
var user = require('./routes/user');
var group = require('./routes/group');
var shorturl = require('./routes/shorturl');
var qrcode = require('./routes/qrcode');
var material = require('./routes/material');
var keyreply = require('./routes/keyreply');
var followreply = require('./routes/followreply');

// 控制器
var adminCtrol = require('./controllers/admin');
var menuCtrol = require('./controllers/menu');
var userCtrol = require('./controllers/user');
var groupCtrol = require('./controllers/group');
var shorturlCtrol = require('./controllers/shorturl');
var qrcodeCtrol = require('./controllers/qrcode');
var materialCtrol = require('./controllers/material');
var keyreplyCtrol = require('./controllers/keyreply');
var followreplyCtrol = require('./controllers/followreply');

// 获取access_token
// var config = require('./wechat/config');
// var Wechat = require('./wechat/wechat');
// var _wechat = new Wechat(config.wechat);

// mongo初始化
require('./models/connect');
var mongoose = require('mongoose');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(require('connect-multiparty')());

app.use(session({
    secret: 'foo',
    store: new MongoStore({
        url: dbUrl,
        collection: 'sessions'
    })
}));

app.use(function(req, res, next) {
    req.app.locals.admin = req.session.admin;
    next()
});

// 时间戳转换
// app.locals.moment = require("moment");

app.use(index);
app.use(admin);
app.use(menu);
app.use(user);
app.use(group);
app.use(shorturl);
app.use(qrcode);
app.use(material);
app.use(keyreply);
app.use(followreply);

// 管理员操作
app.use('/admin/dosignin', adminCtrol.dosignin);
app.use('/admin/dosignup', adminCtrol.dosignup);
app.use('/admin/dologout', adminCtrol.dologout);

// 自定义菜单操作
app.post('/menu/docreate', menuCtrol.docreate);
app.post('/menu/outputlist', menuCtrol.outputlist);
app.post('/menu/dodelete', menuCtrol.dodelete);
app.post('/menu/loadmenu', menuCtrol.loadmenu);
app.post('/menu/doupdate', menuCtrol.doupdate);
app.post('/menu/douse',menuCtrol.douse);

// 回复操作
app.post('/keyreply/outputlist',keyreplyCtrol.outputlist);
app.post('/keyreply/create',keyreplyCtrol.createkeyreply);
app.post('/keyreply/update',keyreplyCtrol.updatekeyreply);
app.post('/keyreply/use',keyreplyCtrol.usekeyreply);
app.post('/keyreply/del',keyreplyCtrol.delkeyreply);

app.post('/followreply/outputlist',followreplyCtrol.outputlist);
app.post('/followreply/create',followreplyCtrol.createfollowreply);
app.post('/followreply/update',followreplyCtrol.updatefollowreply);
app.post('/followreply/use',followreplyCtrol.usefollowreply);
app.post('/followreply/del',followreplyCtrol.delfollowreply);

// 素材操作
app.post('/material/list',materialCtrol.outputlist);
app.post('/material/newslist',materialCtrol.outputnewslist);
app.post('/upload/material/image',materialCtrol.uploadimgmaterial);
app.post('/upload/material/video',materialCtrol.uploadvideomaterial);
app.post('/upload/material/voice',materialCtrol.uploadvoicematerial);
app.post('/upload/material/news',materialCtrol.uploadnewsmaterial);
app.post('/update/material/news',materialCtrol.updatenewsmaterial);
app.post('/material/delete',materialCtrol.delete);

// 用户操作
app.post('/user/black', userCtrol.black);
app.post('/user/delblack', userCtrol.delblack);
app.post('/user/blacklist', userCtrol.blacklist);
app.post('/user/outputlist', userCtrol.outputlist);
app.post('/user/send', userCtrol.send);
app.post('/user/updateremark', userCtrol.updateremark);

// 分组操作
app.post('/group/outputgroup', groupCtrol.outputgroup);
app.post('/group/creategroup', groupCtrol.creategroup);
app.post('/group/deletegroup', groupCtrol.deletegroup);
app.post('/group/updategroup', groupCtrol.updategroup);
app.post('/group/batchadd', groupCtrol.batchadd);
app.post('/group/batchsend', groupCtrol.batchsend);

// 参数二维码
app.post('/qrcode/outputlist', qrcodeCtrol.qrcodelist);
app.post('/qrcode/create', qrcodeCtrol.createqrcode);
app.post('/qrcode/delete', qrcodeCtrol.deleteurl);

// 长链接转短链接
app.post('/shorturl/outputlist', shorturlCtrol.shorturllist);
app.post('/shorturl/create', shorturlCtrol.createshorturl);
app.post('/shorturl/delete', shorturlCtrol.deleteurl);

app.use('/wechat',wechat);

app.listen(1234);

console.log('Listen: 1234');

module.exports = app;
