import regeneratorRuntime from '../../static/js/regenerator-runtime';
const util = require('../../utils/util')
const api = require('../../api/api')
const app = getApp()
const wxCharts = require('../../static/js/wxcharts-min');

var lineChart = null;
var startPos = null;

Page({
    data: {
        session: {},
        dateFilter: {
            startDate: util.formatDate(new Date(new Date()-7*24*60*60*1000)),
            endDate: util.formatDate(new Date())
        },
        yesterdayVisits: {},
        productVisits: [],
        cumulativeVisits: {}
    },
    onLoad: async function (opt) {
        let that = this;
        try{
            await app.getSession(session => {
                that.setData({
                    session: session
                })
            });

            let yesterdayVisits = await api.getYesterdayCensus()
            let productVisits = await api.getProductVisits(that.data.dateFilter)
            that.setData({
                yesterdayVisits: yesterdayVisits,
                productVisits: productVisits
            })
            this.drawCharts()
        }catch(err){
            console.error(err)
        }
    },
    drawCharts: async function(){ //绘制折线图
        let that = this;
        let cumulativeVisits = await api.getCumulativeVisits(that.data.dateFilter)
        if(util.isObjNotBlank(cumulativeVisits)){
            let windowWidth = util.getWindowWidth()
            let series = []
            cumulativeVisits.series.forEach((n)=>{
                series.push({
                    name: n.title,
                    data: n.data,
                    format: (val,name)=>{return val + "人"}
                })
            })
            lineChart = new wxCharts({
                canvasId: 'lineCanvas',
                title:{
                    name: '累积访问人数'
                },
                type: 'line',
                categories: cumulativeVisits.categories,
                animation: false,
                series: series,
                xAxis: {
                    disableGrid: false
                },
                yAxis: {
                    title: '浏览人数',
                    format: function (val) {
                        return val;
                    },
                    min: 0
                },
                width: windowWidth,
                height: 300,
                dataLabel: true, //是否在图表中显示数据值
                dataPointShape: true, //是否在图表中显示数据点图形标识
                enableScroll: true,
                extra: {
                    lineStyle: 'curve'
                }
            });
            that.setData({
                cumulativeVisits: cumulativeVisits
            })
        }

    },
    touchHandler: function (e) {
        lineChart.scrollStart(e);
    },
    moveHandler: function (e) {
        lineChart.scroll(e);
    },
    touchEndHandler: function (e) {
        lineChart.scrollEnd(e);
        lineChart.showToolTip(e, {
            format: function (item, category) {
                return category + ' ' + item.name + ':' + item.data
            }
        });
    },
    createSimulationData: function () {
        var categories = [];
        var data = [];
        for (var i = 0; i < 31; i++) {
            categories.push('8-' + (i + 1));
            data.push(Math.random()*(20-10)+10);
        }
        return {
            categories: categories,
            data: data
        }
    },
    bindStartDateChange(e) {
        let that = this;
        that.setData({
            'dateFilter.startDate': e.detail.value
        }, ()=>{
            that.reDrawCharts()
        })
    },
    bindEndDateChange(e) {
        let that = this;
        that.setData({
            'dateFilter.endDate': e.detail.value
        },()=>{
            that.reDrawCharts()
        })
    },
    reDrawCharts(){ //重绘折线图
        let dateFilter = this.data.dateFilter;
        if(util.getDayDiff(util.stringToDate(dateFilter.endDate), util.stringToDate(dateFilter.startDate))>31){
            app.tips.alert("提示","查询日期的跨度至多31天！", ()=>{})
        }else{
            this.drawCharts()
        }
    },
    goDetail: function(){ //进入浏览明细
        wx.navigateTo({url: '../census/census'})
    }

})