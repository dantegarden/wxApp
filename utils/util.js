import regeneratorRuntime from '../static/js/regenerator-runtime';
import validator from '../static/js/validator.min'
const _wx = require('../api/wx')
const api = require('../api/api')
let simpleValidator = new validator();

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = function(date, split) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day].map(formatNumber).join(split || '-')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const formatWeek = date => {
    return "星期"+"天一二三四五六 ".charAt(date.getDay());
}

/**自动格式化日期**/
const autoFormatTime = n => {
    let cur = new Date(n)
    let now = new Date();
    let diffDate = now.getDate()-cur.getDate();

    if(diffDate===0){ //今天
        return [cur.getHours(), cur.getMinutes()].map(formatNumber).join(':')
    }else if(diffDate===1){ //昨天
        return "昨天 " + [cur.getHours(), cur.getMinutes()].map(formatNumber).join(':')
    }else if(diffDate===2){ //前天
        return "前天 " + [cur.getHours(), cur.getMinutes()].map(formatNumber).join(':')
    }else if(diffDate>2 && diffDate<7){ //星期几
        return formatWeek(cur) + " " + [cur.getHours(), cur.getMinutes()].map(formatNumber).join(':')
    }else if(now.getMonth() - cur.getMonth() < 12){
        return cur.getMonth()+1 + "月" + cur.getDate() + "日"
    }else {
        return [cur.getFullYear(), cur.getMonth()+1, cur.getDate()].map(formatNumber).join('/')
    }
}

/**字符串转日期**/
const stringToDate = function(dateStr,separator){
    if(!separator){
        separator="-";
    }
    var dateArr = dateStr.split(separator);
    var year = parseInt(dateArr[0]);
    var month;
    //处理月份为04这样的情况
    if(dateArr[1].indexOf("0") == 0){
        month = parseInt(dateArr[1].substring(1));
    }else{
        month = parseInt(dateArr[1]);
    }
    var day = parseInt(dateArr[2]);
    var date = new Date(year,month -1,day);
    return date;
}

/***计算时间跨度（天）****/
const getDayDiff = function(date1, date2){
    var dateTime = 1000*60*60*24; //每一天的毫秒数
    var minusDays = Math.floor(((date1.getTime()-date2.getTime())/dateTime));//计算出两个日期的天数差
    var days = Math.abs(minusDays);//取绝对值
    return days;
}

/**按规则校验字段**/
const validate = (field_value, rules) => {
    let r = false;
    let errMsg = '';
    try{
        rules && rules.split(" ").forEach(rule => {
            switch(rule){
                case "required": {
                    r = simpleValidator.required(field_value)
                    errMsg = "必填项"
                    break;
                }
                case "phone": {
                    r = field_value=="" || simpleValidator.isPhone(field_value) || simpleValidator.isTel(field_value)
                    errMsg = "请输入正确的电话号码"
                    break;
                }
                case "money": {
                    r = field_value=="" || simpleValidator.isMoney(field_value)
                    errMsg = "请输入正确的金额"
                    break;
                }
                case "email": {
                    r = field_value=="" || simpleValidator.isEmail(field_value)
                    errMsg = "请输入正确的邮箱"
                    break;
                }
            }
            if(!r) throw new Error('validateDeny');
        })
    }catch(e){
        if(e.message=="validateDeny"){
            //do nothing
        }else{
            throw e;
        }
    }
    return [r,errMsg];
}

/**复制到剪贴板**/
const copyToClipboard = (event) => {
    wx.setClipboardData({
        data: data(event, 'value') +"",
        success: function(res) {
            wx.showToast({
                title: '复制成功',
                icon: 'succes'
            })
        }
    })
}

/**统一校验入口**/
const validateField = (event,that) => {
    let need_validate = data(event, 'validate')
    if(need_validate && JSON.parse(need_validate)){
        let field_value = event.detail.value;
        let rules = data(event, 'validateRules')
        let [r,errMsg] = validate(field_value, rules)
        that.setData({
            ["validation." + data(event, 'field') + ".isErr"]: !r,
            ["validation." + data(event, 'field') + ".errMsg"]: errMsg,
        })
    }
    bindInputField(event, that)
}

