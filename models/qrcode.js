require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Qrcode_Schema = new Schema({
    sceneid: Number,
    scenestr: String,
    scenename: String,
    sceneexplain: String,
    qrcodetype: String,
    qrcodeurl: String,
    effectivetime: Number,
    createAt: {
        type: Number,
        default: new Date().getTime()
    }
}, {
    versionKey: false
});

Qrcode_Schema.pre('save', function (next) {
    this.createAt = new Date().getTime();
    next();
});

var Qrcode = mongoose.model("qrcode", Qrcode_Schema);

exports.Qrcode = Qrcode;