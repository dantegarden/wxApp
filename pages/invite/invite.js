import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        shareUserProfile: {},
        staticImgHost: api.staticImgHost
    },
    onLoad: async function(opt) {  //必然从分享进来
        let that = this;
        try{
            if(util.isObjNotBlank(opt)){
                await app.getSession(session => {
                    that.setData({
                        session: session
                    })
                });
                //查询分享人的信息
                let shareUserProfile = await api.getProfile({id: opt.shareUserId})
                this.setData({
                    shareUserProfile: shareUserProfile
                })
            }else{
                wx.navigateBack({
                    delta: 1
                })
            }
        }catch(e){
            console.error(e)
        }
    },
    applyInvite: async function(e){ //同意邀请
        let that = this;
        console.log(that.data)
        try{
            if(that.data.session.flag===0){
                //未注册的用户，让他先完成注册
                app.tips.alert("提示", "您还没有名片，请先创建名片", ()=>{
                    wx.navigateTo({url: '../card/card?from=share_to_workmate&shareUserId=' + that.data.shareUserProfile.userId})
                });
            }else if(that.data.session.userId === that.data.shareUserProfile.userId){
                //自己看这个页面，重定向到通讯录
                wx.redirectTo({url: '../phonebook/phonebook'})
            }else{
                app.tips.confirm( '提示', '您所在的公司将会发生变更', '加入', '取消',
                    async function(){
                        //本页面的按钮只能添加到同事
                        let data = await api.addContact({
                            userId: that.data.session.userId,
                            contractId: that.data.shareUserProfile.userId,
                            type: 1
                        });
                        app.setSession({companyId: that.data.shareUserProfile.companyId})
                        wx.redirectTo({url: '../phonebook/phonebook'})
                    }
                )
            }
        }catch(e){
            console.error(e)
        }
    }
})