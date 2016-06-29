import {StagePanelHandle} from "./router/StagePanelHandle";
import {ServerConf} from "./Env";
import {ActivityPanelHandle} from "./router/ActivityPanelHandle";
import {ScreenPanelHandle} from "./router/ScreenPanelHandle";
export var stagePanelHandle;
export var activityPanelHandle;
export var screenPanelHanle;
export class SocketIOSrv {
    constructor() {
        var io = require('socket.io')(ServerConf.wsPort);
        stagePanelHandle = new StagePanelHandle(io);
        activityPanelHandle = new ActivityPanelHandle(io);
        screenPanelHanle = new ScreenPanelHandle(io);
        // var news = io
        //     .of('/news')
        //     .on('connection', function (socket) {
        //         socket.emit('item', {news: 'item'});
        //     });
    }
}

//for refactor
export function ScParam(param) {
    return param
}

