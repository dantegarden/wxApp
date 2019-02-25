import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util.js')
const api = require('../../api/api.js')
const app = getApp()

Page({
    data: {
        userId: '',
        currentList: [],
        currentTab: 0,
        currentPage: 1,
        imgHost: api.imgHost,
        staticImgHost: api.staticImgHost
    },
    onLoad: async function () {
        let that = this;
        try{
            await app.getSession(session => {
                that.setData({
                    userId: session.userId
                })
            });
            await this.loadPage(1);
        }catch(e){
            console.error(e)
        }
    },
    clickTab: function(e){ //点击切换tab页
        if (this.data.currentTab === util.data(e, 'current')) {
            return false;
        } else {
            this.setData({
                currentPage: 1,
                currentList: [],
                currentTab: util.data(e, 'current')
            })
            this.loadPage(1)
        }
    },
    loadPage: async function(page){
        let that = this;
        let userId = that.data.userId
        try{
            let data = []
            switch (that.data.currentTab) {
                case 0:{
                    data = await api.getSkimInfo({userId, page})
                    break;
                }
                case 1:{
                    data = await api.getUpvoteInfo({userId, page})
                    break;
                }
                case 2:{
                    data = await api.getShareInfo({userId, page})
                    break;
                }
            }
            if(data.length > 0){
                this.setData({
                    currentPage: page,
                    currentList: this.data.currentList.concat(data)
                })
            }
        }catch(e){
            console.error(e)
        }
    },
    onReachBottom: async function(){ //上拉加载更多
        let that = this;
        let currentPage = this.data.currentPage;
        // 显示加载图标
        wx.showLoading({
            title: '玩命加载中',
        })
        this.loadPage(currentPage + 1)
        wx.hideLoading();
    }
})