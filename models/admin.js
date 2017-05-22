require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Admin_Schema = new Schema({
    name: {
        unique: true,
        type: String
    },
    password: {
        unique: true,
        type: String
    },
    // 数字划分权限
    role: {
        type: Number,
        default: 0
    },
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

Admin_Schema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next();
});

var Admin = mongoose.model("admin", Admin_Schema);

exports.Admin = Admin;