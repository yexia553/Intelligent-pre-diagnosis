
/*
  *  base64编码
 */
function base64_encode(str) {

    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";//64个基本的编码

    let c1, c2, c3;
    let len = str.length;//需编码字符串的长度
    let i = 0;
    let out = "";//输出

    while (i < len) {

        //位数不足情况
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {//一个字节 没有数据用 = 补上
            out += chars.charAt(c1 >> 2);
            out += chars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {//两个字节 没有数据用 = 补上
            out += chars.charAt(c1 >> 2);
            out += chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += chars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        //位数足的情况
        c3 = str.charCodeAt(i++);
        out += chars.charAt(c1 >> 2);
        out += chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += chars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += chars.charAt(c3 & 0x3F);
    }

    return out;
}

/*
  *  base64编码（中文转 Unicode 编码，避免出现乱码）
 */
function utf16to8(str) {
    let out = "";
    let len = str.length;
    for (let i = 0; i < len; i++) {
        let c = str.charCodeAt(i);//返回指定位置的字符的 Unicode 编码
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);//返回指定位置的字符
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));//fromCharCode 是将 Unicode 编码转为一个字符
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}

/*
  *  base64解码
 */
function base64_decode(input) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
        enc1 = chars.indexOf(input.charAt(i++));
        enc2 = chars.indexOf(input.charAt(i++));
        enc3 = chars.indexOf(input.charAt(i++));
        enc4 = chars.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }
    return utf8_decode(output);
}

/*
  *  utf-8解码
  *  @parm : str 传入的字符串
 */
function utf8_decode(str) {
    var string = '';
    let i = 0;
    let c = 0;
    let c1 = 0;
    let c2 = 0;
    while (i < str.length) {
        c = str.charCodeAt(i);
        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if ((c > 191) && (c < 224)) {
            c1 = str.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
            i += 2;
        } else {
            c1 = str.charCodeAt(i + 1);
            c2 = str.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
            i += 3;
        }
    }
    return string;
}

/*
  * base64编码函数封装
*/
function baseEncode(str) {
    return base64_encode(utf16to8(str));
}

/*
  * base64解码函数封装
*/
function baseDecode(str) {
    return base64_decode(str);
}

module.exports = {
    baseEncode,
    baseDecode
}
