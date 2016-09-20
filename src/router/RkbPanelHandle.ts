import {PanelId} from "../event/Const";
import {GameRkbInfo} from "../model/GameRkbInfo";
import {CommandId} from "../event/Command";
import {ScParam} from "../SocketIOSrv";
import {panelRouter} from "./PanelRouter";
import {Request, Response} from "express";
import {PlayerRkbInfo} from "../model/PlayerRkbInfo";
import Server = SocketIO.Server;
import Socket = SocketIO.Socket;

export class RkbPanelHandle {
    gameInfo: GameRkbInfo;
    io;

    constructor(io: Server) {
        console.log('StagePanelHandle!!');
        this.gameInfo = new GameRkbInfo();
        this.io = io.of(`/${PanelId.rkbPanel}`);
        this.io
            .on("connect", (socket: Socket) => {

                socket.emit(`${CommandId.initPanel}`, ScParam({
                    gameInfo: this.gameInfo
                }));
            });
        this.initOp();
    }

    initOp() {
        panelRouter.post(`/rkb/:cmdId`, (req: Request, res: Response) => {
            if (!req.body) return res.sendStatus(400);
            var cmdId = req.params.cmdId;
            var param = req.body;
            console.log(`/rkb/${cmdId}`);
            var cmdMap: any = {};
            cmdMap[`${CommandId.cs_attack}`] = (param) => {
                return this.cs_attack(param);
            };
            var isSend = cmdMap[cmdId](param);
            if (!isSend)
                res.sendStatus(200);
        })
    }

    cs_attack(param) {
        var target = param.target;
        var ad;
        var p1: PlayerRkbInfo = this.gameInfo.playerRkbInfoArr[0];
        var p2: PlayerRkbInfo = this.gameInfo.playerRkbInfoArr[1];
        if (target == 1) {
            ad = p2.attack + 50 * Math.random();
            p1.hp -= ad;
            this.io.emit(`${CommandId.attack}`, ScParam({target: target, hp: p1.hp, ad: ad}))
        }
        else if (target == 2) {
            ad = p1.attack + 50 * Math.random();
            p2.hp -= ad;
            this.io.emit(`${CommandId.attack}`, ScParam({target: target, hp: p2.hp, ad: ad}))
        }
    }
}