const Node_path = require("path");
export var _path = function (path:string) {
    if (!ServerConf.isDev)
        return Node_path.join('resources', path);
    return path;
};
export var ServerConf:any = {isDev: false};