/**提交时的校验方法**/
const validateForm = (option) => {
    let validateResult = true;
    let promiseArr = []

    Object.keys(option.form).forEach(key => {
        promiseArr.push(_wx.queryElementById(key))
    })
    Promise.all(promiseArr).then((result) => {
        for(let i in result){
            let res = result[i]
            let is_validate = res.dataset.validate;
            if(is_validate && JSON.parse(is_validate)){
                let [field,field_value,rules] = [res.dataset.field, option.form[res.id], res.dataset.validateRules];
                let [r,errMsg] = validate(field_value, rules)
                option.ctx.setData({
                    ["validation." + field + ".isErr"]: !r,
                    ["validation." + field + ".errMsg"]: errMsg,
                })
                validateResult = validateResult && r
            }
        }
        if(validateResult){
            option.success && option.success();
        }else{
            //app.tips.alert("请按要求输入各项信息")
            return
        }
    })
}

const bindInputField = (event,that) => {
    let changeField = {}
    let field =  event.target.dataset.field;
    changeField[field] = event.detail.value;
    that.setData(changeField);
}

const isObjNotBlank = (obj) => {
    return obj && Object.keys(obj).length>0
}


const removeObjFromArray = (_arr, _obj) => {
    let length = _arr.length;
    for (var i = 0; i < length; i++) {
        if (_arr[i] == _obj) {
            if (i == 0) {
                _arr.shift(); //删除并返回数组的第一个元素
                return _arr;
            }
            else if (i == length - 1) {
                _arr.pop();  //删除并返回数组的最后一个元素
                return _arr;
            }
            else {
                _arr.splice(i, 1); //删除下标为i的元素
                return _arr;
            }
        }
    }
}

/**从数组中删除满足指定条件的元素**/
const remove = (_arr, f) => {
    let t_arr = _arr.filter(f);
    for(var i=0; i<t_arr.length ;i++) {
        removeObjFromArray(_arr, t_arr[i])
    }
    return _arr;
}

/**生成不可重复36进制的随机字符串*/
const GenNonDuplicateID = () => {
    return Number(Math.random().toString().substr(3,10) + Date.now()).toString(36)
}

const isIntNumber = (val) =>{
    var regPos = /^\d+$/; // 非负整数
    var regNeg = /^\-[1-9][0-9]*$/; // 负整数
    if(regPos.test(val) || regNeg.test(val)){
        return true;
    }else{
        return false;
    }
}

/**
 * 从event中取得data属性
 * */
const data = (e, field) => {
    let fieldValue = e.currentTarget.dataset[field]
    return formatNumIfIsNum(fieldValue)
}

/**如果是数字字符串就转换成数字**/
const formatNumIfIsNum = (value) => {
    if(value && isIntNumber(value)){
        return parseInt(value)
    }else{
        return value;
    }
}

/**将一个数组按长度分隔成多个数组**/
const sliceArray = function(arr, len){
    if(arr && arr.length>0){
        let new_arr = []
        let cur_arr = []
        for(var i=1;i<=arr.length;i++){
            cur_arr.push(arr[i-1])
            if(i%len==0){
                new_arr.push(cur_arr)
                cur_arr = []
            }else if(i==arr.length){
                new_arr.push(cur_arr)
            }
        }
        return new_arr
    }else{
        return []
    }
}

/**函数节流**/
const throttle = (fn, gapTime) => {
    if (gapTime == null || gapTime == undefined) {
        gapTime = 1500
    }
    let _lastTime = null
    // 返回新的函数
    return function () {
        let _nowTime = + new Date()
        if (_nowTime - _lastTime > gapTime || !_lastTime) {
            fn.apply(this, arguments)   //将this和参数传给原函数
            _lastTime = _nowTime
        }
    }
}

// 交换数组元素
const swapItems = (arr, index1, index2) => {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
};

// 上移
const upRecord = (arr, index) =>{
    if(index == 0) {
        return;
    }
    swapItems(arr, index, index - 1);
};

// 下移
const downRecord = (arr, index) => {
    if(index == arr.length -1) {
        return;
    }
    swapItems(arr, index, index + 1);
};

