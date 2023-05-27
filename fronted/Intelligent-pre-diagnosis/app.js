// app.js
App({
  onLaunch() {
    // 登录
    // wx.login({
    //   success: res => {
    //     if (res.code) {
    //       console.log(res.code);
    //     }
    //   }
    // })
    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      });
      /**
 * 监听网络状态变化
 * 可根据业务需求进行调整
 */
      console.log(111);
      wx.onNetworkStatusChange(function (res) {
        console.log(res.networkType)
        if (!res.isConnected) {
          wx.showToast({
            title: '网络已断开',
            icon: 'loading',
            duration: 2000
          })
        } else {
          wx.hideToast()
        }
      })
    })
  },
  globalData: {
    userInfo: null,
    user_login_info: null,
    search_auth_data: null,
  }
})
