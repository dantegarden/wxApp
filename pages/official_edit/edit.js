import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util.js')
const api = require('../../api/api.js')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        owner: {},
        official: {},
        metaOfficial: {},
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onShow: async function(e){
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

            let metaOfficial = that.data.metaOfficial;
            if(util.isObjNotBlank(metaOfficial)){ //是否有被保留的现场
                //TODO 接收修改的版块
                let editedSection = app.globalData.meta.section;
                if(editedSection){//填完版块回来
                    let index= metaOfficial.officialSections.findIndex(n => n.key == editedSection.key)
                    if(index > -1){ //执行修改
                        metaOfficial.officialSections[index] = editedSection; //替换
                    }else{ //执行新增
                        metaOfficial.officialSections.push(editedSection)
                    }
                    delete app.globalData.meta.section; //清理全局传输值
                }

                //还原现场
                that.setData({
                    official: metaOfficial
                })
            }else{//没有现场， 第一次进来
                let official = await api.getOfficial({id: that.data.owner.companyId})
                if(!official.id){ //没有id，第一次创建官网，需要提供几个默认版块
                    let data = that.data;
                    official = {
                        companyId: data.owner.companyId,
                        officialSections: [
                            {key: util.GenNonDuplicateID(), label: "公司简介", template: 1, sectionItems: [
                                    {key: util.GenNonDuplicateID(), sectionImageList: []}
                                ]},
                            {key: util.GenNonDuplicateID(), label: "荣誉奖项", template: 2, sectionItems: []},
                            {key: util.GenNonDuplicateID(), label: "管理团队", template: 2, sectionItems: []},
                            {key: util.GenNonDuplicateID(), label: "合作伙伴", template: 4, sectionItems: []}
                        ]
                    }
                }
                that.setData({
                    official: official
                })
            }
        }catch(e){
            console.error(e)
        }
    },
    onHide: function(){ //退到后台时，需要保存现场
        this.setData({
            metaOfficial: this.data.official
        })
    },
    bindInputField: function(e){ //完成表单项双绑
        util.bindInputField(e,this);
    },
    uploadImage: async function(e){ //更换官网封面图片
        let that = this;
        try{
            let res = await _wx.chooseImage()
            let data = await api.uploadImage({
                filePath: res.tempFilePaths[0],
                formData:{
                    'userId': that.data.session.userId
                }
            })
            that.setData({
                'official.poster' : data.data.id
            })
        }catch(e){
            console.error(e)
        }
    },
    addSection: function(e){ //添加版块
        delete app.globalData.meta.section
        wx.navigateTo({url: '../official_section_edit/edit'})
    },
    editSection: function(e){ //编辑版块
        app.globalData.meta.section = util.data(e, 'section');
        wx.navigateTo({url: '../official_section_edit/edit'})
    },
    deleteSection: function(e){ //删除版块
        let that = this;
        let sectionList = that.data.official.officialSections;
        this.setData({
            'official.officialSections': util.remove(sectionList, n => n['key'] == util.data(e, 'key'))
        })
    },
    saveOfficial: util.throttle(async function(e){ //保存官网
        let that = this;
        if(!that.data.official.officialName){
            app.tips.alert("提示","您还没有输入官网名称", ()=>{})
            return;
        }

        try{
            await api.saveOfficial({
                userId: that.data.session.userId,
                companyId: that.data.session.companyId,
                official: that.data.official
            });
            wx.navigateBack({
                delta: 1
            })
        }catch(e){
            console.error(e)
        }
    },3000)
})