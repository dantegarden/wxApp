import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util.js')
const api = require('../../api/api.js')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        section: {
            sectionItems: []
        },
        metaSection: {},
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

            let section = app.globalData.meta.section;
            if(section){ //全局中是否存在section对象 有是修改
                that.setData({
                    section: section,
                    showData: util.sliceArray(section.sectionItems, section.template)
                }, ()=>{
                    setTimeout(function(){
                        that.imgBoxFitHeights(".imgbox", section.template)
                    },500)
                })
            }else{ //新增
                //do nothing
                that.setData({
                    'section.key': util.GenNonDuplicateID(),
                })
            }

        }catch(e){
            console.error(e)
        }
    },
    onShow: function(){ //从子页面回来
        let that = this;
        let metaSection = that.data.metaSection;
        if(util.isObjNotBlank(metaSection)){ //是否有被保留的现场
            let editedSectionItem = app.globalData.meta.sectionItem;
            if(editedSectionItem){//填完细项回来
                let index = metaSection.sectionItems.findIndex(n => n.key == editedSectionItem.key)
                if(index > -1){ //执行修改
                    metaSection.sectionItems[index] = editedSectionItem; //替换
                }else{ //执行新增
                    metaSection.sectionItems.push(editedSectionItem)
                }
                delete app.globalData.meta.sectionItem; //清理全局传输值
            }
            //还原现场
            that.setData({
                'section': metaSection,
                'showData': util.sliceArray(metaSection.sectionItems, metaSection.template),
                'itemGroupHeights': []
            }, ()=>{
                setTimeout(function(){
                    that.imgBoxFitHeights(".imgbox", metaSection.template)
                },500)
            })
        }else{ //第一次进来
            //do nothing
        }
    },
    onHide: function(){ //退到后台时，需要保存现场
        this.setData({
            metaSection: this.data.section
        })
    },
    bindInputField: function(e){ //完成表单项双绑
        util.bindInputField(e,this);
    },
    selectTemplate: function(e){ //选择模板
        let that = this;
        let template = util.data(e, 'template')
        if(template==1){ //单列
            that.data.section.sectionItems.push({
                key: util.GenNonDuplicateID(),
                sectionImageList: []
            })
            this.setData({
                'section.template': template,
                'section.sectionItems': that.data.section.sectionItems
            })
        }else{
            this.setData({
                'section.template': template
            })
        }
    },
    uploadSectionImage: async function(e){ //上传版块图片
        let that = this;
        try{
            let res = await _wx.chooseImage()
            let data = await api.uploadImage({
                filePath: res.tempFilePaths[0],
                formData:{
                    'userId': that.data.session.userId
                }
            })
            let sectionItemIndex = that.data.section.sectionItems.findIndex(n => n['key']==util.data(e, 'key'))
            let sectionImageList = that.data.section.sectionItems[sectionItemIndex].sectionImageList
            sectionImageList.push({
                imageId: data.data.id
            })
            let paramKey = 'section.sectionItems['+sectionItemIndex+'].sectionImageList';
            that.setData({
               [paramKey]  : sectionImageList
            })
        }catch(e){
            console.error(e)
        }
    },
    deleteSectionImage: function(e){ //删除版块图片
        let sectionItemIndex = this.data.section.sectionItems.findIndex(n => n['key']==util.data(e, 'key'))
        let sectionImageList = this.data.section.sectionItems[sectionItemIndex].sectionImageList
        let paramKey = 'section.sectionItems['+sectionItemIndex+'].sectionImageList';
        this.setData({
            [paramKey]  : util.remove(sectionImageList, n=> n['imageId']==util.data(e, 'imageid'))
        })
    },
    deleteSectionItem: function(e){ //删除版块细项
        let that = this;
        let sectionItems = util.remove(this.data.section.sectionItems, n => n['key']==util.data(e, 'key'))
        this.setData({
            'section.sectionItems': sectionItems,
            'showData': util.sliceArray(sectionItems, that.data.section.template),
            'itemGroupHeights': []
        }, ()=>{
            setTimeout(function(){
                that.imgBoxFitHeights(".imgbox", that.data.section.template)
            },500)
        })
    },
    addSectionItem: function(e){ //添加细项
        let that = this;
        delete app.globalData.meta.sectionItem
        wx.navigateTo({url: '../official_section_edit_tpl2/tpl2?template=' + that.data.section.template})
    },
    editSectionItem: function(e){ //编辑细项
        let that = this;
        app.globalData.meta.sectionItem = util.data(e, 'sectionitem');
        wx.navigateTo({url: '../official_section_edit_tpl2/tpl2?template=' + that.data.section.template})
    },
    saveSection: function(e){ //保存版块
        app.globalData.meta.section = this.data.section;
        wx.navigateBack({
            delta: 1
        })
    },
    imgBoxFitHeights: function(selector, template){ //调整同行各个块的高度
        let that = this;
        let query = wx.createSelectorQuery()//创建节点查询器 query
        query.selectAll(selector + template).boundingClientRect();
        query.exec(function(res){
            if(res.length>0){
                let itemGroupHeights = []
                util.sliceArray(res[0], template).forEach(item => {
                    itemGroupHeights.push(Math.max(...item.map(n => n.height)))
                })
                that.setData({
                    'itemGroupHeights': itemGroupHeights
                })
            }
        })
    }
})