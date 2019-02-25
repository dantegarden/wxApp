import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util.js')
const api = require('../../api/api.js')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        template: 0,
        sectionItem: {
            sectionImageList: []
        },
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function (opt) {
        let that = this;
        try {
            //获取session
            await app.getSession(session => {
                that.setData({
                    session: session
                })
            });

            let sectionItem = app.globalData.meta.sectionItem;
            if(sectionItem){ //全局中是否存在sectionItem对象 有是修改
                that.setData({
                    sectionItem: sectionItem,
                    template: opt.template
                })
            }else{ //新增
                //do nothing
                that.setData({
                    'sectionItem.key': util.GenNonDuplicateID(),
                    'template': opt.template
                })
            }
        }catch(e){
            console.error(e)
        }
    },
    bindInputField: function(e){ //完成表单项双绑
        util.bindInputField(e,this);
    },
    uploadSectionItemImage: async function(e){ //上传图片
        let that = this;
        try{
            let res = await _wx.chooseImage()
            let data = await api.uploadImage({
                filePath: res.tempFilePaths[0],
                formData:{
                    'userId': that.data.session.userId
                }
            })
            let sectionImageList = that.data.sectionItem.sectionImageList
            sectionImageList.push({
                imageId: data.data.id
            })
            that.setData({
                'sectionItem.sectionImageList': sectionImageList
            })
        }catch(e){
            console.error(e)
        }
    },
    deleteSectionItemImage: function(e){ //删除图片
        let sectionImageList = util.remove(this.data.sectionItem.sectionImageList, n=>n.imageId==util.data(e, 'imageid'))
        this.setData({
            'sectionItem.sectionImageList': sectionImageList
        })
    },
    saveSectionItem: function(e){ //保存细项
        app.globalData.meta.sectionItem = this.data.sectionItem;
        wx.navigateBack({
            delta: 1
        })
    }
});