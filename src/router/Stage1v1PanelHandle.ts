import {CommandId} from "../event/Command";
import {PanelId, ServerConst} from "../event/Const";
import {ServerConf} from "../Env";
import {panelRouter} from "./PanelRouter";
import {GameInfo} from "../model/GameInfo";
import {Response} from "express-serve-static-core";
import {Request} from "express";
import {ScParam, screenPanelHanle} from "../SocketIOSrv";
import {db} from "../model/DbInfo";
import {PlayerInfo, PlayerState1v1} from "../model/PlayerInfo";
import {Game1v1Info} from "../model/Game1v1Info";
import {mapToArr} from "../utils/JsFunc";
import Server = SocketIO.Server;
import Socket = SocketIO.Socket;
export class Stage1v1PanelHandle {
    io: any;
    gameInfo: Game1v1Info;
    exPlayerIdMap: any;

    constructor(io: Server) {
        console.log('StagePanelHandle!!');
        this.gameInfo = new Game1v1Info();
        this.exPlayerIdMap = {};
        this.io = io.of(`/${PanelId.stage1v1Panel}`);
        this.io
            .on("connect", (socket: Socket) => {
                socket.emit(`${CommandId.initPanel}`, ScParam({gameInfo: this.gameInfo, isDev: ServerConf.isDev}));
            })
            .on('disconnect', function (socket: Socket) {
                console.log('disconnect');
            });
        this.initOp();
    }

