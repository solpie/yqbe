import {PanelId} from "../event/Const";
import {ServerConf} from "../Env";
import {CommandId} from "../event/Command";
import {ScParam, stagePanelHandle} from "../SocketIOSrv";
import Socket = SocketIO.Socket;

class ScreenInfo {
    blueScore:number;
    redScore:number;
}
export class ScreenPanelHandle {
    io:any;
    screenInfo:ScreenInfo;

    constructor(io) {
        this.io = io.of(`/${PanelId.screenPanel}`);
        this.io
            .on("connect", (socket:Socket) => {
                var gameInfo = stagePanelHandle.gameInfo;
                socket.emit(`${CommandId.initPanel}`, ScParam({gameInfo: gameInfo, isDev: ServerConf.isDev}));
            })
    }


}