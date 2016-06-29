import {CommandId} from "../event/Command";
import {PanelId, ViewEvent, ServerConst} from "../event/Const";
import {ServerConf} from "../Env";
import {panelRouter} from "./PanelRouter";
import {GameInfo} from "../model/GameInfo";
import {Response} from "express-serve-static-core";
import {Request} from "express";
import {ScParam, screenPanelHanle} from "../SocketIOSrv";
import {db} from "../model/DbInfo";
import {TeamInfo} from "../model/TeamInfo";
import {PlayerInfo} from "../model/PlayerInfo";
import Server = SocketIO.Server;
import Socket = SocketIO.Socket;
export class StagePanelHandle {
    io:any;
    gameInfo:GameInfo;

    constructor(io:Server) {
        console.log('StagePanelHandle!!');
        this.gameInfo = new GameInfo();

        this.io = io.of(`/${PanelId.stagePanel}`);
        this.io
            .on("connect", (socket:Socket) => {
                socket.emit(`${CommandId.initPanel}`, ScParam({gameInfo: this.gameInfo, isDev: ServerConf.isDev}));
            })
            .on('disconnect', function (socket:Socket) {
                console.log('disconnect');
            });
        this.initOp();
    }

    initOp() {
        //post /panel/stage/:cmd
        panelRouter.post(`/stage/:cmdId`, (req:Request, res:Response) => {
            if (!req.body) return res.sendStatus(400);
            var cmdId = req.params.cmdId;
            var param = req.body;
            console.log(`/stage/${cmdId}`);
            var cmdMap:any = {};


            cmdMap[`${CommandId.cs_minLeftScore}`] = () => {
                this.gameInfo.minLeftScore();
                this.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
                screenPanelHanle.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
            };

            cmdMap[`${CommandId.cs_minRightScore}`] = () => {
                this.gameInfo.minRightScore();
                this.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));
                screenPanelHanle.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));
            };

            cmdMap[`${CommandId.cs_addLeftScore}`] = () => {
                var straight = this.gameInfo.addLeftScore();
                if (straight == 3) {
                    console.log("straight score 3");
                    this.io.emit(`${CommandId.straightScore3}`, ScParam({team: ViewEvent.STRAIGHT3_LEFT}));
                }
                if (straight == 5) {

                }
                this.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
                screenPanelHanle.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
            };

            cmdMap[`${CommandId.cs_addRightScore}`] = () => {
                var straight = this.gameInfo.addRightScore();
                if (straight == 3) {
                    console.log("straight score 3 right");
                    this.io.emit(`${CommandId.straightScore3}`, ScParam({team: ViewEvent.STRAIGHT3_RIGHT}));
                }
                if (straight == 5) {

                }
                this.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));
                screenPanelHanle.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));
            };

            //// foul
            cmdMap[`${CommandId.cs_addRightFoul}`] = () => {
                var rightFoul:number = this.gameInfo.addRightFoul();
                screenPanelHanle.io.emit(`${CommandId.updateRightFoul}`, ScParam({rightFoul: rightFoul}));
            };
            cmdMap[`${CommandId.cs_minRightFoul}`] = () => {
                var rightFoul:number = this.gameInfo.minRightFoul();
                screenPanelHanle.io.emit(`${CommandId.updateRightFoul}`, ScParam({rightFoul: rightFoul}));
            };
            cmdMap[`${CommandId.cs_addLeftFoul}`] = () => {
                var leftFoul:number = this.gameInfo.addLeftFoul();
                screenPanelHanle.io.emit(`${CommandId.updateLeftFoul}`, ScParam({leftFoul: leftFoul}));
            };
            cmdMap[`${CommandId.cs_minLeftFoul}`] = () => {
                var leftFoul:number = this.gameInfo.minLeftFoul();
                screenPanelHanle.io.emit(`${CommandId.updateLeftFoul}`, ScParam({leftFoul: leftFoul}));
            };

            // cmdMap[`${CommandId.cs_fadeInComingActivity}`] = () => {
            //     screenPanelHanle.io.emit(`${CommandId.fadeInComingActivity}`);
            // };
            ////////////////////screen only /////////////////////
            cmdMap[`${CommandId.cs_toggleTimer}`] = (param) => {
                if (param) {
                    this.gameInfo.toggleTimer(param.state);
                    this.io.emit(`${CommandId.toggleTimer}`, ScParam(param));
                }
                else {
                    this.gameInfo.toggleTimer();
                    this.io.emit(`${CommandId.toggleTimer}`);
                }
            };

            cmdMap[`${CommandId.cs_resetTimer}`] = () => {
                this.gameInfo.resetTimer();
                this.io.emit(`${CommandId.resetTimer}`);
            };

            cmdMap[`${CommandId.cs_updatePlayer}`] = (param) => {
                if (this.gameInfo.gameState == GameInfo.GAME_STATE_ING) {
                    var playerId = param.playerId;
                    var playerIdx = param.idx;

                    param.playerDoc = db.player.dataMap[playerId];
                    this.gameInfo.setPlayerInfoByIdx(playerIdx, db.player.getPlayerInfoById(playerId));
                    db.game.updatePlayerByPos(this.gameInfo.id, playerIdx, playerId);
                    param.avgEloScore = this.gameInfo.getAvgEloScore();
                    this.io.emit(`${CommandId.updatePlayer}`, ScParam(param))
                }

            };

            cmdMap[`${CommandId.cs_updatePlayerAll}`] = (param) => {
                var playerInfoArr = [];
                for (var i = 0; i < param.playerIdArr.length; i++) {
                    var playerId = param.playerIdArr[i];
                    var playerInfo = db.player.getPlayerInfoById(playerId);
                    console.log('cs_updatePlayerAll', playerInfo.gameCount(), playerInfo);
                    this.gameInfo.setPlayerInfoByIdx(i, playerInfo);
                    playerInfoArr.push(playerInfo);
                    if (param.backNumArr[i]) {
                        playerInfo.backNumber = param.backNumArr[i];
                    }
                }
                this.io.emit(`${CommandId.updatePlayerAll}`, ScParam({
                    avgEloScore: this.gameInfo.getAvgEloScore(),
                    playerInfoArr: playerInfoArr
                }));
            };

            cmdMap[`${CommandId.cs_fadeInWinPanel}`] = (param) => {
                console.log('cs_fadeInWinPanel', param.mvpIdx, this.gameInfo);
                var winTeam:TeamInfo = this.gameInfo.setWinByMvpIdx(param.mvpIdx);

                this.io.emit(`${CommandId.fadeInWinPanel}`, ScParam({
                    teamInfo: winTeam,
                    mvpIdx: param.mvpIdx,
                    mvpId: this.gameInfo.mvpPlayerId
                }));
            };

            cmdMap[`${CommandId.cs_fadeOutWinPanel}`] = (param) => {
                this.io.emit(`${CommandId.fadeOutWinPanel}`);
            };

            cmdMap[`${CommandId.cs_updatePlayerBackNum}`] = (param) => {
                this.io.emit(`${CommandId.updatePlayerBackNum}`, param);
            };

            cmdMap[`${CommandId.cs_saveGameRec}`] = (param) => {
                if (this.gameInfo.isFinish) {
                    res.send(false);
                }
                else {
                    db.game.saveGameRecToPlayer(this.gameInfo, () => {
                    });
                    res.send(true);
                }
                return ServerConst.SEND_ASYNC;
            };
            var isSend = cmdMap[cmdId](param);
            if (!isSend)
                res.sendStatus(200);
        });
    }

    startGame(gameId) {
        var gameDoc = db.game.getDataById(gameId);
        if (!gameDoc) {
            gameDoc = db.activity.getGameDocByGameId(gameId)
        }
        this.gameInfo = new GameInfo(gameDoc);
        if (gameDoc.playerIdArr) {
            this.gameInfo.playerInfoArr = [];
            for (var playerId of gameDoc.playerIdArr) {
                console.log('playerId', playerId);
                this.gameInfo.playerInfoArr.push(new PlayerInfo(db.player.dataMap[playerId]));
            }
        }

        db.game.startGame(gameDoc);
        console.log('startGame:', gameId, gameDoc);
    }
}