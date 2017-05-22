require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Black_Schema = new Schema({
    nickname: String,
    openid: String
}, {
    versionKey: false
});

var Black = mongoose.model("black", Black_Schema);

exports.Black = Black;