// 通用前缀
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
// 生成带参数的二维码专属前缀
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/';
// 生成ticket前缀
var semanticUrl = 'https://api.weixin.qq.com/semantic/search?';
var api = {
    semanticUrl: semanticUrl,
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {
        // 上传临时素材
        upload: prefix + 'media/upload?',
        // 获取临时素材（即下载临时的多媒体文件）
        fetch: prefix + 'media/get?'
    },
    permanent: {
        // 上传永久素材
        upload: prefix + 'material/add_material?',
        // 获取永久素材（根据media_id通过本接口下载永久素材）
        fetch: prefix + 'material/get_material?',
        // 上传图片
        uploadNews: prefix + 'material/add_news?',
        // 上传图文信息
        uploadNewsPic: prefix + 'media/uploadimg?',
        // 删除永久素材
        del: prefix + 'material/del_material?',
        // 修改图文素材
        update: prefix + 'material/update_news?',
        // 获取永久素材数目
        count: prefix + 'material/get_materialcount?',
        // 获取素材列表
        batch: prefix + 'material/batchget_material?'
    },
    group: {
        // 创建分组
        create: prefix + 'groups/create?',
        // 获取分组人员
        fetch: prefix + 'groups/get?',
        // 查询用户存在的分组
        check: prefix + 'groups/getid?',
        // 修改分组名
        update: prefix + 'groups/update?',
        // 移动用户到指定分组
        move: prefix + 'groups/members/update?',
        // 批量移动用户到指定分组
        batchupdate: prefix + 'groups/members/batchupdate?',
        // 删除分组
        del: prefix + 'groups/delete?'
    },
    user: {
        // 设置用户备注名
        remark: prefix + 'user/info/updateremark?',
        // 获取用户基本信息（单个）
        fetch: prefix + 'user/info?',
        // 获取用户基本信息（批量，最大100）
        batchFetch: prefix + 'user/info/batchget?',
        // 获取用户列表
        list: prefix + 'user/get?',
        // 拉黑用户
        black: prefix + 'tags/members/batchblacklist?',
        // 拉黑列表
        blackFetch: prefix + 'tags/members/getblacklist?',
        // 取消拉黑
        blackDelete: prefix + 'tags/members/batchunblacklist?'
    },
    mass: {
        // 指定分组群发
        group: prefix + 'message/mass/sendall?',
        // 指定openid发送
        openId: prefix + 'message/mass/send?',
        // 删除发送
        del: prefix + 'message/mass/delete?',
        // 发送预览
        preview: prefix + 'message/mass/preview?',
        // 查看群发效果
        check: prefix + 'message/mass/get?'
    },
    menu: {
        // 创建菜单
        create: prefix + 'menu/create?',
        // 查询菜单
        get: prefix + 'menu/get?',
        // 删除菜单
        del: prefix + 'menu/delete?',
        // 修改菜单
        current: prefix + 'get_current_selfmenu_info?'
    },
    qrcode: {
        // 创建临时或永久二维码
        create: prefix + 'qrcode/create?',
        // 换取二维码
        show: mpPrefix + 'showqrcode?'
    },
    shortUrl: {
        // 生成短链接
        create: prefix + 'shorturl?'
    },
    ticket: {
        // 获取票据
        get: prefix + 'ticket/getticket?'
    }
};
module.exports = api;