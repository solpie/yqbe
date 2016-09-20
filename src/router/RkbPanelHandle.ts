import {PanelId} from "../event/Const";
import {GameRkbInfo} from "../model/GameRkbInfo";
import Server = SocketIO.Server;
export class RkbPanelHandle {
    gameInfo: GameRkbInfo;
    io;

    constructor(io: Server) {
        console.log('StagePanelHandle!!');
        this.gameInfo = new GameRkbInfo();
        this.io = io.of(`/${PanelId.rkbPanel}`);
    }
}