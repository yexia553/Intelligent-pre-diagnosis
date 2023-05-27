"use strict";

// import Toast from '@vant/weapp/toast/toast';

import { promisifyAll } from 'miniprogram-api-promise'
const wxp = wx.api = {}
promisifyAll(wx, wxp)

const API_BASE_URL = 'https://panzhixiang.cn/pre-diag/api/';

// 封装通用的 request 函数  
function request(url, method, data, header) {
    // console.log(url);
    // 显示加载中  
    wx.showLoading({
        title: '加载中...',
    });
    // Toast.loading({
    //     message: '加载中...',
    //     forbidClick: true,
    //     duration: 0
    //   });
    return new Promise((resolve, reject) => {
        wx.api.request({
            url: API_BASE_URL + url,
            method: method,
            data: data,
            header: header,
        }
        ).then((response) => {
            if (response.statusCode == 200) {
                // 处理登录成功后的逻辑 
                resolve(response);
                // Toast.clear();
            } else if (response.statusCode == 429) {
                // Toast.fail({
                //     message: '咨询过于频繁，请稍后再试',
                //     forbidClick: true,
                //     duration: 5000
                // })
                setTimeout(() => {
                    wx.showLoading({
                        title: '咨询过于频繁，请稍后再试',
                        mask: true,
                    })
                }, 5000);
                return;
            }
            else {
                reject(new Error(`请求失败，状态码：${res.statusCode}`));
                return;
            }
        }).catch((error) => {
            // 处理登录失败后的逻辑  
            wx.hideLoading();
            reject(error);
            return;
        })
            .finally(() => {
                // 结束请求后的逻辑
                // Toast.clear();
                wx.hideLoading();
            });
    })
}

export default request;