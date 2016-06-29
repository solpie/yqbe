import Server = SocketIO.Server;
import Socket = SocketIO.Socket;
import {PanelId, ServerConst} from "../event/Const";
import {ScParam, stagePanelHandle, screenPanelHanle} from "../SocketIOSrv";
import {Response} from "express-serve-static-core";
import {Request} from "express";
import {CommandId} from "../event/Command";
import {ServerConf} from "../Env";
import {panelRouter} from "./PanelRouter";
import {db} from "../model/DbInfo";
import {arrUniqueFilter, combineArr, arrCountSame} from "../utils/JsFunc";
import {GameDoc} from "../model/GameInfo";
import {text2ImgUtil} from "../utils/Text2ImgUtil";
export class ActivityPanelHandle {
    io:any;

    constructor(io:Server) {
        console.log('ActivityPanelHandle!!');

        this.io = io.of(`/${ PanelId.actPanel}`);
        this.io
            .on("connect", (socket:Socket)=> {
                socket.emit(`${CommandId.initPanel}`, ScParam({isDev: ServerConf.isDev}));
            })
            .on('disconnect', function (socket:Socket) {
                console.log('disconnect');
            });
        this.initOp();
    }

    initOp() {
        panelRouter.post(`/act/:cmdId`, (req:Request, res:Response) => {
            if (!req.body) return res.sendStatus(400);
            var cmdId = req.params.cmdId;
            var param = req.body;
            console.log(`/act/${cmdId}`);
            var cmdMap:any = {};

            cmdMap[`${CommandId.cs_startGame}`] = (param)=> {
                if (db.game.isGameFinish(param.gameId)) {
                    res.send({isFinish: true})
                }
                else {
                    stagePanelHandle.startGame(param.gameId);
                    res.send({isFinish: false});
                }
                return ServerConst.SEND_ASYNC;
            };

            cmdMap[`${CommandId.cs_restartGame}`] = (param)=> {
                db.game.restartGame(param.gameId);
            };

            cmdMap[`${CommandId.cs_fadeInRankPanel}`] = (param)=> {
                var activityId = param.activityId;
                var playerIdArr = param.playerIdArr;
                this.io.emit(`${CommandId.fadeInRankPanel}`,
                    ScParam({playerDocArr: db.player.getPlayerRank(playerIdArr)}));
                // return ServerConst.SEND_ASYNC;
                // db.game.restartGame(param.gameId);
            };

            cmdMap[`${CommandId.cs_fadeOutRankPanel}`] = (param)=> {
                this.io.emit(`${CommandId.fadeOutRankPanel}`);
            };

            cmdMap[`${CommandId.cs_fadeInCountDown}`] = (param)=> {
                this.io.emit(`${CommandId.fadeInCountDown}`, param);
            };

            cmdMap[`${CommandId.cs_fadeOutCountDown}`] = (param)=> {
                this.io.emit(`${CommandId.fadeOutCountDown}`);
            };

            cmdMap[`${CommandId.cs_fadeInActivityPanel}`] = (param)=> {
                db.game.syncDataMap(()=> {
                    var gameIdArr = param.gameIdArr;
                    var gameDocArr = db.game.getDocArr(gameIdArr);
                    console.log('cs_fadeInActivityPanel', gameDocArr);
                    for (var gameDoc of gameDocArr) {
                        gameDoc.playerDocArr = [];
                        for (var playerId of gameDoc.playerIdArr) {
                            gameDoc.playerDocArr.push(db.player.dataMap[playerId]);
                        }
                    }
                    this.io.emit(`${CommandId.fadeInActivityPanel}`,
                        ScParam({gameDocArr: gameDocArr}));
                })
            };

            cmdMap[`${CommandId.cs_fadeOutActivityPanel}`] = (param)=> {
                this.io.emit(`${CommandId.fadeOutActivityPanel}`);
            };
            cmdMap[`${CommandId.cs_fadeInActivityExGame}`] = (param)=> {
                var gameIdArr = param.gameIdArr;
                var activityId = param.activityId;
                var roundId = param.roundId;

                var gameDocArr = db.game.getDocArr(gameIdArr);
                var playerIdArr:any = [];
                for (var gameDoc of gameDocArr) {
                    playerIdArr = playerIdArr.concat(gameDoc.playerIdArr);
                }
                playerIdArr = playerIdArr.sort().filter(arrUniqueFilter);
                console.log('ex game playerDoc Arr:', playerIdArr);
                //排序
                playerIdArr = db.player.getPlayerIdArrRank(playerIdArr);

                //组合球员
                var t1 = gameDocArr[0].playerIdArr.slice(0, 4);
                var t2 = gameDocArr[0].playerIdArr.slice(4, 8);
                var t3 = gameDocArr[1].playerIdArr.slice(0, 4);
                var t4 = gameDocArr[1].playerIdArr.slice(4, 8);
                var lastTeamArr = [t1, t2, t3, t4];
                //

                function minAbsScoreTeam(combineTeamArr, sameLimit = 3):any {
                    console.log('combine team', combineTeamArr.length, lastTeamArr);
                    var matchTeam = {t1: null, t2: null};
                    var minAbsScore = -1;
                    for (var i = 0; i < combineTeamArr.length; i++) {
                        var teamPlayerIdArr = combineTeamArr[i];
                        var teamPlayerIdArrOps = combineTeamArr[combineTeamArr.length - 1 - i];
                        // for (var lastTeamPlayerIdArr of lastTeamArr) {
                        // playerDocArr = playerDocArr.concat();
                        var countSame = arrCountSame(lastTeamArr[0], teamPlayerIdArr);
                        var countSameOps = arrCountSame(lastTeamArr[1], teamPlayerIdArrOps);
                        var countSame2 = arrCountSame(lastTeamArr[2], teamPlayerIdArr);
                        var countSameOps3 = arrCountSame(lastTeamArr[3], teamPlayerIdArrOps);
                        if ((countSame < sameLimit && countSameOps < sameLimit)
                            || (countSame2 < sameLimit && countSameOps3 < sameLimit)) {
                            // mixTeam.push(teamPlayerIdArr);
                            var t1Score = db.player.getPlayerArrEloScore(teamPlayerIdArr);
                            var t2Score = db.player.getPlayerArrEloScore(teamPlayerIdArrOps);
                            var absScore = Math.abs(t1Score - t2Score);
                            if (minAbsScore == -1)
                                minAbsScore = absScore;
                            if (absScore <= minAbsScore) {
                                minAbsScore = absScore;
                                matchTeam.t1 = teamPlayerIdArr;
                                matchTeam.t2 = teamPlayerIdArrOps;
                                console.log("fit ", matchTeam, t1Score, t2Score);
                            }
                        }
                    }
                    if (!matchTeam.t1) {//找不到至少两个拆队的情况
                        for (var i = 0; i < combineTeamArr.length; i++) {
                            var teamPlayerIdArr = combineTeamArr[i];
                            var teamPlayerIdArrOps = combineTeamArr[combineTeamArr.length - 1 - i];
                            var t1Score = db.player.getPlayerArrEloScore(teamPlayerIdArr);
                            var t2Score = db.player.getPlayerArrEloScore(teamPlayerIdArrOps);
                            var absScore = Math.abs(t1Score - t2Score);
                            if (minAbsScore == -1)
                                minAbsScore = absScore;
                            if (absScore <= minAbsScore) {
                                minAbsScore = absScore;
                                matchTeam.t1 = teamPlayerIdArr;
                                matchTeam.t2 = teamPlayerIdArrOps;
                                console.log("min fit ", matchTeam, t1Score, t2Score);
                            }
                        }
                    }
                    // else
                    return matchTeam;
                }

                var exGameDocArr:GameDoc[] = [];
                var cHigh8 = combineArr(playerIdArr.slice(0, 8), 4);
                var matchTeamHigh = minAbsScoreTeam(cHigh8);
                var exPlayerIdArr:any[] = matchTeamHigh.t1.concat(matchTeamHigh.t2);
                var playerDocArr = db.player.getDocArr(exPlayerIdArr);
                var gameDoc:any = new GameDoc();
                gameDoc.id = roundId * 1000 + gameDocArr.length + 1;//todo
                gameDoc.playerDocArr = playerDocArr;
                gameDoc.playerIdArr = exPlayerIdArr;
                db.game.startGame(gameDoc);
                exGameDocArr.push(gameDoc);
                db.activity.addGame(activityId, roundId, exPlayerIdArr, 1, ()=> {
                    var cLow8 = combineArr(playerIdArr.slice(8, 16), 4);
                    var matchTeamLow = minAbsScoreTeam(cLow8);

                    exPlayerIdArr = matchTeamLow.t1.concat(matchTeamLow.t2);
                    playerDocArr = db.player.getDocArr(exPlayerIdArr);
                    gameDoc = new GameDoc();
                    gameDoc.id = roundId * 1000 + gameDocArr.length + 2;//todo
                    gameDoc.playerDocArr = playerDocArr;
                    gameDoc.playerIdArr = exPlayerIdArr;
                    db.game.startGame(gameDoc);
                    exGameDocArr.push(gameDoc);
                    db.activity.addGame(activityId, roundId, exPlayerIdArr, 1, null);
                    this.io.emit(`${CommandId.fadeInActivityExGame}`,
                        ScParam({gameDocArr: exGameDocArr}));
                });
            };
            cmdMap[`${CommandId.cs_fadeInNextRank}`] = (param)=> {
                this.io.emit(`${CommandId.fadeInNextRank}`);
            };

            cmdMap[`${CommandId.cs_fadeInNextActivity}`] = (param)=> {
                this.io.emit(`${CommandId.fadeInNextActivity}`);
            };
            cmdMap[`${CommandId.cs_setGameComing}`] = (param)=> {
                this.io.emit(`${CommandId.setGameComing}`, ScParam(param));

                var gameDoc = db.game.dataMap[param.gameId];
                gameDoc.playerDocArr = [];
                for (var playerId of gameDoc.playerIdArr) {
                    gameDoc.playerDocArr.push(db.player.dataMap[playerId]);
                }
                param.gameDoc = gameDoc;
                screenPanelHanle.io.emit(`${CommandId.setGameComing}`, ScParam(param));
            };

            cmdMap[`${CommandId.cs_fadeInNotice}`] = (param)=> {
                var noticeText = param.notice;
                var img = text2ImgUtil.getNoticeImg(noticeText);
                this.io.emit(`${CommandId.fadeInNotice}`, ScParam({img: img}));
            };

            var isSend = cmdMap[cmdId](param);
            if (!isSend)
                res.sendStatus(200);
        })
    }
}