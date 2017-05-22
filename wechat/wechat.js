var api = require('./api');
var menu = require('./../wx/menu');
//描述了异步调用的返回结果
var Promise = require('bluebird');
//引入request http请求模块
var request = Promise.promisify(require('request'));
var util = require('../util/util');
var fs = require('fs');
//引用lodash合并链式iteratee大大降低迭代的次数
var _ = require('lodash');

//wechatApi.deleteMenu().then(function(){
//	return wechatApi.createMenu(menu)
//}).then(function(msg){
//	console.log(msg)
//})

function Wechat(opts) {
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.getTicket = opts.getTicket;
    this.saveTicket = opts.saveTicket;
    this.fetchAccessToken();
    this.fetchTicket();
}

// 获取access_token
Wechat.prototype.fetchAccessToken = function () {
    var that = this;
    // 获取access_token
    return this.getAccessToken()
        .then(function (data) {
            try {
                // 格式化access_token为json
                data = JSON.parse(data)
            } catch (e) {
                // 没有access_token就更新
                return that.updateAccessToken()
            }
            // access_token有效性检测
            if (that.isValidAccessToken(data)) {
                return Promise.resolve(data)
            } else {
                return that.updateAccessToken()
            }
        })
        .then(function (data) {
            that.saveAccessToken(data);
            return Promise.resolve(data)
        })
};
// access_token合法性检测返回true或false
Wechat.prototype.isValidAccessToken = function (data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());
    if (now < expires_in) {
        return true
    } else {
        return false
    }
};
// 更新access_token
Wechat.prototype.updateAccessToken = function () {
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
    return new Promise(function (resolve, reject) {
        request({
            url: url,
            json: true
        }).then(function (response) {
            var data = response.body;
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;
            resolve(data)
        })
    })
};
// 获取ticket
Wechat.prototype.fetchTicket = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (response) {
                var access_token = response.access_token;
                that.getTicket()
                    .then(function (data) {
                        try {
                            data = JSON.parse(data)
                        } catch (e) {
                            return that.updateTicket(access_token)
                        }
                        if (that.isValidTicket(data)) {
                            return Promise.resolve(data)
                        } else {
                            return that.updateTicket(access_token)
                        }
                    }).then(function (data) {
                    that.saveTicket(data);
                    return Promise.resolve(data)
                })
            })
    });
};
// ticket合法性检测
Wechat.prototype.isValidTicket = function (data) {
    if (!data || !data.ticket || !data.expires_in) {
        return false
    }
    var ticket = data.ticket;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());

    if (ticket && now < expires_in) {
        return true
    } else {
        return false
    }
};
// 更新ticket
Wechat.prototype.updateTicket = function (access_token) {
    var url = api.ticket.get + '&access_token=' + access_token + '&type=jsapi';
    return new Promise(function (resolve, reject) {
        request({
            url: url,
            json: true
        }).then(function (response) {
            var data = response.body;
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;
            resolve(data)
        })
    })
};
// 上传临时或永久素材
Wechat.prototype.uploadMaterial = function (type, material, permanent) {
    var that = this;
    var form = {};
    var uploadUrl = api.temporary.upload;
    if (permanent) {
        uploadUrl = api.permanent.upload;
        _.extend(form, permanent)
    }
    // 类型区分不同的上传地址
    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic;
    }
    if (type === 'news') {
        uploadUrl = api.permanent.uploadNews;
        form = material
    } else {
        // createReadStream根据所需的数据点点处理
        form.type = type;
        form.media = fs.createReadStream(material);
    }
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = uploadUrl + 'access_token=' + data.access_token;
                if (!permanent) {
                    url += '&type=' + type
                } else {
                    form.access_token = data.access_token
                }
                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                };
                if (type === 'news') {
                    options.body = form
                } else {
                    options.formData = form
                }
                request(options).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('Upload material fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 获取临时或永久素材
Wechat.prototype.fetchMaterial = function (mediaId, type, permanent) {
    var that = this;
    var fetchUrl = api.temporary.fetch;
    if (permanent) {
        fetchUrl = api.permanent.fetch
    }
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = fetchUrl + 'access_token=' + data.access_token;
                var form = {};
                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                };
                if (permanent) {
                    form.media_id = mediaId;
                    // form.access_token = data.access_token;
                    options.body = form
                } else {
                    if (type == 'video') {
                        url = url.replace('https://', 'http://')
                    }
                    url += '&media_id=' + mediaId
                }
                if (type == 'news' || type == 'video') {
                    request(options).then(function (response) {
                        var _data = response.body;
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('fetch material fails')
                        }
                    }).catch(function (err) {
                        reject(err)
                    })
                } else {
                    resolve(url)
                }
            })
    })
};
// 删除永久素材
Wechat.prototype.deleteMaterial = function (mediaId) {
    var that = this;
    var form = {
        "media_id": mediaId
    };
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete material fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 更新永久素材
Wechat.prototype.updateMaterial = function (news) {
    var that = this;
    var form = news;
    // _.extend(form, news);
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id=' + news.media_id;
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete material fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 永久素材计数
Wechat.prototype.countMaterial = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.permanent.count + 'access_token=' + data.access_token;
                request({
                    method: 'GET',
                    url: url,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Count material fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 获取素材列表
Wechat.prototype.batchMaterial = function (options) {
    var that = this;
    options.type = options.type || 'image';
    options.offset = options.offset || 0;
    options.count = options.count || 1;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.permanent.batch + 'access_token=' + data.access_token;
                request({
                    method: 'POST',
                    url: url,
                    body: options,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('batch material fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 创建用户分组
Wechat.prototype.createGroup = function (name) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.group.create + 'access_token=' + data.access_token;
                var form = {
                    group: {
                        name: name
                    }
                };
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('create group material fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 获取用户分组
Wechat.prototype.fetchGroups = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.group.fetch + 'access_token=' + data.access_token;

                request({
                    url: url,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Fetch group fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 获取用户当前所在分组
Wechat.prototype.checkGroup = function (openId) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.group.check + 'access_token=' + data.access_token;
                var form = {
                    openid: openId
                };

                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Check group fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 修改分组名
Wechat.prototype.updateGroup = function (id, name) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.group.update + 'access_token=' + data.access_token
                var form = {
                    group: {
                        id: id,
                        name: name
                    }
                };
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Update group fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 移动用户到指定分组
Wechat.prototype.moveGroup = function (openIds, to) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url;
                var form = {
                    to_groupid: to
                };
                if (openIds instanceof Array) {
                    url = api.group.batchupdate + 'access_token=' + data.access_token;
                    form.openid_list = openIds
                } else {
                    url = api.group.move + 'access_token=' + data.access_token;
                    form.openid = openIds
                }
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Move group fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 删除分组
Wechat.prototype.deleteGroup = function (id) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.group.del + 'access_token=' + data.access_token;
                var form = {
                    group: {
                        id: id
                    }
                };
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete group fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 设置用户备注名
Wechat.prototype.remarkUser = function (openId, remark) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.user.remark + 'access_token=' + data.access_token;
                var form = {
                    openid: openId,
                    remark: remark
                };
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Remark user fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 获取用户基本信息
Wechat.prototype.fetchUsers = function (openIds, lang) {
    var that = this;
    lang = lang || 'zh_CN';
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var options = {
                    json: true
                };
                if (openIds instanceof Array) {
                    options.url = api.user.batchFetch + 'access_token=' + data.access_token;
                    options.body = {
                        user_list: []
                    };
                    openIds.forEach((openid)=> {
                        var obj = {};
                        obj.openid = openid;
                        options.body.user_list.push(obj);
                    });
                    options.method = 'POST'
                } else {
                    options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openIds + '&lang=' + lang
                }
                request(options).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Fetch user fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 获取用户列表
Wechat.prototype.listUsers = function (openId) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.user.list + 'access_token=' + data.access_token;

                if (openId) {
                    url += '&next_openid=' + openId
                }
                request({
                    url: url,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('List user fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 拉黑用户
Wechat.prototype.black = function (openIds) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var options = {
                    json: true,
                    method: 'POST',
                };
                options.url = api.user.black + 'access_token=' + data.access_token;
                if (openIds instanceof Array) {
                    options.body = {
                        openid_list: openIds
                    };
                } else {
                    var openid_list = [openIds];
                    options.body = {
                        openid_list: openid_list
                    };
                }
                request(options).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Fetch user fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 取消拉黑用户
Wechat.prototype.blackDelete = function (openIds) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var options = {
                    json: true,
                    method: 'POST',
                };
                options.url = api.user.blackDelete + 'access_token=' + data.access_token;
                if (openIds instanceof Array) {
                    options.body = {
                        openid_list: openIds
                    };
                } else {
                    var openid_list = [openIds];
                    options.body = {
                        openid_list: openid_list
                    };
                }
                request(options).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Fetch user fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 获取拉黑列表
Wechat.prototype.blackFetch = function (openid) {
    var that = this;
    var begin_openid = openid || '';
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var options = {
                    json: true,
                    method: 'POST'
                };
                options.url = api.user.blackFetch + 'access_token=' + data.access_token;
                options.body = {
                    begin_openid: begin_openid
                };
                request(options).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('List user fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 按分组群发
Wechat.prototype.sendByGroup = function (type, message, groupId) {
    var that = this;
    var msg = {
        filter: {},
        msgtype: type
    };
    msg[type] = message;
    if (groupId == 'undefined') {
        msg.filter.is_to_all = true
    } else {
        msg.filter = {
            is_to_all: false,
            group_id: groupId
        }
    }
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.mass.group + 'access_token=' + data.access_token;
                request({
                    method: 'POST',
                    url: url,
                    body: msg,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Send to group fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 对指定openid群发
Wechat.prototype.sendByOpenId = function (type, message, openIds) {
    var that = this;
    var openIds = openIds;
    if(openIds.length==1){
        openIds.push('');
    }
    var msg = {
        msgtype: type,
        touser: openIds
    };
    msg[type] = message;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.mass.openId + 'access_token=' + data.access_token;
                request({
                    method: 'POST',
                    url: url,
                    body: msg,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Send By Openid fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 删除群发
Wechat.prototype.deleteMass = function (msgId) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.mass.del + 'access_token=' + data.access_token;
                var form = {
                    msg_id: msgId
                };
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete mass fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 预览群发
Wechat.prototype.previewMass = function (type, message, openId) {
    var that = this;
    var msg = {
        msgtype: type,
        touser: openId
    };
    msg[type] = message;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.mass.preview + 'access_token=' + data.access_token;
                request({
                    method: 'POST',
                    url: url,
                    body: msg,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Preview mass fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 统计群发效果
Wechat.prototype.checkMass = function (msgId) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.mass.check + 'access_token=' + data.access_token;
                var form = {
                    msg_id: msgId
                };
                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Check mass fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 创建菜单
Wechat.prototype.createMenu = function (menu) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.menu.create + 'access_token=' + data.access_token;
                request({
                    method: 'POST',
                    url: url,
                    body: menu,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Create menu fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 获取菜单
Wechat.prototype.getMenu = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.menu.get + 'access_token=' + data.access_token;
                request({
                    url: url,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Get menu fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 删除全部菜单
Wechat.prototype.deleteMenu = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.menu.del + 'access_token=' + data.access_token;
                request({
                    url: url,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete menu fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 修改自定义菜单
Wechat.prototype.getCurrentMenu = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.menu.current + 'access_token=' + data.access_token;
                request({
                    url: url,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Get current menu fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 创建二维码
Wechat.prototype.createQrcode = function (qr) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.qrcode.create + 'access_token=' + data.access_token;
                request({
                    method: 'POST',
                    url: url,
                    body: qr,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Create qrcode fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 显示二维码
Wechat.prototype.showQrcode = function (ticket) {
    return api.qrcode.show + 'ticket=' + encodeURI(ticket)
};
// 长链接转短链接
Wechat.prototype.createShorturl = function (action, url) {
    action = action || 'long2short';
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var shorurl = api.shortUrl.create + 'access_token=' + data.access_token;
                var form = {
                    action: action,
                    long_url: url
                };
                request({
                    method: 'POST',
                    url: shorurl,
                    body: form,
                    json: true
                }).then(function (response) {
                    var _data = response.body;
                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Create shorturl fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
// 微信语义接口
Wechat.prototype.semantic = function (semanticData) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that
            .fetchAccessToken()
            .then(function (data) {
                var url = api.semanticUrl + 'access_token=' + data.access_token;
                semanticData.appid = data.appID;

                request({
                    method: 'POST',
                    url: url,
                    body: semanticData,
                    json: true
                }).then(function (response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Semantic fails')
                    }
                }).catch(function (err) {
                    reject(err)
                })
            })
    })
};
module.exports = Wechat;