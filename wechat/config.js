//引入路径模块
var path = require('path');
//读写access_token
var util = require('../util/util');
//access_token文件
var wechat_file = path.join(__dirname,'../config/wechat.txt');
var wechat_ticket_file = path.join(__dirname,'../config/wechat_ticket.txt');
var config = {
    wechat: {
        appID: 'wx6eb7a8240316e634',
        appSecret: '2cbf661f5faee3b36c4a308fd09664ee',
        token: 'dengjianshenye',
        //获取access_token
        getAccessToken: function() {
            return util.readFileAsync(wechat_file)
        },
        //存储access_token
        saveAccessToken: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data)
        },
        //获取ticket
        getTicket: function() {
            return util.readFileAsync(wechat_ticket_file)
        },
        //存储ticket
        saveTicket: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_ticket_file, data)
        }
    }
};
module.exports = config;