//获取屏幕宽度
const getWindowWidth = () => {
    let windowWidth = 320;
    try {
        let res = wx.getSystemInfoSync();
        windowWidth = res.windowWidth;
    } catch (e) {
        console.error('getSystemInfoSync failed!');
    }
    return windowWidth
}

//分享统一接收口
const receiveShare = async (options, ctx) => {
    let app = getApp()
    let share = {}
    await app.getSession((session)=>{
        share.fromUserId = session.userId
    }) //当前用户

    if(isObjNotBlank(options.params)){ //路径中携带参数
        if([1007,1008,1047,1044,1048].indexOf(app.globalData.currentScene)>-1){ //分享进来的
            share.lastShareId = options.params.shareId
            share.lastFromUserId = parseInt(options.params.fromUserId)
            //记下
            if(share.lastShareId){
                console.error('记下')
                app.globalData.share = {
                    lastShareId: options.params.shareId,
                    lastFromUserId: share.lastFromUserId
                }
            }
        }
        share.ownerId = formatNumIfIsNum(options.params.ownerId)
        share.ownerCompanyId = formatNumIfIsNum(options.params.ownerCompanyId)
        options.params.hasOwnProperty("productId") && (share.productId = formatNumIfIsNum(options.params.productId))

    }else{ //路径中没参数 传参是通过全局变量的
        if(options.readOwnerFromGlobal){ //从全局变量读取owner
            share.ownerId = app.globalData.owner.id
            share.ownerCompanyId = app.globalData.owner.companyId
        }
    }

    if(options.writeOwnerToGlobal){ //将路径参数写入全局变量
        app.globalData.owner = {id: parseInt(share.ownerId), companyId: parseInt(share.ownerCompanyId)}
    }

    wx.showShareMenu({
        withShareTicket: true
    })

    if(!share.lastShareId && isObjNotBlank(app.globalData.share)){
        console.error('用上')
        share.lastShareId = app.globalData.share.lastShareId
        share.lastFromUserId = app.globalData.share.lastFromUserId
    }

    //回调
    options.callback && options.callback.apply(ctx, options.params)

    ctx.setData({
        share: share
    })
}

/***分享统一发出口***/
const share =  (options, ctx) => {
    let app = getApp()

    let pathParamsStr = '';
    let pathParams = Object.assign(ctx.data.share, options.params)
    if(!pathParams){
        pathParams = {}
    }
    pathParams.shareId = GenNonDuplicateID() //分享的逻辑id

    pathParamsStr += "?"
    Object.keys(pathParams).forEach(function(key){
        pathParamsStr += key +"="+ pathParams[key] + "&";
    });

    let defaultShare = {
        title: options.title,
        path: options.path + pathParamsStr.substring(0, pathParamsStr.length-1),
        imageUrl: options.imageUrl,
        success: async function(res){
            let groupData;
            if(res.shareTickets){ //分享到群
                groupData = await _wx.getShareInfo({
                    shareTicket: res.shareTickets[0]
                })
                groupData.session_key = app.globalData.session.session_key
            }

            //计数分享, 异步
            let reqParams = {
                shareId: pathParams.shareId,
                ...ctx.data.share,
                aesGroup: groupData
            }
            console.log("-------")
            console.log(reqParams)
            api.saveShare(reqParams)

            options.callback && options.callback.apply(ctx, res)
        },
        fail: function(){
            console.error("转发失败")
        }
    }
    console.log(defaultShare)
    return defaultShare
}

module.exports = {
    bindInputField: bindInputField,
    validateField: validateField,
    validateForm: validateForm,
    formatTime: formatTime,
    formatDate: formatDate,
    stringToDate: stringToDate,
    getDayDiff: getDayDiff,
    isObjNotBlank: isObjNotBlank,
    remove: remove,
    GenNonDuplicateID: GenNonDuplicateID,
    data: data,
    sliceArray: sliceArray,
    autoFormatTime: autoFormatTime,
    throttle: throttle,
    upRecord: upRecord,
    downRecord: downRecord,
    copyToClipboard: copyToClipboard,
    receiveShare: receiveShare,
    share: share,
    getWindowWidth: getWindowWidth
}
