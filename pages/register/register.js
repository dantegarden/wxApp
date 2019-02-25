import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const app = getApp()

Page({
    data: {
        helper: {},
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        ready: false,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function () {
        let that = this;
        try{
            //获取我司默认联系人
            let helper = await api.getProfile({id:1});
            that.setData({
                helper : helper
            }, () => {
                that.setData({ready: true})
            })
        }catch(e){
            console.error(e)
        }
    },
    bindGetUserInfo: function(e) {
        try{
            if (e.detail.userInfo){
                app.setUserInfo(e.detail.userInfo)
                wx.navigateTo({url: '../card/card'})
            }
        }catch(e){
            //用户按了拒绝
            app.tips.alert("用户未授权", "如需正常使用小程序功能，请在右上角“关于e商号”-> “设置”中，授权用户信息并点击确定。", ()=>{});
        }
    },
    viewProfile: function(e){ //查看用户详情
        let userId = 1
        app.globalData.owner = {
            id: userId,
            type: 2, //联系人
            companyId: 17
        }
        wx.switchTab({
            url: '../profile/profile'
        })
    }
})