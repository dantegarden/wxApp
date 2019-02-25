import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        userId: '',
        role: '',
        formdata: {
            userId: '',
            companyId: '',
            avatar: '', //头像
            loginName: '', //姓名
            phone: '', //电话号
            company: '', //公司
            job: '', //职位
            companyAddress: '', //办公地址
            companyEmail: '', //邮箱
            signatureTitle: '个性签名',
            signature: '', //个人签名
            introductionTitle: '展示信息',
            introduction: [] //展示信息
        },
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function() { //从内存中取出必要信息
        let that = this;
        try{
            await app.getSession(session => {
                that.setData({
                    'userId': session.userId,
                    'role': session.role
                })
            });
            let formdata = await api.getProfile({id: that.data.userId})
            that.setData({
                'formdata': formdata
            })
        }catch(e){
            console.error(e)
        }
    },
    bindInputField: function(e){ //完成表单项双绑
        util.validateField(e,this);
    },
    bindCompanyAddress: async function(e){ //点击办公地址 选择地址
        let that = this;
        try{
            let res = await _wx.chooseLocation()
            that.setData({
                'formdata.companyAddress': res.address
            })
        }catch(e){
            console.log(e.errMsg)
        }
    },
    bindAvator: async function(){ //点击头像 选择并上传图片
        let that = this;
        try{
            let res = await _wx.chooseImage()
            let data = await api.uploadImage({
                filePath: res.tempFilePaths[0],
                formData:{
                    'userId': that.data.formdata.userId
                }
            })
            if(data.statusCode === 200){
                that.setData({
                    'formdata.avatar': data.data.id
                })
            }
        }catch(e){
            console.error(e.errMsg)
        }
    },
    bindIntroductionImg: async function(){//点击+号 选择并上传展示信息
        let that = this;
        try{
            let res = await _wx.chooseImage()
            let data = await api.uploadImage({
                filePath: res.tempFilePaths[0],
                formData:{
                    'userId': that.data.formdata.userId
                }
            })
            let introduction = that.data.formdata.introduction
            introduction.push({imageId: data.data.id})
            that.setData({
                'formdata.introduction': introduction
            })
        }catch(e){
            console.error(e.errMsg)
        }
    },
    delIntroductionImg: function(e){ //点击删除 展示信息图片
        let introduction = this.data.formdata.introduction
        introduction = util.remove(introduction, n=> n['imageId']==util.data(e, 'imageid'))
        this.setData({
            'formdata.introduction': introduction
        })
    },
    saveCard: util.throttle(async function(e){// 保存
        let that = this;
        util.validateForm({
            ctx: that,
            form: e.detail.value,
            validation: 'formdata',
            success: async ()=>{
                try{
                    let res = await api.saveCard(that.data.formdata);
                    if(res){
                        wx.switchTab({url: '../profile/profile'})
                    }else{
                        console.error(res)
                    }
                }catch(e){
                    console.error(e)
                }
            }
        })
    }, 3000)
})