import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const app = getApp()

Page({
    data: {
        session: {},
        productId: '',
        product: {},
        ownerProfile: {},
        ready: false,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: function (opt) {
        let that = this;

        if(util.isObjNotBlank(opt)){
            let params = {}
            if(opt.hasOwnProperty("scene")){ //扫码进来的
                let urlParams = decodeURIComponent(opt.scene).split("&")
                params.productId = urlParams[0]
                params.ownerId = urlParams[1]
                params.lastFromUserId = urlParams[2]
                params.lastShareId = urlParams[3]
            }else{ //普通跳转 和 普通转发
                params = opt
            }

            util.receiveShare({
                params: params,
                writeOwnerToGlobal: true,
                callback: ()=>{
                    this.setData({
                        ownerId: parseInt(params.ownerId),
                        productId : parseInt(params.productId)
                    }, ()=>{
                        api.saveSkim({
                            userId: that.data.session.userId,
                            ownerId: that.data.ownerId,
                            productId: that.data.productId,
                            lastShareId: that.data.share.lastShareId
                        })
                    })
                }
            }, this)
        }
    },
    onShow: async function(){
        let that = this;
        try {
            //获取session
            await app.getSession(session => {
                that.setData({
                    session: session
                })
            });

            if(that.data.productId && that.data.ownerId){
                let product = await api.getProduct({id: that.data.productId})
                let profile = await api.getProfile({id: that.data.ownerId})
                that.setData({
                    product: product,
                    ownerProfile: profile
                }, ()=>{
                    that.setData({ready: true})
                })
            }

        }catch(e){
            console.error(e)
        }
    },
    previewImage: function(e){ //长按放大轮播图
        let that = this;
        wx.previewImage({
            urls: [that.data.imgHost + util.data(e, 'id') + "_large"]
        })
    },
    showShareSelectionModal: function(){ //显示分享选项
        this.setData({
            showShareModal: true
        })
    },
    hideShareSelectionModal: function(){ //隐藏分享选项
        this.setData({
            showShareModal: false
        })
    },
    onShareAppMessage: function(opt){ //点击分享按钮
        let product = this.data.product;
        return util.share({
            title: product.advertising || "点击查看产品推荐",
            path: '/pages/product_detail/detail',
            imageUrl: api.imgHost + product.poster,
            callback: ()=>{
                this.hideShareSelectionModal()
            }
        },this)
    },
    shareToCommunity: function(){ //去往生成图片分享到朋友圈页面
        let that = this;
        let share = that.data.share
        wx.navigateTo({url: '../product_share/share?ownerId='+ share.ownerId +'&ownerCompanyId='+ share.ownerCompanyId +'&productId=' + share.productId,
            success: function(){
                that.hideShareSelectionModal()
            }
        })
    },
    leaveMessage: function(){ //进入留言表单
        let that = this;
        wx.navigateTo({url: '../message/message?toUserId=' + that.data.ownerId })
    },
    goHome: function(){
        let data = this.data
        app.globalData.owner = {id: data.ownerId, companyId: data.product.companyId}
        wx.switchTab({url: '../product/product'})
    },
    goOwnerProfile: function(){ //回所有者的名片页
        let data = this.data
        app.globalData.owner = {id: data.ownerId, companyId: data.product.companyId}
        wx.switchTab({url: '../profile/profile'})
    },
    goCreateAccount: app.goCreateAccount
})