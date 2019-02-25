import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const _wx = require('../../api/wx')
const app = getApp()

Page({
    data: {
        session: {},
        messageList: [],
        currentPage: 1,
        currentTab: 0,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function(opt) {  //必然从分享进来
        let that = this;
        try{
            await app.getSession(session => {
                that.setData({
                    session: session
                })
            });
            await that.loadPage(1)
        }catch(e){
            console.error(e)
        }
    },
    onShow: function(){

    },
    clickTab: function(e){ //点击切换tab页
        if (this.data.currentTab === util.data(e, 'current')) {
            return false;
        } else {
            this.setData({
                currentPage: 1,
                messageList: [],
                currentTab: util.data(e, 'current')
            })
            this.loadPage(1)
        }
    },
    loadPage: async function(page){ //分页加载
        let that = this;
        let userId = that.data.session.userId
        try{
            let data = []
            switch (that.data.currentTab) {
                case 0:{
                    data = await api.getMessageList({userId, page})
                    break;
                }
                case 1:{
                    data = await api.getMyMessages({page})
                    break;
                }
            }

            if(data.length > 0){
                data.forEach(item => {
                    item['sendTime'] = util.autoFormatTime(item['sendTime'])
                })
                this.setData({
                    currentPage: page,
                    messageList: that.data.messageList.concat(data)
                })
            }
        }catch(e){
            console.error(e)
        }
    },
    onReachBottom: async function(){ //上拉加载更多
        let currentPage = this.data.currentPage;
        // 显示加载图标
        wx.showLoading({
            title: '玩命加载中',
        })
        this.loadPage(currentPage + 1)
        wx.hideLoading();
    },
    goMessageDetail: function(e){ //去留言详情页
        let msgId = util.data(e, 'id');
        let currentTab = this.data.currentTab
        let msgIndex = this.data.messageList.findIndex(item => item['id'] === msgId);
        if(currentTab==0){
            this.setData({
                ["messageList["+msgIndex+"].status"]: 1
            })
        }
        wx.navigateTo({url: '../message_view/view?id=' + msgId + '&type=' + currentTab})

    }
})