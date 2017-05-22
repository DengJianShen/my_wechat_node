require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KeyReply_Schema = new Schema({
    name: String,
    explain: String,
    keyfont: {
        type:String,
        unique:true
    },
    type: Number,
    content:{
        type: String,
        default:null
    },
    media_id:{
        type: String,
        default:null
    },
    using: {
        type:Number,
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

KeyReply_Schema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next();
});

var KeyReply = mongoose.model("KeyReply", KeyReply_Schema);

exports.KeyReply = KeyReply;