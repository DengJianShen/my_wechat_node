require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Menu_Schema = new Schema({
    menunametpl: String,
    menuexplaintpl: String,
    button: {
        type: Array,
        default: []
    },
    using: {
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

Menu_Schema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next();
});

var Menu = mongoose.model("menu", Menu_Schema);

exports.Menu = Menu;