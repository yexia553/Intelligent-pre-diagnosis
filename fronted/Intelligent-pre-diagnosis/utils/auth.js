"use strict";

function checkSession() {
    return new Promise((resolve, reject) => {
        wx.checkSession({
            success() {
                return resolve(true)
            },
            fail() {
                return resolve(false)
            }
        })
    })
}

export default checkSession;