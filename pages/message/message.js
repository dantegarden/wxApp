import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session:{},
        message:{},
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function(opt) {
        let that = this;//
        if(util.isObjNotBlank(opt)){
            let toUserName = opt.toUserName||"这个人";
            wx.setNavigationBarTitle({title: "给"+ toUserName + "留言"}) //收信人的名字
            //获取session
            await app.getSession(session => {
                that.setData({
                    session: session
                })
            });

            let fromUserId = that.data.session.userId;
            try{
                let sender = await api.getProfile({id: fromUserId}) //获得发信人信息
                that.setData({
                    message: {
                        fromUserId: fromUserId,
                        toUserId: opt.toUserId,
                        loginName: sender.loginName,
                        company: sender.company,
                        phone: sender.phone,
                        words: ''
                    }
                })
            }catch(e){
                console.error(e)
            }
        }
    },
    bindInputField: function(e){ //完成表单项双绑
        util.validateField(e,this);
    },
    sendMessage: util.throttle(async function(e){ //留言
        let that = this;
        let formId = e.detail.formId
        util.validateForm({
            ctx: that,
            form: e.detail.value,
            validation: 'message',
            success: async ()=>{
                try{
                    await api.saveMessage({
                        formId: formId,
                        message: that.data.message
                    })
                    app.tips.alert("提示", "留言成功！", () => {
                        wx.navigateBack({
                            delta: 1
                        })
                    })
                }catch(err){
                    console.error(err)
                }
            }
        })
    },3000)
})