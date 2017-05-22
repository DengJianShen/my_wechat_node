require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NewsMaterial_Schema = new Schema({
    name: String,
    type: Number,
    allurl: String,
    thumburl: String,
    thumbmedia_id: String,
    digest: String,
    media_id: String,
    explain: String,
    content:String,
    author: String,
    titlepage: Number,
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
}, {
    versionKey: false
});

NewsMaterial_Schema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next();
});

var NewsMaterial = mongoose.model("NewsMaterial", NewsMaterial_Schema);

exports.NewsMaterial = NewsMaterial;