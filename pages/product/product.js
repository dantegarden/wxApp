import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util.js')
const api = require('../../api/api.js')
const app = getApp()

Page({
    data: {
        session: {},
        owner: {},
        products: [],
        ready: false,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: function(opt){ //分享进来
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
                let products = await api.getProducts({id: that.data.owner.id})
                that.setData({
                    products: products
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
    goDetail: function(e){
        let owner = this.data.owner
        let productId = util.data(e, 'id')
        wx.navigateTo({url: '../product_detail/detail?ownerId='+ owner.id +'&ownerCompanyId='+ owner.companyId +'&productId=' + productId})
    },
    goEdit: function(e){ //进入编辑产品主页
        let productId = util.data(e, 'id')
        wx.navigateTo({url: '../product_edit/edit'})
    },
    leaveMessage: function(){ //进入留言表单
        let that = this;
        wx.navigateTo({url: '../message/message?toUserId=' + that.data.owner.id })
    },
    onShareAppMessage: function(opt){ //点击分享按钮，分享产品详情
        let poster = opt.target.dataset.poster
        let advertising = opt.target.dataset.advertising
        return util.share({
            title: advertising || "点击查看产品推荐",
            path: '/pages/product/product',
            imageUrl: api.imgHost + poster
        },this)
    },
    goCreateAccount: app.goCreateAccount
})
