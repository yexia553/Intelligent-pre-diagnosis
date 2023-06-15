"use strict";
import request from '../utils/request.js';


// 封装具体的API请求方法  
const api = {
  // 微信登入
  wx_login: (code, nickName) => {
    let login_data = {
      'content-type': 'application/json',
      "Authorization": "Basic XXXXXXX"
    };
    return request(`login/?code=${code}&nickName=${nickName}`, 'POST', {},login_data);
  },
  get_gpt_reply: (question,openid,search_auth_data) => {
    return request(`pre_diagnosis/?question=${question}&openid=${openid}`, 'POST', {},search_auth_data);
  }
};

module.exports = api; 
