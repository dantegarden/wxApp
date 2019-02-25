import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util.js')
const api = require('../../api/api.js')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        ready: false,
        qrStyleCode: 0,
        shareImage: '',
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function (opt) {
        let that = this;
        if(util.isObjNotBlank(opt)){
            util.receiveShare({
                params: opt,
                callback: ()=>{
                    this.setData({
                        ownerId: parseInt(opt.ownerId),
                        productId : parseInt(opt.productId)
                    })
                }
            }, this)

            try {
                //获取session
                await app.getSession(session => {
                    that.setData({
                        session: session
                    })
                });
                this.eventDraw()
            }catch(e){
                console.error(e)
            }
        }
    },
    eventDraw: async function(e){
        let that = this;
        wx.showLoading({
            title: '绘制分享图片中',
            mask: true
        })

        try{
            let myProfile = await api.getProfile({id: that.data.session.userId})
            let product = await api.getProduct({id: that.data.productId})
            let photos = await api.getQrCard({
                ...that.data.share,
                shareId: util.GenNonDuplicateID()
            })

            //随机样式
            let qrStyleCode =  that.data.qrStyleCode % 5
            that.setData({
                qrStyleCode: qrStyleCode + 1
            })

            that.setData({
                painting: {
                    width: 375,
                    height: 555,
                    clear: true,
                    views: [
                        { //背景图
                            type: 'image',
                            url: that.data.staticImgHost + `/qrcode_bg_${qrStyleCode}.jpg`,
                            top: 0,
                            left: 0,
                            width: 375,
                            height: 555
                        },
                        { //推荐人头像
                            type: 'image',
                            url: photos.userUrl?(that.data.imgHost + photos.userUrl):(that.data.staticImgHost + "/face4.jpg"),
                            top: 27.5,
                            left: 29,
                            width: 55,
                            height: 55
                        },
                        { //头像框
                            type: 'image',
                            url: that.data.staticImgHost + `/qrcode_tx_${qrStyleCode}.png`,
                            top: 27.5,
                            left: 29,
                            width: 55,
                            height: 55
                        },
                        {
                            type: 'text',
                            content: '您的好友【'+ myProfile.loginName +'】',
                            fontSize: 16,
                            color: '#FFFFFF',
                            textAlign: 'left',
                            top: 33,
                            left: 96,
                            bolder: true
                        },
                        {
                            type: 'text',
                            content: '发现一件好货，邀请您一起关注！',
                            fontSize: 15,
                            color: '#FFFFFF',
                            textAlign: 'left',
                            top: 59.5,
                            left: 96
                        },
                        { //产品图
                            type: 'image',
                            url: photos.productUrl?(that.data.imgHost + photos.productUrl +"/290/186"):(that.data.staticImgHost + "/noneproduct.jpg"),
                            top: 121,
                            left: 42.5,
                            width: 290,
                            height: 186
                        },
                        { //二维码
                            type: 'image',
                            url: that.data.imgHost + photos.codeUrl,
                            top: 443,
                            left: 85,
                            width: 68,
                            height: 68
                        },
                        {
                            type: 'text',
                            content: product.productName,
                            fontSize: 16,
                            lineHeight: 21,
                            color: '#383549',
                            textAlign: 'left',
                            top: 321,
                            left: 44,
                            width: 287,
                            MaxLineNumber: 3,
                            breakWord: true,
                            bolder: true
                        },
                        {
                            type: 'text',
                            content: '￥' + product.currentPrice,
                            fontSize: 19,
                            color: '#E62004',
                            textAlign: 'left',
                            top: 384,
                            left: 44.5,
                            bolder: true
                        },
                        {
                            type: 'text',
                            content: '原价:￥' + product.originalPrice,
                            fontSize: 13,
                            color: '#7E7E8B',
                            textAlign: 'left',
                            top: 390,
                            left: 115,
                            textDecoration: 'line-through'
                        },
                        {
                            type: 'text',
                            content: '长按识别图中二维码了解详情~',
                            fontSize: 14,
                            color: '#383549',
                            textAlign: 'left',
                            top: 460,
                            left: 165.5,
                            lineHeight: 20,
                            MaxLineNumber: 2,
                            breakWord: true,
                            width: 125
                        }
                    ]
                }
            })
        }catch(e){
            console.error(e)
        }
    },
    eventGetImage: function(event){
        console.log(event)
        wx.hideLoading()
        const { tempFilePath, errMsg } = event.detail
        if (errMsg === 'canvasdrawer:ok') {
            this.setData({
                shareImage: tempFilePath,
                ready: true
            })
        }
    },
    saveToPhotoAlbum: async function(e){ //保存图片到相册
        let that = this;
        _wx.saveImageToPhotosAlbum({
            filePath: that.data.shareImage,
            success (res) {
                app.tips.alert("分享二维码已保存到相册", "快去分享给朋友，让更多的朋友发现这里的美好", ()=>{});
            }
        })
    }
})