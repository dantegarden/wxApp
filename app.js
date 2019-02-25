//app.js
import regeneratorRuntime from './static/js/regenerator-runtime'
const _wx = require('./api/wx')
const api = require('./api/api')
const tips = require('./api/tips')
const util = require('./utils/util')

App({
    onLaunch: async function (options) {
        this.updateAppVersion()

        console.log(options)
        try{
            await this.getSession()
            let session = this.globalData.session;
            if([1007,1008,1047,1048].find(elm => elm===options.scene)){
                //分享进来的
                console.log("分享进来的")
            }else{
                if(session.flag !== 1){
                    wx.reLaunch({url: '/pages/register/register'})
                }
            }
        }catch(e){
            console.log(e)
        }
        //判断session的登录标志是否是第一次进来
        //是 重定向到注册页，否 重定向到通讯录
    },
    onLoad: function(opt){
        console.log(opt)
    },
    onShow: function(opt){
        if(util.isObjNotBlank(opt)){ //记下当前的场景值
            console.log("app onshow: " + opt.scene)
            this.globalData.currentScene=opt.scene
        }
    },
    getSession: async function(cb){
        var that = this
        if(that.globalData.session){ //全局有 直接用
            await this.checkAuth(that.globalData.session)
            typeof cb == "function" && cb(that.globalData.session)
        }else{
            let session = null;
            try{ //缓存里有session 从内存里取
                session = await _wx.getStorage('session')
                session = await this.checkAuth(session)
            }catch(e){ //缓存里没有session 从后台获取 并写入缓存
                await that.login()
                session = await _wx.getStorage('session')
            }
            that.globalData.session = session
            typeof cb == "function" && cb(that.globalData.session)
        }
    },
    login: async function() {
        let lres = await _wx.login();
        let data = await api.getSession({'jscode': lres.code});
        if(data.hasOwnProperty("code") && data.code==500){
            throw err = new Error( 'getSessionKey失败' );
        }else{ //在全局对象中放置缓存的时间
            data.clock = new Date().getTime()
        }
        await _wx.setStorage('session', data)
    },
    checkAuth: async function(session){ //检查token有效期，过期就再调接口取
        if(new Date().getTime() - session.clock > session.expires_in){ //token失效
            await this.login()
            session = await _wx.getStorage('session')
            this.globalData.session = session
        }
        return session
    },
    getUserInfo: async function(cb){
        var that = this
        if(that.globalData.userInfo){
            typeof cb == "function" && cb(that.globalData.userInfo)
        }else{
            try{
                let res = await _wx.getSetting()
                if (res.authSetting['scope.userInfo']) {
                    let data = await _wx.getUserInfo()
                    that.globalData.userInfo = data.userInfo
                    typeof cb == "function" && cb(that.globalData.userInfo)
                }
            }catch(e){
                console.log(e)
            }
        }
    },
    setUserInfo: function(param){
        if(param){
            let userInfo = Object.assign(this.globalData.userInfo || {}, param);
            this.globalData.userInfo = userInfo;
        }
    },
    setSession: async function(param){
        if(param){
            let session = Object.assign(this.globalData.session || {}, param);
            this.globalData.session = session;
            await _wx.setStorage('session', session)
        }
    },
    updateAppVersion: function(){ //版本检查，自动更新
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate((res) => {  // 请求完新版本信息的回调
            if(res.hasUpdate){ //有新版本
                console.log(res)
                updateManager.onUpdateReady(()=>{
                    this.tips.confirm('更新提示','新版本已经准备好，是否重启应用？','启用','拒绝', ()=>{
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                        wx.clearStorageSync()
                    })
                })
            }
        })
    },
    goCreateAccount: function(){ //将新用户引导到注册页面
        wx.redirectTo({url: '../register/register'})
    },
    tips:{...tips}, //提示窗公共方法
    globalData: {
        userInfo: null,
        session: null,
        owner: {}, //用于tab页传参的对象,
        meta: {} //作为跨页面表单对象的缓存
    }
})