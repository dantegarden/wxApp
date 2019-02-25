import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        owner: {},
        profile: {},
        gam: {},
        ready: false,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: function(opt){ //分享进来
        util.receiveShare({
            params: opt,
            readOwnerFromGlobal: true,
            writeOwnerToGlobal: true
        }, this)
    },
    onShow: async function() {
        let that = this;
        try {
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
                //获取个人信息
                let profile = await api.getProfile({id: that.data.owner.id})
                let gam = await api.getGam({userId: that.data.session.userId, ownerId: that.data.owner.id})
                that.setData({
                    profile: profile,
                    gam: gam
                }, ()=>{
                    that.setData({ready:true})
                })
            }

            if(this.data.session.userId != this.data.owner.id) { //自己浏览不算浏览
                //计数浏览，异步
                api.saveSkim({
                    userId: that.data.session.userId,
                    ownerId: that.data.owner.id,
                    lastShareId: that.data.share.lastShareId
                })
            }
        } catch(e){
            console.error(e)
        }
    },
    onUnload: function(){
        app.globalData.owner = {};
    },
    onShareAppMessage: function(opt){ //分享和转发
        let that = this;
        let owner = this.data.profile;
        return util.share({
            title: "您好，我是"+ owner.loginName + '，这是我的名片',
            path: '/pages/profile/profile',
            imageUrl: api.imgHost + owner.avatar,
            callback: (res) => {
                if(this.data.session.userId!=owner.userId){ //自己转发不叫转发
                    this.setData({
                        'gam.shareNum': that.data.gam.shareNum + 1
                    })
                }

            }
        },this)
    },
    goHome: function(){ //回到通信录
        if(this.data.session.flag===1){
            wx.redirectTo({url: '../phonebook/phonebook'})
        }else if(this.data.session.flag===0){
            wx.redirectTo({url: '../register/register'})
        }
    },
    goEdit: function(){ //进入编辑界面
        wx.navigateTo({url: '../profile_edit/edit'})
    },
    goMyMessage: function(e){ //进入给我的留言列表
        let that = this;
        api.collectFormId({formId: e.detail.formId, toUserId: that.data.session.userId})
        wx.navigateTo({url: '../message_list/list'})
    },
    addPhoneContact: function(e){ //添加到手机通讯录
        let that = this
        let profile = that.data.profile;
        wx.addPhoneContact({
            firstName: profile.loginName,//联系人姓名
            mobilePhoneNumber: profile.phone,//联系人手机号
            organization: profile.company,
            title: profile.job
        })
    },
    leaveMessage: function(e){ //进入留言表单
        let that = this;
        wx.navigateTo({url: '../message/message?toUserId=' + that.data.owner.id +"&toUserName=" + that.data.profile.loginName })
    },
    telphone: function(e){ //点击电话图标，进入拨号界面
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.number
        })
    },
    skim: function(e){ //浏览按钮
        if(this.data.session.userId === this.data.owner.id){ //只有自己能看数据统计
            wx.navigateTo({url: '../charts/charts'})
        }
    },
    upvote: async function(e){ //点赞按钮
        let that = this;
        try{
            //计数 点赞，同步
            await api.saveUpvote({
                ownerId: that.data.owner.id,
                userId: that.data.session.userId
            })
            let upvote = that.data.gam.upvote
            let upvoteNum = that.data.gam.upvoteNum
            that.setData({
                'gam.upvoteNum' : upvote ? (upvoteNum - 1): (upvoteNum +1),
                'gam.upvote': !upvote
            })
        }catch(e){
            console.error(e)
        }
    },
    addToMyCustomer: async function(e){ //从分享进来，点击添加到我的客户
        let that = this;
        try{
            if(that.data.session.flag===0){
                //未注册的用户，让他先完成注册
                app.tips.alert("提示", "您还没有名片，请先创建名片", ()=>{
                   wx.navigateTo({url: '../card/card?from=share_to_customer&shareUserId=' + that.data.owner.id})
                });
            }else{
                //本页面的按钮只能添加到联系人
                let data = await api.addContact({
                    userId: that.data.session.userId,
                    contractId: that.data.owner.id,
                    type: 2
                });
                wx.redirectTo({url: '../phonebook/phonebook'})
            }

        }catch(e){
            console.error(e)
        }
    },
    copyToClipboard: util.copyToClipboard,
    goCreateAccount: app.goCreateAccount
})