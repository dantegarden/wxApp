const openConfirm = function(title, content, confirmText, cancelText, success, cancel) {
    wx.showModal({
        title: title, //'弹窗标题',
        content: content, //'弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内',
        confirmText: confirmText,
        cancelText: cancelText,
        success: function (res) {
            if (res.confirm && success) {
                success();
            } else if(cancel) {
                cancel();
            }
        }
    });
}
const openAlert = function (title, content, callback) {
    wx.showModal({
        title: title,
        content: content,
        showCancel: false,
        success: function (res) {
            if (res.confirm && callback) {
                callback();
            }
        }
    });
}

module.exports = {
    alert: openAlert,
    confirm: openConfirm
}