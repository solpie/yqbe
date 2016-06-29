import {adminRouter} from "./router/AdminRouter";
import {initDB} from "./model/DbInfo";
import {ServerConf, _path} from "./Env";
import {dbRouter} from "./router/DbRouter";
import {SocketIOSrv} from "./SocketIOSrv";
import {panelRouter} from "./router/PanelRouter";
import {getIPAddress} from "./utils/NodeJsFunc";
import {mobileRouter} from "./router/MobileRouter";
var colors = require('colors');

var dataObj:any;
/**
 * WebServer
 */
export class WebServer {
    _path:any;
    serverConf:any;
    socketIO:SocketIOSrv;

    constructor(callback?:any) {
        let localhost = getIPAddress();
        console.log("localhost:", localhost);
        this.initEnv(callback);
        this.initGlobalFunc();
        this.initNedb();
        this.test();
    }

    test() {
        // ExternalInfo.importHuiTi();
    }

    initNedb() {
        initDB();
    }

    initGlobalFunc() {
        this._path = _path;
    }

    initEnv(callback:any) {
        var process = require("process");
        ServerConf.isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath);
        console.log(process.execPath, ServerConf.isDev);

        var fs = require('fs');
        fs.readFile(_path('app/package.json'), (err:any, data:any)=> {
            if (err) throw err;
            dataObj = JSON.parse(data);
            ServerConf.port = dataObj.server.port;
            ServerConf.host = dataObj.server.host;
            ServerConf.wsPort = dataObj.server.wsPort;
            this.serverConf = ServerConf;
            console.log("server config:", ServerConf);
            this.initServer();
            if (callback)
                callback(dataObj);
        });
    }

    initServer() {
        var express = require('express');
        var app = express();
        // view engine setup
        app.set('views', _path("./app/view"));
        app.set('view engine', 'ejs');

        app.use(express.static(_path("./app/static")));//
        // app.use('/static', express.static(_path("./app/static")));//
        app.use(express.static(_path("./app/db")));//
        // var urlencodedParser = bodyParser.urlencoded({
        //     extended: false
        //     , limit: '55mb'
        // });
        // var morgan = require('morgan');
        // app.use(morgan('dev'));                     // log every request to the console
        var bodyParser = require('body-parser');
        app.use(bodyParser.urlencoded({extended: false, limit: '55mb'}));// create application/x-www-form-urlencoded parser
        app.use(bodyParser.json({limit: '50mb'}));

        app.all("*", function (req:any, res:any, next:any) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            if (req.method == 'OPTIONS') {
                res.send(200);
            } else {
                next();
            }
        });

        app.get('/', function (req:any, res:any) {
            res.redirect('/admin');
        });

        
        app.use('/admin', adminRouter);
        app.use('/panel', panelRouter);
        app.use('/db', dbRouter);
        app.use('/m', mobileRouter);

        app.listen(ServerConf.port, () => {
            this.initSocketIO();
            //and... we're live
            console.log("server on:  ws port:");
        });
    }


    initSocketIO() {
        this.socketIO = new SocketIOSrv();
    }
}
export var serverConf = ServerConf;
export var webServer = new WebServer();