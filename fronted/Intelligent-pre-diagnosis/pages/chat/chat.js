const app = getApp();
var inputVal = '';
var msgList = [];
// var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;
var keyHeight = 0;
import Dialog from '@vant/weapp/dialog/dialog';

import api from '../../api/index'
import checkSession from '../../utils/auth'
/**
 * 初始化数据
 */
function initData(that) {
	inputVal = '';
	let chatRecord = wx.getStorageSync('chat_record') || []; //获取缓存聊天记录
	// console.log(chatRecord);
	msgList = [{
		speaker: 'server',
		contentType: 'text',
		content: '可以这样叙述您的症状：我有点感冒，流鼻涕，持续3天了，低烧37.8°，持续2天，应该挂什么科室？'
	}, ...chatRecord
	]
	that.setData({
		msgList,
		inputVal
	})
}

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		scrollHeight: '100vh',
		inputBottom: 0,
		num: 0,
		user_input: '',
		args: {
			withCredentials: true,
			lang: 'zh_CN'
		},
		inputDisabled: true,
		inputPlaceHolder: '请先登录，登入后即可搜索！',
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		initData(this);
		this.setData({
			cusHeadIcon: "../../images/my-active.png",
		});
		checkSession()
			.then(res => {
				if (res) {
					if (wx.getStorageSync('search_auth_token')) {
						app.globalData.user_login_info = wx.getStorageSync('login_res');
						this.setData({
							inputDisabled: !this.data.inputDisabled,
							inputPlaceHolder: '请输入您的症状'
						});
					} else {
						Dialog.alert({
							title: '提示',
							message: '您还未登入，无法使用搜索功能！',
							confirmButtonText: '去登入',
							confirmButtonOpenType: 'getUserInfo',
							confirmButtonColor: '#07c160',
							showCancelButton: true,
							closeOnClickOverlay: true
						}).then(() => {
							wx.navigateTo({
								url: '/pages/login/login',
							})
						}).catch(() => {
							wx.showToast({
								title: '您取消了登入，点击发送按钮即可重新登入',
								icon: 'none',
								duration: 2000
							})
						});
						;
					}
				} else {
					// console.log('session_key 已过期');
					wx.navigateTo({
						url: '/pages/login/login',
					})
				}
			})
			.catch(err => {
				// console.log(err);
			})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 获取聚焦
	 */
	focus: function (e) {
		keyHeight = e.detail.height;
		this.setData({
			scrollHeight: (windowHeight - keyHeight) + 'px'
		});
		this.setData({
			toView: 'msg-' + (msgList.length - 1),
			inputBottom: keyHeight + 'px'
		})

	},

	//失去聚焦(软键盘消失)
	blur: function (e) {
		this.setData({
			scrollHeight: '100vh',
			inputBottom: 0
		})
		this.setData({
			toView: 'msg-' + (msgList.length - 1)
		})

	},
	get_gpt_answer: function (user_say, user_openid, search_auth) {
		api.get_gpt_reply(user_say, user_openid, search_auth)
			.then(res => {
				if (res.statusCode == 200) {
					wx.hideLoading();
					let chatRecord = wx.getStorageSync('chat_record') || [];
					if (chatRecord.length >= 10) {
						chatRecord.shift(); // 移除数组开头的元素  
					}
					chatRecord.push({
						speaker: 'server',
						contentType: 'text',
						content: String(res.data.res)
					});
					wx.setStorageSync('chat_record', chatRecord);
					msgList.push({
						speaker: 'server',
						contentType: 'text',
						content: String(res.data.res)
					})
					this.setData({
						msgList
					});
				} else if (res.statusCode == 429) {
					wx.showToast({
						title: '请求过于频繁',
						icon: 'error',
						duration: 5000
					})
				}
			}).catch(err => {
				wx.showToast({
					title: '查询失败',
					icon: 'error',
					duration: 2000
				})
			})
	},
	/**
	 * 发送点击监听
	 */
	sendClick: function (e) {
		if (e.detail.value == null || e.detail.value == '') {
			wx.showToast({
				title: '请输入症状',
				icon: 'error',
				duration: 2000
			})
			return;
		} else {
			let chatRecord = wx.getStorageSync('chat_record') || [];
			if (chatRecord.length >= 10) {
				chatRecord.shift(); // 移除数组开头的元素  
			}
			chatRecord.push({
				speaker: 'customer',
				contentType: 'text',
				content: e.detail.value
			});
			wx.setStorageSync('chat_record', chatRecord);
			msgList.push({
				speaker: 'customer',
				contentType: 'text',
				content: e.detail.value
			})
			inputVal = '';
			this.setData({
				msgList,
				inputVal
			});
			let auth = app.globalData.search_auth_data == null ? wx.getStorageSync('search_auth_token') : app.globalData.search_auth_data;
			let username = app.globalData.user_login_info.username == null ? wx.getStorageSync('login_res') : app.globalData.user_login_info;
			this.get_gpt_answer(e.detail.value, username.username, auth);
		}
	},

	/**
	 * 退回上一页
	 */
	inputChange(e) {
		this.setData({
			user_input: e.detail.value
		})
	},
	sendMsg: function () {
		if (!this.data.inputDisabled) {
			if (this.data.user_input == null || this.data.user_input == '') {
				wx.showToast({
					title: '请输入症状',
					icon: 'error',
					duration: 2000
				})
				return;
			}
			let chatRecord = wx.getStorageSync('chat_record') || [];
			if (chatRecord.length >= 10) {
				chatRecord.shift(); // 移除数组开头的元素  
			}
			chatRecord.push({
				speaker: 'customer',
				contentType: 'text',
				content: this.data.user_input
			});
			wx.setStorageSync('chat_record', chatRecord);
			msgList.push({
				speaker: 'customer',
				contentType: 'text',
				content: this.data.user_input
			})
			inputVal = '';
			this.setData({
				msgList,
				inputVal,
			});
			let auth = app.globalData.search_auth_data == null ? wx.getStorageSync('search_auth_token') : app.globalData.search_auth_data;
			let username = app.globalData.user_login_info.username == null ? wx.getStorageSync('login_res') : app.globalData.user_login_info;
			this.get_gpt_answer(this.data.user_input, username.username, auth)
			this.setData({
				user_input: ''
			})
		} else {
			Dialog.alert({
				title: '提示',
				message: '您还未登入，无法使用搜索功能！',
				confirmButtonText: '去登入',
				confirmButtonOpenType: 'getUserInfo',
				confirmButtonColor: '#07c160',
				showCancelButton: true,
				closeOnClickOverlay: true
			}).then(() => {
				wx.navigateTo({
					url: '/pages/login/login',
				})
			}).catch(() => {
				wx.showToast({
					title: '您取消了登入，点击发送按钮即可重新登入',
					icon: 'none',
					duration: 2000
				})
			});
			;
		}
	}
})