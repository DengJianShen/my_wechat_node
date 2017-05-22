require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Shorturl_Schema = new Schema({
    urlname: String,
    urlexplain: String,
    originalurl: String,
    shorturl: String,
    createAt: {
        type: Date,
        default: Date.now()
    }
}, {
    versionKey: false
});

Shorturl_Schema.pre('save', function (next) {
    this.createAt = Date.now();
    next();
});

var Shorturl = mongoose.model("shorturl", Shorturl_Schema);

exports.Shorturl = Shorturl;