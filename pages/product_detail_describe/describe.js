import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        describe:{
            productDescribeListImages: []
        },
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function () {
        let that = this;
        try {
            //获取session
            await app.getSession(session => {
                that.setData({
                    session: session
                })
            });

            let describe = app.globalData.meta.describe;
            if(describe){ //全局中是否存在describe对象 有是修改
                that.setData({
                    describe: describe
                })
            }else{ //新增
                //do nothing
                that.setData({
                    'describe.key': util.GenNonDuplicateID()
                })
            }

        }catch(e){
            console.error(e)
        }
    },
    bindInputField: function(e){ //完成表单项双绑
        util.bindInputField(e,this);
    },
    delUploadImage: function(e){ //删除描述图片
        let that = this;
        let imgList = that.data.describe.productDescribeListImages;
        this.setData({
            'describe.productDescribeListImages': util.remove(imgList, n => n['imageId'] === util.data(e, 'id'))
        })
    },
    uploadImage: async function(e){ //上传描述图片
        let that = this;
        let imgList = that.data.describe.productDescribeListImages;
        try{
            let res = await _wx.chooseImage()
            let data = await api.uploadImage({
                filePath: res.tempFilePaths[0],
                formData:{
                    'userId': that.data.session.userId
                }
            })
            imgList.push({
                imageId: data.data.id
            })
            that.setData({
                'describe.productDescribeListImages' : imgList
            })
        }catch(e){
            console.error(e)
        }
    },
    saveDescribe: function(e){ //保存描述
        app.globalData.meta.describe = this.data.describe;
        wx.navigateBack({
            delta: 1
        })
    }
})