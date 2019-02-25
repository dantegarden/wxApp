import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        productId: '',
        product: {
            productImageList: [],
            productDescribeList: []
        },
        metaProduct: {}, //用于保留和还原现场
        ready: false,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: function (opt) {
        if(util.isObjNotBlank(opt)){
            this.setData({
                productId : opt.productId
            })
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

            let metaProduct = that.data.metaProduct;
            if(util.isObjNotBlank(metaProduct)){ //是否有被保留的现场
                let editedDescribe = app.globalData.meta.describe;
                if(editedDescribe){ //填完描述回来
                    let index= metaProduct.productDescribeList.findIndex(n => n.key === editedDescribe.key)
                    if(index > -1){ //执行修改
                        metaProduct.productDescribeList[index] = editedDescribe; //替换
                    }else{ //执行新增
                        metaProduct.productDescribeList.push(editedDescribe)
                    }
                    delete app.globalData.meta.describe; //清理全局传输值
                }

                //还原现场
                that.setData({
                    product: metaProduct
                }, ()=>{
                    that.setData({ready:true})
                })
            }else{ //没有现场， 第一次进来
                if(that.data.productId){
                    let product = await api.getProduct({id: that.data.productId})
                    that.setData({
                        product: product
                    }, ()=>{
                        that.setData({ready:true})
                    })
                }else{
                    that.setData({ready:true})
                }
            }


        }catch(e){
            console.error(e)
        }
    },
    onHide: function(){ //退到后台时，需要保存现场
        this.setData({
            metaProduct: this.data.product
        })
    },
    bindInputField: function(e){ //完成表单项双绑
        util.validateField(e,this);
    },
    previewImage: function(e){ //预览图片
        let that = this;
        let metaProduct = this.data.product
        wx.previewImage({
            urls: [that.data.imgHost + util.data(e, 'id') + "_large"],
            complete: function(){
                that.setData({
                    product: metaProduct
                })
            }
        })
    },
    uploadLbtImg: async function(e){ //上传轮播图
        let that = this;
        let imgList = that.data.product.productImageList;
        try{
            let res = await _wx.chooseImage(9)
            res.tempFilePaths.forEach(async function(tmpFilePath){
                let data = await api.uploadImage({
                    filePath: tmpFilePath,
                    formData:{
                        'userId': that.data.session.userId
                    }
                })
                imgList.push({
                    imageId: data.data.id
                })
                that.setData({
                    'product.productImageList' : imgList
                })
            })

        }catch(e){
            console.error(e)
        }
    },
    deleteUploadImage: function(e){ //删除上传图片
        let that = this;
        let imgList = that.data.product.productImageList;
        this.setData({
            'product.productImageList': util.remove(imgList, n => n['imageId'] === util.data(e, 'id'))
        })
    },
    delDescribe: function(e){ //删除产品描述
        let that = this;
        let descList = that.data.product.productDescribeList;
        this.setData({
            'product.productDescribeList': util.remove(descList, n => n['key'] == util.data(e, 'key'))
        })
    },
    editDescribe: function(e){ //编辑产品描述
        app.globalData.meta.describe = util.data(e, 'item');
        wx.navigateTo({url: '../product_detail_describe/describe'})
    },
    addDescribe: function(e){ //添加产品描述
        delete app.globalData.meta.describe
        wx.navigateTo({url: '../product_detail_describe/describe'})
    },
    saveProduct: util.throttle(async function(e){ //保存产品
        let that = this;
        util.validateForm({
            ctx: that,
            form: e.detail.value,
            validation: 'product',
            success: async ()=>{
                try{
                    let data = await api.saveProduct({
                        userId: that.data.session.userId,
                        product: that.data.product
                    });
                    wx.navigateBack({
                        delta: 1
                    })
                }catch(e){
                    console.error(e)
                }
            }
        })
    }, 3000)

})