/**
 * 拖拽方法
 */

// 初始点击
const startBtn = (e, ctx, field, key="id") => {
    let id = e.currentTarget.dataset.id;
    let index = ctx.data[field].findIndex(n => n[key]===id);//获取当前点击的列表
    let busArr = ctx.data[field];//获取列表中的所有数组
    let pageY = Number(e.touches[0].pageY);//初始点击的Y点坐标
    let busActObj = busArr[index];//单独记录当前点击的数据
    ctx.setData({  //保存数据
        moveMeta: {
            sPageY:pageY,
            mPageY:pageY,
            moveSortBox:true,
            clickIndex:index,
            busActObj:busActObj
        }
    })
}

// 开始移动
const moveBtn = (e, ctx) => {
    let pageY = Number(e.touches[0].pageY)
    ctx.setData({ //记录
        moveMeta: {
            mPageY:pageY,
            moveSortBox:true,
        }
    })
}

// 结束点击
const endBtn = (e, ctx, height) => {
    let moveMeta = ctx.data.moveMeta;

    let sPageY = Number(moveMeta.sPageY); //获取初始点的坐标
    let busArr = moveMeta.busArr; //获取数组
    let pageY = Number(e.changedTouches[0].pageY);//获取结束点的坐标
    let clickIndex = Number(moveMeta.clickIndex); //初始点的位置
    let busActObj = moveMeta.busActObj;//获取初始点的列表单独数据
    let position = parseInt((pageY-sPageY)/height)+(clickIndex+1); //每个盒子固定高度90px  (结束点-初始点/盒子高度)+(初始点的位置+1)可以得到移动的位置
    busArr.splice(clickIndex,1);//删除初始数据
    busArr.splice(position,0,busActObj);//在移动点重新插入数据
    ctx.setData({//保存
        moveMeta: {
            moveSortBox:false,
            busArr:busArr
        }
    })
}

module.exports =  {
    startBtn: startBtn,
    moveBtn: moveBtn,
    endBtn: endBtn
}
