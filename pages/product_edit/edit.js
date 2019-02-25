import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        owner: {},
        products: [],
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: function (opt) {

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
                await that.loadProducts();
            }
        }catch(e){
            console.error(e)
        }
    },
    loadProducts: async function(){ //重载产品列表
        let products = await api.getAllProducts({id: this.data.owner.id})
        this.setData({
            products: products
        })
    },
    deleteProduct: util.throttle(function(e){ //删除产品
        let that = this;
        let productId = util.data(e, 'id')
        app.tips.confirm( '提示', '您确定要删除此产品吗？', '删除', '取消', async function(){
            try{
                await api.deleteProduct({id: productId})
                that.loadProducts();
            }catch(e){
                console.log(e)
            }
        })
    }, 3000),
    goDetail: function(e){ //查看产品详情
        let productId = util.data(e, 'id')
        wx.navigateTo({url: '../product_detail_edit/edit?productId=' + productId})
    },
    addProduct: function(e){ //添加产品
        wx.navigateTo({url: '../product_detail_edit/edit'})
    },
    pullOnProduct: async function(e){ //上架产品
        let that = this;
        let products = that.data.products;
        let productId = util.data(e, 'id')
        let product = products.find(n => n.productId === productId)
        try{
            app.tips.confirm( '提示', '您确定要上架该产品吗？', '确定', '取消', async function(){
                let res = await api.pullOnProduct({productId: productId})
                if(!res.code){
                    product.status = 1;
                    products = util.remove(products, n => n.productId === productId)
                    let index = products.findIndex(n => n.status == 0)
                    products.splice((index===-1?products.length:index),0,product)
                    that.setData({
                        'products': products
                    })
                }
            })
        }catch(e){
            console.error(e)
        }
    },
    pullOffProduct: async function(e){ //下架产品
        let that = this;
        let products = that.data.products;
        let productId = util.data(e, 'id')
        let product = products.find(n => n.productId === productId)
        try{
            app.tips.confirm( '提示', '您确定要下架该产品吗？', '确定', '取消', async function(){
                let res = await api.pullOffProduct({productId: productId})
                if(!res.code){
                    product.status = 0;
                    products = util.remove(products, n => n.productId === productId)
                    products.push(product)
                    that.setData({
                        'products': products
                    })
                }
            })
        }catch(e){
            console.error(e)
        }
    },
    orderProduct: async function(e){ //调整顺序
        let that = this;
        let productId = util.data(e, 'id')
        let products = that.data.products
        let onSaleProducts = products.filter(n => n.status===1);
        let index = onSaleProducts.findIndex(n => n.productId === productId)
        let itemList = []
        if(index!==0){
            itemList.push('向上移')
        }
        if(index!== onSaleProducts.length-1){
            itemList.push('向下移')
        }
        wx.showActionSheet({
            itemList,
            success: async function(res) {
                if (!res.cancel) {
                    if((itemList.length==2 && res.tapIndex==0)
                        || (itemList.length==1 && itemList.indexOf('向上移')>-1)){
                        await api.orderUpProduct({productId: productId})
                        util.upRecord(products, index)
                        that.setData({
                            products: products
                        })
                    }else if((itemList.length==2 && res.tapIndex==1)
                        || (itemList.length==1 && itemList.indexOf('向下移')>-1)){
                        await api.orderDownProduct({productId: productId})
                        util.downRecord(products, index)
                        that.setData({
                            products: products
                        })
                    }
                }
            }
        });
    }
})