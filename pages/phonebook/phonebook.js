import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        phonebook: {
            me: {},
            workmates: [], //同事
            customers: []  //客户
        },
        currentTab: 0,
        ready: false,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: function(){
        util.receiveShare({},this)
    },
    onShow: async function() {
        let that = this;
        try{
            await app.getSession(session => {
                that.setData({
                    session: session
                })
            });

            if(that.data.session.flag!==1){ //未注册用户误入通讯录页
                await _wx.clearStorage() //清除缓存
                wx.reLaunch({url: '/pages/register/register'}) //打回到注册页
            }else{ //正常进入
                await that.loadData() //加载通讯录的数据
            }
        }catch(e){
            console.log(e.errMsg)
        }
    },
    loadData: async function(e){ //加载数据
        let that = this;
        try{
            let cardList = await api.getPhoneBook({userId : that.data.session.userId})
            if(cardList.length > 0){
                let me = cardList.find(card => card.contacttype===0)
                that.setData({
                    'role': me && me.role,
                    'phonebook.me': me||{},
                    'phonebook.workmates' : cardList.filter(card => card.contacttype===1) || [],
                    'phonebook.customers' : cardList.filter(card => card.contacttype===2) || []
                }, ()=>{ //渲染结束后显示页面
                    that.setData({ready:true})
                })
                await app.setSession({role: me.role, companyId: me.companyId})
            }
        }catch(e){
            console.error(e)
        }
    },
    clickTab: function(e){ //点击切换tab页
        if (this.data.currentTab === util.data(e, 'current')) {
            return false;
        } else {
            this.setData({
                currentTab: util.data(e, 'current')
            })
        }
    },
    viewProfile: function(e){ //查看用户详情
        let userId = util.data(e, 'userid');
        app.globalData.owner = {
            id: userId,
            type: util.data(e, 'usertype'),
            companyId: util.data(e, 'companyid')
        }
        wx.switchTab({
            url: '../profile/profile'
        })
    },
    showSelection: function(e) { //长按出现选项
        let that = this;
        if(this.data.phonebook.me.role === 1){ //管理员才能点出来
            let itemList = [
                (util.data(e, 'role')===1?'取消':'设为') + "管理员",
                '删除'
            ]
            wx.showActionSheet({
                itemList,
                success: async function(res) {
                    if (!res.cancel) {
                        switch(res.tapIndex){
                            case 0:{
                                await api.setAdmin({targetUserId: util.data(e, 'userid')})
                                await that.onPullDownRefresh() //重新加载数据
                                break;
                            }
                            case 1:{ //删除
                                await api.deleteWorkmate({targetUserId : util.data(e, 'userid')})
                                await that.onPullDownRefresh() //重新加载数据
                                break;
                            }
                        }
                    }
                }
            });
        }
    },
    onPullDownRefresh: async function (e){ //下拉刷新数据
        try{
            wx.showNavigationBarLoading();
            await this.loadData()
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
        }catch(e){
            console.error(e)
        }
    },
    onShareAppMessage: function(opt){ //分享
        let me = this.data.phonebook.me;
        if(opt.target.dataset.from === "myCard"){ //分享我的名片
            return util.share({
                title: "您好，我是"+ me.loginName + '，这是我的名片',
                path: '/pages/profile/profile',
                params:{ownerId: me.userId, ownerCompanyId: me.companyId},
                imageUrl: api.imgHost + me.avatar
            },this)
        }else if(opt.target.dataset.from === "workmateButton"){ //邀请同事
            return {
                title: me.loginName + "诚邀您加入" + me.company,
                path: '/pages/invite/invite?shareUserId=' + me.userId,
                imageUrl: '{{ staticImgHost }}/invite_workmate.jpg'
            }
        }else{ //上方自带的分享按钮
            return {
                title: me.loginName + "推荐您使用小程序",
                path: '/pages/register/register',
            }
        }
    }
})