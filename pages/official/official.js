import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util.js')
const api = require('../../api/api.js')
const app = getApp()

Page({
    data: {
        session: {},
        owner: {},
        official:{},
        ready: false,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: function (opt) { //分享进来
        util.receiveShare({
            params: opt,
            readOwnerFromGlobal: true,
            writeOwnerToGlobal: true
        }, this)
    },
    onShow: async function(){
        let that = this;
        try{
            //获取session
            await app.getSession(session => {
                that.setData({
                    session: session
                })
            });
            //从全局变量中获取owner
            that.setData({
                owner: app.globalData.owner
            });
            //owner存在
            if(that.data.owner){
                let official = await api.getOfficial({id: that.data.owner.companyId})
                that.setData({
                    official: official
                }, ()=>{
                    that.setData({ready: true})
                })
            }
        }catch(e){
            console.error(e)
        }
    },
    onUnload: function(){
        app.globalData.owner = {};
    },
    goEdit: function(e){
        wx.navigateTo({url: "../official_edit/edit"})
    },
    onShareAppMessage: function(opt){ //分享官网
        let official = this.data.official
        return util.share({
            title: "邀请您关注"+ official.officialName +"官网",
            path: '/pages/official/official',
            imageUrl: api.imgHost + official.poster
        },this)
    },
    previewImage: function(e){ //长按放大图片
        let that = this;
        wx.previewImage({
            urls: [that.data.imgHost + util.data(e, 'id') + "_large"]
        })
    },
    goCreateAccount: app.goCreateAccount
})