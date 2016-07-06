import {stagePanelHandle, ScParam} from "../SocketIOSrv";
import {CommandId} from "../event/Command";
export var dmkRouter = require('express').Router();

dmkRouter.post('/push', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    console.log('dmk/push', req.body);
    stagePanelHandle.io.emit(`${CommandId.dmkPush}`, ScParam(req.body));
    res.sendStatus(200);
});