    initOp() {
        //post /panel/stage/:cmd
        panelRouter.post(`/stage1v1/:cmdId`, (req: Request, res: Response) => {
            if (!req.body) return res.sendStatus(400);
            var cmdId = req.params.cmdId;
            var param = req.body;
            console.log(`/stage1v1/${cmdId}`);
            var cmdMap: any = {};


            cmdMap[`${CommandId.cs_minLeftScore}`] = () => {
                this.gameInfo.minLeftScore();
                this.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
                // screenPanelHanle.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
            };

            cmdMap[`${CommandId.cs_minRightScore}`] = () => {
                this.gameInfo.minRightScore();
                this.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));
                // screenPanelHanle.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));
            };

            cmdMap[`${CommandId.cs_addLeftScore}`] = () => {
                var straight = this.gameInfo.addLeftScore();
                this.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
                screenPanelHanle.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
            };

            cmdMap[`${CommandId.cs_addRightScore}`] = () => {
                var straight = this.gameInfo.addRightScore();
                this.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));
                screenPanelHanle.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));
            };
            cmdMap[`${CommandId.cs_unLimitScore}`] = (param) => {
                this.gameInfo.unLimitScore = param.unLimitScore;
                this.io.emit(`${CommandId.unLimitScore}`, ScParam({unLimitScore: this.gameInfo.unLimitScore}));
            };

            cmdMap[`${CommandId.cs_resetGame}`] = (param) => {
                this.gameInfo = new Game1v1Info();
                this.io.emit(`${CommandId.resetGame}`);
            };


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
            //
            cmdMap[`${CommandId.cs_resetTimer}`] = () => {
                this.gameInfo.resetTimer();
                this.io.emit(`${CommandId.resetTimer}`);
            };
            var actPlayerIdArr = ()=> {
                for (var k in db.activity.dataMap) {
                    if (db.activity.dataMap[k].activityId == 3) {
                        return db.activity.dataMap[k].gameDataArr[0].playerIdArr;
                    }
                }
            };
            cmdMap[`${CommandId.cs_updatePlayer}`] = (param) => {
                if (this.gameInfo.gameState == GameInfo.GAME_STATE_ING) {
                    var playerId = param.playerId;
                    var playerIdx = param.idx;
                    if (!this.exPlayerIdMap[playerId]) {
                        if (actPlayerIdArr().indexOf(playerId) < 0) {
                            this.exPlayerIdMap[playerId] = playerId;
                            console.log('ex player');
                        }
                    }
                    db.player.syncDataMap(()=> {
                        param.playerDoc = db.player.dataMap[playerId];
                        this.gameInfo.setPlayerInfoByIdx(playerIdx, db.player.getPlayerInfoById(playerId));
                        db.game.updatePlayerByPos(this.gameInfo.id, playerIdx, playerId);
                        // param.avgEloScore = this.gameInfo.getAvgEloScore();
                        this.io.emit(`${CommandId.updatePlayer}`, ScParam(param))
                    });
                }
            };
            cmdMap[`${CommandId.cs_updatePlayerAll}`] = (param) => {
                this.gameInfo.playerDocArr = db.player.getDocArr(param.playerIdArr);
                this.io.emit(`${CommandId.updatePlayerAll}`, ScParam({playerDocArr: this.gameInfo.playerDocArr}));

            };
            cmdMap[`${CommandId.cs_updatePlayerState}`] = (param) => {
                db.player.updatePlayerDoc([param.playerDoc], ()=> {
                    var playerDoc = param.playerDoc;
                    if (playerDoc.state == PlayerState1v1.FIGHTING) {
                        // this.io.emit(`${CommandId.updatePlayer}`, ScParam(param))
                    }
                    console.log('cs_updatePlayerState', 'updatePlayerState', param);
                    this.io.emit(`${CommandId.updatePlayerState}`, ScParam(param))
                });
            };

            cmdMap[`${CommandId.cs_setGameIdx}`] = (param) => {
                this.gameInfo.gameIdx = param.gameIdx;
                this.io.emit(`${CommandId.setGameIdx}`, ScParam(param));
            };

            cmdMap[`${CommandId.cs_fadeInActivityPanel}`] = (param) => {
                var playerIdArr;
                for (var k in db.activity.dataMap) {
                    if (db.activity.dataMap[k].activityId == 3) {
                        playerIdArr = db.activity.dataMap[k].gameDataArr[0].playerIdArr;
                        break;
                    }
                }
                playerIdArr = playerIdArr.concat(mapToArr(this.exPlayerIdMap));
                var playerDocArr = db.player.getDocArr(playerIdArr);
                this.io.emit(`${CommandId.fadeInActivityPanel}`, ScParam({
                    playerDocArr: playerDocArr,
                    page: param.page
                }));
            };

            cmdMap[`${CommandId.cs_fadeOutActivityPanel}`] = (param) => {
                this.io.emit(`${CommandId.fadeOutActivityPanel}`);
            };

            cmdMap[`${CommandId.cs_updatePlayerBackNum}`] = (param) => {
                this.io.emit(`${CommandId.updatePlayerBackNum}`, ScParam(param));
            };

            cmdMap[`${CommandId.cs_startingLine}`] = (param) => {
                this.io.emit(`${CommandId.startingLine}`, ScParam({playerDocArr: this.gameInfo.getPlayerDocArr()}));
            };
            cmdMap[`${CommandId.cs_hideStartingLine}`] = (param) => {
                this.io.emit(`${CommandId.hideStartingLine}`);
            };

            cmdMap[`${CommandId.cs_fadeInWinPanel}`] = (param) => {
                var isBlueWin = this.gameInfo.leftScore > this.gameInfo.rightScore;
                var playerDoc;
                if (isBlueWin)
                    playerDoc = this.gameInfo.getPlayerDocArr()[0];
                else
                    playerDoc = this.gameInfo.getPlayerDocArr()[1];
                this.io.emit(`${CommandId.fadeInWinPanel}`, ScParam({isBlue: isBlueWin, playerDoc: playerDoc}));
            };

            cmdMap[`${CommandId.cs_fadeOutWinPanel}`] = (param) => {
                this.io.emit(`${CommandId.fadeOutWinPanel}`);
            };

            cmdMap[`${CommandId.cs_fadeInFinalPlayer}`] = (param) => {
                var playerDoc = db.player.dataMap[param.playerId];
                this.io.emit(`${CommandId.fadeInFinalPlayer}`, ScParam({playerDoc: playerDoc}));
            };

            cmdMap[`${CommandId.cs_saveGameRec}`] = (param) => {
                if (this.gameInfo.isFinish) {
                    res.send(false);
                }
                else {
                    this.gameInfo.saveGameResult();
                    db.player.updatePlayerDoc(this.gameInfo.getPlayerDocArr());
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
        this.gameInfo = new Game1v1Info(gameDoc);
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