import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        message: {},
        messageType: 0,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function(opt) {
        let that = this;
        if(util.isObjNotBlank(opt)) { //必然有参数
            try{
                let message = await api.getMessage({msgId: opt.id})
                message.status == 0 && await api.readMessage({msgId: opt.id})
                that.setData({
                    message: message,
                    messageType: parseInt(opt.type)
                })
            }catch(e){
                console.error(e)
            }
        }
    },
    onUnload: function(){
        //delete app.globalData.meta.message
    },
    telphone: function(e){ //点击电话图标，进入拨号界面
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.number
        })
    },
    goProfile: function(e){ //留言人的跳到名片页
        let message = this.data.message
        if(this.data.messageType==0){
            app.globalData.owner = {
                id: message.fromUserId,
                companyId: message.fromUserCompanyId
            }
        }else if(this.data.messageType==1){
            app.globalData.owner = {
                id: message.toUserId,
                companyId: message.toUserCompanyId
            }
        }

        wx.switchTab({url: '../profile/profile'})
    }
})