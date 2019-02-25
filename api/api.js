const _wx = require('./wx')

/** http请求的host **/
const host = "https://wxmp.bjdvtyun.com"
/** 图片url的host **/
export const imgHost = `${host}/image/getImage/`
export const staticImgHost = `${host}/img`


/** 上传图片 **/
export const uploadImage = params => _wx.uploadFile({
    url:`${host}/image/upload`,
    name: 'fileName',
    ...params
});


/** 获取openid 和 userId**/
export const getSession = params => _wx.request({
    url: `${host}/user/getWxSessionKey/` + params.jscode,
    data: {},
    method: "GET"
});

/** 保存个人名片 **/
export const saveCard = params => _wx.request({
    url: `${host}/user/save`,
    data: params,
    method: "POST"
});

/** 获取个人通讯录信息 **/
export const getPhoneBook = params => _wx.request({
    url: `${host}/user/showAll/` + params.userId,
    data: {},
    method: 'GET'
});

/** 获取个人信息 **/
export const getProfile = params => _wx.request({
   url: `${host}/user/show/` + params.id,
   data: {},
   method: 'GET'
});

/** 添加用户与用户的关系
 *  type 1 同事 2 联系人
 * **/
export const addContact = params => _wx.request({
    url: `${host}/user/addContact`,
    data: params,
    method: 'POST'
});

/**变更管理员**/
export const setAdmin = params => _wx.request({
    url: `${host}/user/admin/` + params.targetUserId,
    data: {},
    method: 'GET'
})

/**删除同事**/
export const deleteWorkmate = params => _wx.request({
    url: `${host}/user/workmate/delete/` +params.targetUserId,
    data: {},
    method: 'GET'
})

/**获取社交信息
 * ownerId 被浏览人
 * userId 浏览人
 * **/
export const getGam = params => _wx.request({
    url: `${host}/user/gam`,
    data: params,
    method: 'POST'
})

/**点赞
 * ownerId 被点赞人
 * userId 点赞人
 * **/
export const saveUpvote = params => _wx.request({
    url: `${host}/user/save/upvote`,
    data: params,
    method: 'POST'
})

/**浏览
 * ownerId 被浏览人
 * userId 浏览人
 * **/
export const saveSkim = params => _wx.request({
    url: `${host}/user/save/skim`,
    data: params,
    method: 'POST'
})

/**转发
 * ownerId 被转发的人
 * userId 操作转发的人
 * **/
export const saveShare = params => _wx.request({
    url: `${host}/user/save/share`,
    data: params,
    method: 'POST'
})

/**
 * 获得浏览数据
 * userId
 * page 分页页码
 * */
export const getSkimInfo = params => _wx.request({
    url: `${host}/user/census/skim/` + params.userId + "/" + params.page,
    data: {},
    method: 'GET'
})

export const getUpvoteInfo = params => _wx.request({
    url: `${host}/user/census/upvote/` + params.userId + "/" + params.page,
    data: {},
    method: 'GET'
})

export const getShareInfo = params => _wx.request({
    url: `${host}/user/census/share/` + params.userId + "/" + params.page,
    data: {},
    method: 'GET'
})

/** 查询用户公司的全部产品列表 **/
export const getAllProducts = params => _wx.request({
    url: `${host}/product/showAll/` + params.id,
    data: {},
    method: 'GET'
})

/** 查询用户公司的上架产品列表 **/
export const getProducts = params => _wx.request({
    url: `${host}/product/showAllOnSale/` + params.id,
    data: {},
    method: 'GET'
})

/** 查询产品详情 **/
export const getProduct = params => _wx.request({
    url: `${host}/product/show/` + params.id,
    data: {},
    method: 'GET'
})

/** 保存产品明细 **/
export const saveProduct = params => _wx.request({
    url: `${host}/product/save`,
    data: params,
    method: "POST"
});

/** 删除产品 **/
export const deleteProduct = params => _wx.request({
    url: `${host}/product/delete/` + params.id,
    data: {},
    method: "GET"
})

/** 上架产品 **/
export const pullOnProduct = params => _wx.request({
    url: `${host}/product/change/status/1/` + params.productId,
    data: {},
    method: "GET"
})

/** 下架产品 **/
export const pullOffProduct = params => _wx.request({
    url: `${host}/product/change/status/0/` + params.productId,
    data: {},
    method: "GET"
})

/** 往上调产品顺序 **/
export const orderUpProduct = params => _wx.request({
    url: `${host}/product/change/order/up/` + params.productId,
    data: {},
    method: "GET"
})

/** 往下调产品顺序 **/
export const orderDownProduct = params => _wx.request({
    url: `${host}/product/change/order/down/` + params.productId,
    data: {},
    method: "GET"
})

/**获得官网信息
 * companyId
 * **/
export const getOfficial = params => _wx.request({
    url: `${host}/official/show/` + params.id,
    data: {},
    method: 'GET'
})

/** 保存官网信息
 * companyId
 * official
 * **/
export const saveOfficial = params => _wx.request({
    url: `${host}/official/save`,
    data: params,
    method: "POST"
});

/**
 * 获取留言列表
 * userId
 * page
 * **/
export const getMessageList = params => _wx.request({
    url: `${host}/user/message/showAll/` + params.userId + "/" + params.page,
    data: {},
    method: 'GET'
})

/**
 * 获取我的留言列表
 * userId
 * page
 * **/
export const getMyMessages = params => _wx.request({
    url: `${host}/user/message/getMyMessage/` + params.page,
    data: {},
    method: 'GET'
})


/**留言
 * formId
 * message
 * **/
export const saveMessage = params => _wx.request({
    url: `${host}/user/message/save`,
    data: params,
    method: "POST"
})

/**修改留言状态为已读
 * msgId
 * **/
export const readMessage = params => _wx.request({
    url: `${host}/user/message/read/` + params.msgId,
    data: {},
    method: "GET"
})

/**获取单个留言信息
 * msgId
 * **/
export const getMessage = params => _wx.request({
    url: `${host}/user/message/show/` + params.msgId,
    data: {},
    method: "GET"
})

/**
 * 收集formId
 * formId
 * toUserId
 * **/
export const collectFormId = params => _wx.request({
    url: `${host}/user/message/collect`,
    data: params,
    method: "POST"
})

/**
 * 获取二维码
 * **/
export const getQrCard = params => _wx.request({
    url: `${host}/image/getShareProduct`,
    data: params,
    method: "POST"
})

/**获取昨日概况
 * userId
 * */
export const getYesterdayCensus = params => _wx.request({
    url: `${host}/user/getYesterdayCensus`,
    data: {},
    method: "GET"
})

/**获取产品访问次数
 * productId
 * **/
export const getProductVisits = params => _wx.request({
    url: `${host}/user/getProductVisits`,
    data: params,
    method: "POST"
})

/**获取累计访问次数（图表）
 * userId
 * params: startDate, endDate
 * **/
export const getCumulativeVisits = params => _wx.request({
    url: `${host}/user/getCumulativeVisits`,
    data: params,
    method: "POST"
})

