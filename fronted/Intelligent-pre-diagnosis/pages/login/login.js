// pages/login/login.js
import api from '../../api/index'
import { baseEncode } from '../../utils/base64'

import Toast from '@vant/weapp/toast/toast';

const app = getApp();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		inputValue: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	},
	onInputChange(event) {
		this.setData({
			inputValue: event.detail.value
		});
	},
	onLogin() {
		if (this.data.inputValue == '') {
			wx.showToast({
				title: '请输入昵称',
				icon: 'none',
				duration: 2000
			})
			return;
		} else {
			// console.log('登录昵称：', this.data.inputValue);
			// 在这里添加登录逻辑  
			// wx.setStorageSync('nickname', this.data.inputValue)
			wx.login({
				success: (res) => {
					if (res.code) {
						api.wx_login(res.code, this.data.inputValue)
							.then(response => {
								wx.setStorageSync('login_res', response.data);
								app.globalData.user_login_info = response.data;
								// ${response.data.password}
								const base64Credentials = baseEncode(`${response.data.username}:${response.data.password}`);
								app.globalData.search_auth_data = {
									'content-type': 'application/json',
									"Authorization": "Basic " + base64Credentials
								}
								if (wx.getStorageSync('search_auth_token') == '') {
									wx.setStorageSync('search_auth_token', app.globalData.search_auth_data);
								}
								Toast.success({
									message: '登入成功,3秒后自动跳转',
									duration: 3000
								})
								setTimeout(() => {
									wx.navigateTo({
										url: '/pages/chat/chat',
									})
								}, 3000)
							})
							.catch(err => {
								wx.showToast({
									title: '登录失败，请稍后再试',
									icon: 'error',
									duration: 2000
								})
							})
					}
				}
			})
		}
	}
})