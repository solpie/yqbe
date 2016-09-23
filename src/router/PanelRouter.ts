import {ServerConf} from "../Env";
export var panelRouter = require('express').Router();

panelRouter.get('/', function (req, res) {
    console.log('get panel:');
    res.render('panel/index', {host: ServerConf.host, wsPort: ServerConf.wsPort, hupuWsUrl: ServerConf.hupuWsUrl});
});

panelRouter.get('/screen', function (req, res) {
    console.log('get screen:');
    res.render('screen/index', {host: ServerConf.host, wsPort: ServerConf.wsPort, hupuWsUrl: ServerConf.hupuWsUrl});
});

