require('./connect');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowReply_Schema = new Schema({
    name: String,
    explain: String,
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
        default: 1
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

FollowReply_Schema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }
    next();
});

var FollowReply = mongoose.model("FollowReply", FollowReply_Schema);

exports.FollowReply = FollowReply;