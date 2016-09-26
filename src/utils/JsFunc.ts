//Array.sort(ascendingProp('prop'))
//升序
// import {escape} from "querystring";
declare var escape;
export function ascendingProp(prop) {
    return function (a, b) {
        return a[prop] - b[prop];
    }
}
//降序
export function descendingProp(prop) {
    return function (a, b) {
        return b[prop] - a[prop];
    }
}
export function mapToSortArray(map, prop, sortFunc) {
    var arr = [];
    for (var k in map) {
        arr.push(map[k]);
    }
    arr.sort(sortFunc(prop));
    return arr;
}
//转换唯一数组

export function mapToArr(map) {
    var a = [];
    for (var k in map) {
        a.push(map[k])
    }
    return a;
}
//数组相同元素个数
export function arrCountSame(arrA: Array<any>, arrB: Array<any>) {
    var n = 0;
    for (var i = 0; i < arrB.length; i++) {
        var obj = arrB[i];
        if (arrA.indexOf(obj) > -1) {
            n++;
        }
    }
    return n;
}
// Array.sort().filter(arrUniqueFilter)
export function arrUniqueFilter(el, i, a): boolean {
    return i == a.indexOf(el);
}


export function loadImg(path1, callback) {
    var img = new Image();
    img.onload = callback;
    img.src = path1;
}

export function loadImgArr(pathArr, callback) {
    var count = pathArr.length;

    function onLoadImg() {
        count--;
        if (count === 0)
            callback();
    }

    for (var i = 0; i < pathArr.length; i++) {
        var p = pathArr[i];
        var img = new Image();
        img.onload = onLoadImg;
        img.src = p;
    }
}
export function combineArr(arr, num) {
    var r = [];
    (function f(t, a, n) {
        if (n == 0) {
            return r.push(t);
        }
        for (var i = 0, l = a.length; i <= l - n; i++) {
            f(t.concat(a[i]), a.slice(i + 1), n - 1);
        }
    })([], arr, num);
    return r;
}
export function formatSecond(sec, minStr = ":", secStr = "") {
    var min = Math.floor(sec / 60);
    var s = sec % 60;
    var strMin = min + "";
    var strSec = s + "";
    if (min < 10)
        strMin = "0" + strMin;
    if (s < 10)
        strSec = "0" + strSec;
    return strMin + minStr + strSec + secStr;
}

export function getLength(str) {
    ///<summary>获得字符串实际长度，中文2，英文1</summary>
    ///<param name="str">要获得长度的字符串</param>
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
}
// export function cnWrap(str, len, start = 0) {
//     var str_length = 0;
//     var str_len;
//     var str_cut = new String();
//     str_len = str.length;
//     var isCn;
//     for (var i = start; i < str_len; i++) {
//         var a = str.charAt(i);
//         str_length++;
//         isCn = false;
//         if (escape(a).length > 4) {
//             //中文字符的长度经编码之后大于4
//             str_length++;
//             isCn = true;
//         }
//         str_cut = str_cut.concat(a);
//         if (str_length >= len) {
//             var nextStart = i;
//             if (isCn)
//                 nextStart = i + 1;
//             console.log('next', str_cut, str, len, nextStart);
//             str_cut = str_cut.concat('\n').concat(cnWrap(str, len, nextStart));
//             return str_cut;
//         }
//     }
//     //如果给定字符串小于指定长度，则返回源字符串；
//     if (start == 0 && str_length < len) {
//         console.log('str', str);
//         return str;
//     }
//     return "";
// }
export function cnWrap(str, len, start = 0) {
    var str_line_length = 0;
    var str_len= str.length;
    var str_cut = new String();
    var str_out = '';
    for (var i = start; i < str_len; i++) {
        var a = str.charAt(i);
        str_line_length++;
        if (escape(a).length > 4) {
            //中文字符的长度经编码之后大于4
            str_line_length++;
        }
        str_cut = str_cut.concat(a);
        if (str_line_length >= len) {
            str_out += str_cut.concat('\n');
            str_cut = new String();
            str_line_length = 0;
        }
    }
    str_out += str_cut;
    return str_out;
}