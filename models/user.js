require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User_Schema = new Schema({
    nickname: String,
    sex: Number,
    headimgurl: String,
    groupid: Number,
    subscribe_time: Date,
    openid: String,
    city: String,
    province: String,
    country: String,
    black: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false
});

var User = mongoose.model("user", User_Schema);

exports.User = User;