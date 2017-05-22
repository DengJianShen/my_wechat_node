require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Material_Schema = new Schema({
    name: String,
    type: Number,
    url: String,
    media_id: String,
    timer: String,
    explain: String,
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

Material_Schema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next();
});

var Material = mongoose.model("Material", Material_Schema);

exports.Material = Material;