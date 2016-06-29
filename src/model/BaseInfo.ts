export var isdef = function (val: any) {
    return val != undefined
};
export var prop = function (obj: any, paramName: any, v: any, callback?: any) {
    if (isdef(v)) {
        obj[paramName] = v;
        if (callback)
            callback();
    }
    else
        return obj[paramName]
};

export var obj2Class = function (obj: any, cls: any) {
    var c = new cls;
    for (var paramName in obj) {
        c[paramName] = obj[paramName];
    }
    return c;
};
export function setPropTo(data, obj) {
    for (var key in data) {
        if (obj.hasOwnProperty(key))
            obj[key] = data[key];
    }
}
export class BaseDoc {

}
export class BaseInfo {

}