const util = require('../utils/util')

/***将accessToken放在header里**/
const getHeader = () =>{
    let authHeader = {}
    if(getApp().globalData.session){
        authHeader.Authorization = "bearer=" + getApp().globalData.session.accessToken
    }
    return authHeader;
}

/** 登录 **/
export const login = () => new Promise((resolve, reject) => {
    wx.login({
        success (res) {
            resolve(res)
        },
        fail (e) {
            reject(e)
        }
    })
})
/** 获取授权信息 **/
export const getSetting = (obj) => new Promise((resolve, reject) => {
    wx.getSetting({
        ...obj,
        success(res) {
            resolve(res)
        },
        fail(e) {
            reject(e)
        }
    })
})

/** 获取用户信息 **/
export const getUserInfo = (obj) => new Promise((resolve, reject) => {
    wx.getUserInfo({
        ...obj,
        success (res) {
            resolve(res)
        },
        fail (e) {
            reject(e)
        }
    })
})

/** 选择地址 **/
export const chooseLocation = () => new Promise((resolve, reject) => {
    wx.chooseLocation({
        success (res) {
            resolve(res)
        },
        fail (e) {
            reject(e)
        }
    })
})
/** 从缓存获取key **/
export const getStorage = theKey => new Promise((resolve, reject) => {
    wx.getStorage({
        key: theKey,
        success (res) {
            resolve(res.data)
        },
        fail (e) {
            reject(e)
        }
    })
})
/** 把键值对加入本地缓存 **/
export const setStorage = (theKey, theValue) => new Promise((resolve, reject) => {
    wx.setStorage({
        key: theKey,
        data: theValue,
        success () {
            resolve()
        },
        fail (e) {
            reject(e)
        }
    })
})

/** 删除缓存中的键值对 **/
export const removeStorage = theKey => new Promise((resolve, reject) => {
    wx.removeStorage({
        key: theKey,
        success (res) {
            resolve(res.data)
        },
        fail (e) {
            reject(e)
        }
    })
})

/** 清空缓存 **/
export const clearStorage = () => new Promise((resolve, reject) => {
    try {
        wx.clearStorageSync()
        resolve()
    } catch (e) {
        reject(e)
    }
})

/** 打开相册选择图片 **/
export const chooseImage = (count = 1, sourceType = ['album']) => new Promise((resolve, reject) => {
    wx.chooseImage({
        count,
        sourceType,
        success (res) {
            resolve(res)
        },
        fail (e) {
            reject(e)
        }
    })
})
/** 上传图片到服务器 **/
export const uploadFile = (obj) => new Promise((resolve, reject) => {
    wx.uploadFile({
        ...obj,
        header: Object.assign(getHeader(), obj.header),
        success (res) {
            if(res.statusCode === 200){
                res.data = JSON.parse(res.data)
                resolve(res)
            }else{
                console.error(res)
            }
        },
        fail (e) {
            reject(e)
        }
    })
})

/** 下载文件到本地 **/
export const downloadFile = (obj) => new Promise((resolve, reject) => {
    wx.downloadFile({
        ...obj,
        success: function (res) {
            if(res.statusCode === 200){
                resolve(res)
            }else{
                console.error(res)
            }
        },
        fail (e) {
            reject(e)
        }
    })
})

/** 异步ajax请求 **/
export const request = obj => new Promise((resolve, reject) => {
    wx.request({
        url: obj.url,
        data: obj.data,
        header: Object.assign({ 'content-type': 'application/json'}, getHeader(), obj.header), //x-www-form-urlencoded
        method: obj.method,
        success (res) {
            console.log(res)
            resolve(res.data)
        },
        fail (e) {
            console.log(e)
            reject(e)
        }
    })
})
/**跳转**/
export const navigateTo = (params) => {
    wx.navigateTo({
        ...params
    })
}
/**重定向**/
export const redirectTo = (params) => {
    wx.redirectTo({
        ...params
    })
}

export const queryElementById = (key) => new Promise((resolve, reject) => {
    wx.createSelectorQuery().select('#' + key).fields({
        id: true,
        dataset: true
    }).exec((res)=>{
        if(res.length>0){
            resolve(res[0])
        }else{
            reject(res)
        }
    })
})

/**
 * 保存图片到相册
 * **/
export const saveImageToPhotosAlbum = (option) => new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
        filePath: option.filePath,
        success () {
            option.success && option.success()
            resolve()
        },
        fail(errMsg){
            reject(errMsg)
        }
    })
})

/**获取群id的加密信息**/
export const getShareInfo = (option) => new Promise((resolve, reject) => {
    wx.getShareInfo({
        shareTicket: option.shareTicket,
        success(res){
            resolve(res)
        },
        fail(errMsg){
            console.error(errMsg)
            reject(errMsg)
        }
    })
})
