import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        userInfo: {},
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
        fromShare: '', //从分享进来的参数
        companyDisabled: false,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function(opt) {
        let that = this;
        try{
            //从内存中取出必要信息
            await app.getSession(session => {
                that.setData({
                    'formdata.userId': session.userId
                })
            });
            await app.getUserInfo(userInfo =>{
                that.setData({
                    'userInfo': userInfo,
                    'formdata.loginName': userInfo.nickName
                })
            });

            //下载微信头像
            let downloadRes = await _wx.downloadFile({url: that.data.userInfo.avatarUrl})
            let uploadRes = await api.uploadImage({
                filePath: downloadRes.tempFilePath,
                formData:{
                    'userId': that.data.formdata.userId
                }
            })
            that.setData({
                'formdata.avatar': uploadRes.data.id
            })


            //是否是从分享进来的，
            if(util.isObjNotBlank(opt)){
                if(opt.from==="share_to_customer"){ //分享给客户 需要多一步添加客户关系
                    this.setData({
                        fromShare: {
                            shareUserId: opt.shareUserId,
                            contacttype: 2
                        }
                    });
                }else if(opt.from==="share_to_workmate"){ //邀请同事 需要多一步添加同事关系
                    //获得邀请人的信息
                    let shareUserProfile = await api.getProfile({id: opt.shareUserId})
                    //修改表单的company与邀请人一致 并禁止公司输入
                    this.setData({
                        'formdata.companyId': shareUserProfile.companyId,
                        'formdata.company': shareUserProfile.company,
                        'companyDisabled': true
                    })
                }
            }
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
            console.error(e)
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
            console.error(e)
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
            console.error(e)
        }
    },
    delIntroductionImg: function(){ //点击删除 展示信息图片
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
                    if(res.code !== 500){
                        //修改用户的登录标志 并写入缓存
                        app.setSession({flag: 1, companyId: res.wxCompanyId});
                        if(this.data.fromShare){//从分享进来的而且是联系人
                            let fromShare = this.data.fromShare;
                            //需要添加分享人与被分享者的关系
                            let data = await api.addContact({
                                userId: that.data.formdata.userId,
                                contractId: fromShare.shareUserId,
                                type: fromShare.contacttype
                            });
                        }
                        wx.reLaunch({url: '../phonebook/phonebook'})
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