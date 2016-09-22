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
import {Game1v1Info, bracketMap} from "../model/Game1v1Info";
import {mapToArr, ascendingProp} from "../utils/JsFunc";
import {MatchSvg} from "../model/BracketInfo";
import Server = SocketIO.Server;
import Socket = SocketIO.Socket;
export class Stage1v1PanelHandle {
    io: any;
    gameInfo: Game1v1Info;
    exPlayerIdMap: any;
    lastLoserPlayerInfo: PlayerInfo = new PlayerInfo();
    lastGameIdx: number = 0;
    //[playerId] = idx
    playerIdx: any = {};
    // playerCount: number;
    nextPlayerIdArr = [-1, -1];
    playerQue: Array<any> = [];

    constructor(io: Server) {
        console.log('StagePanelHandle!!');
        this.gameInfo = new Game1v1Info();
        this.exPlayerIdMap = {};
        this.io = io.of(`/${PanelId.stage1v1Panel}`);
        this.io
            .on("connect", (socket: Socket) => {
                var actDoc = db.activity.getDocArr([3])[0];
                var matchArr = this.refreshBracket(actDoc);

                socket.emit(`${CommandId.initPanel}`, ScParam({
                    gameInfo: this.gameInfo,
                    isDev: ServerConf.isDev,
                    lastLoserPlayerInfo: this.lastLoserPlayerInfo,
                    matchArr: matchArr,
                    kingPlayer: ServerConf.king
                }));
            })
            .on('disconnect', function (socket: Socket) {
                console.log('disconnect');
            });
        this.initOp();
    }

    isInit;

    init1v1() {
        if (this.isInit)
            return 0;
        this.isInit = true;
        var playerIdArr = this.getActDoc().gameDataArr[0].playerIdArr;
        this.playerQue = playerIdArr.concat();

        for (var i = 0; i < playerIdArr.length; i++) {
            var playerId = playerIdArr[i];
            this.playerIdx[playerId] = i + 1;
        }
        // this.playerCount = playerIdArr.length;
        console.log('init1v1 playerIdx', this.playerIdx);
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


            //// foul
            cmdMap[`${CommandId.cs_addRightFoul}`] = () => {
                var rightFoul: number = this.gameInfo.addRightFoul();
                this.io.emit(`${CommandId.updateRightFoul}`, ScParam({rightFoul: rightFoul}));
            };
            cmdMap[`${CommandId.cs_minRightFoul}`] = () => {
                var rightFoul: number = this.gameInfo.minRightFoul();
                this.io.emit(`${CommandId.updateRightFoul}`, ScParam({rightFoul: rightFoul}));
            };
            cmdMap[`${CommandId.cs_addLeftFoul}`] = () => {
                var leftFoul: number = this.gameInfo.addLeftFoul();
                this.io.emit(`${CommandId.updateLeftFoul}`, ScParam({leftFoul: leftFoul}));
            };
            cmdMap[`${CommandId.cs_minLeftFoul}`] = () => {
                var leftFoul: number = this.gameInfo.minLeftFoul();
                this.io.emit(`${CommandId.updateLeftFoul}`, ScParam({leftFoul: leftFoul}));
            };


            cmdMap[`${CommandId.cs_resetGame}`] = (param) => {
                this.gameInfo = new Game1v1Info();
                this.gameInfo.gameIdx = this.lastGameIdx + 1;
                this.io.emit(`${CommandId.resetGame}`);
                this.init1v1();
                if (this.nextPlayerIdArr[0] < 0) {
                    this.nextPlayerIdArr[0] = this.playerQue[0];
                    this.nextPlayerIdArr[1] = this.playerQue[1];
                }
                cmdMap[`${CommandId.cs_updatePlayer}`]({playerId: this.nextPlayerIdArr[0], idx: 0});
                cmdMap[`${CommandId.cs_updatePlayer}`]({playerId: this.nextPlayerIdArr[1], idx: 1});
                console.log('player', this.nextPlayerIdArr);
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
                return this.cs_updatePlayer(param);
            };

            cmdMap[`${CommandId.cs_updatePlayerAll}`] = (param) => {
                this.gameInfo.playerDocArr = db.player.getDocArr(param.playerIdArr);
                this.io.emit(`${CommandId.updatePlayerAll}`, ScParam({playerDocArr: this.gameInfo.playerDocArr}));
            };

            cmdMap[`${CommandId.cs_updateKingPlayer}`] = (param) => {
                this.gameInfo.kingPlayer = param.kingPlayer;
                this.io.emit(`${CommandId.updateKingPlayer}`, ScParam({kingPlayer: this.gameInfo.kingPlayer}));
            };

            cmdMap[`${CommandId.cs_updatePlayerState}`] = (param) => {
                db.player.updatePlayerDoc([param.playerDoc], ()=> {
                    var playerDoc = param.playerDoc;
                    // if (playerDoc.state == PlayerState1v1.FIGHTING) {
                    //     // this.io.emit(`${CommandId.updatePlayer}`, ScParam(param))
                    // }
                    console.log('cs_updatePlayerState', 'updatePlayerState', param);
                    this.io.emit(`${CommandId.updatePlayerState}`, ScParam(param))
                });
            };


            cmdMap[`${CommandId.cs_setActPlayer}`] = (param) => {
                var playerIdArr = param.playerIdArr;
                if (playerIdArr && playerIdArr.length) {

                    var countPlayerId = [];
                    var updatePlayerDocArr = [];
                    for (var i = 0; i < playerIdArr.length; i++) {
                        var playerDoc = db.player.dataMap[i + 1];
                        var playerDoc2 = db.player.dataMap[playerIdArr[i]];
                        if (playerDoc && (playerDoc2.name != playerDoc.name)) {
                            var empty = 100;
                            while (db.player.dataMap[empty]) {
                                empty++;
                            }
                            playerDoc.id = empty;
                            updatePlayerDocArr.push(playerDoc);
                        }
                    }
                    for (var i = 0; i < playerIdArr.length; i++) {
                        var playerDoc2 = db.player.dataMap[playerIdArr[i]];
                        playerDoc2.id = i + 1;
                        updatePlayerDocArr.push(playerDoc2);
                        countPlayerId.push(playerDoc2.id);
                    }
                    db.player.updateDocArr(updatePlayerDocArr, ()=> {
                        db.player.syncDataMap();
                    });

                    var actDoc = this.getActDoc();
                    actDoc.gameDataArr[0].playerIdArr = countPlayerId;
                    db.activity.updateDocArr([actDoc]);
                }
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
            cmdMap[`${CommandId.cs_fadeInCountDown}`] = (param)=> {
                this.io.emit(`${CommandId.fadeInCountDown}`, param);
            };

            cmdMap[`${CommandId.cs_fadeOutCountDown}`] = (param)=> {
                this.io.emit(`${CommandId.fadeOutCountDown}`);
            };

            cmdMap[`${CommandId.cs_fadeInWinPanel}`] = (param) => {
                var isBlueWin = this.gameInfo.leftScore > this.gameInfo.rightScore;
                var playerDoc;
                if (isBlueWin)
                    playerDoc = this.gameInfo.getPlayerDocArr()[0];
                else
                    playerDoc = this.gameInfo.getPlayerDocArr()[1];

                if (playerDoc.id == ServerConf.king) {
                    playerDoc.isKing = true;
                }
                this.io.emit(`${CommandId.fadeInWinPanel}`, ScParam({
                    isBlue: isBlueWin,
                    playerDoc: playerDoc
                }));
            };

            cmdMap[`${CommandId.cs_fadeOutWinPanel}`] = (param) => {
                this.io.emit(`${CommandId.fadeOutWinPanel}`);
            };


            cmdMap[`${CommandId.cs_fadeInFinalPlayer}`] = (param) => {
                var playerDoc = db.player.dataMap[param.playerId];
                this.io.emit(`${CommandId.fadeInFinalPlayer}`, ScParam({playerDoc: playerDoc}));
            };

            cmdMap[`${CommandId.cs_getBracketPlayerByIdx}`] = (param) => {
                var actDoc = this.getActDoc();
                var bracketIdx = param.bracketIdx;
                var bracketDoc = actDoc.bracket[bracketIdx];
                console.log('bracketDoc', bracketDoc);
                if (bracketDoc) {
                    cmdMap[`${CommandId.cs_updatePlayer}`]({
                        idx: 0,
                        playerId: bracketDoc.gameInfoArr[0].id
                    });
                    cmdMap[`${CommandId.cs_updatePlayer}`]({
                        idx: 1,
                        playerId: bracketDoc.gameInfoArr[1].id
                    });
                }
            };

            cmdMap[`${CommandId.cs_clearActPlayerGameRec}`] = (param) => {
                var playerDocArr = [];
                for (var id in db.player.dataMap) {
                    var playerDoc = db.player.dataMap[id];
                    if (playerDoc) {
                        playerDocArr.push(playerDoc);
                        playerDoc.loseGameCount = 0;
                        playerDoc.winGameCount = 0;
                        playerDoc.state = null;
                    }
                }
                db.player.updatePlayerDoc(playerDocArr);
            };

            cmdMap[`${CommandId.cs_setBracketPlayer}`] = (param) => {
                var playerIdArr = param.playerIdArr;
                var actDoc = db.activity.getDocArr([3])[0];
                var playerDocArr = db.player.getDocArr(playerIdArr);
                console.log('bracket playerDocArr', playerDocArr);
                if (playerDocArr.length == 8) {
                    for (var i = 0; i < 4; i++) {
                        // playerDocArr[i * 2].seed = i * 2 + 1;
                        // playerDocArr[i * 2 + 1].seed = i * 2 + 2;

                        playerDocArr[i * 2].score = 0;
                        playerDocArr[i * 2 + 1].score = 0;
                        actDoc.bracket[i + 1] = {
                            gameInfoArr: [
                                playerDocArr[i * 2], playerDocArr[i * 2 + 1]
                            ]
                        }
                    }
                    for (var i = 4; i < 14; i++) {
                        if (actDoc.bracket[i + 1]) {
                            delete actDoc.bracket[i + 1];
                        }
                    }

                    db.activity.ds().update({id: actDoc.id}, actDoc, ()=> {
                    });

                    // var actDoc = db.activity.getDocArr([3])[0];
                    var matchArr = this.refreshBracket(actDoc);
                    this.io.emit(`${CommandId.refreshClient}`, ScParam({matchArr: matchArr}));
                }
            };
            cmdMap[`${CommandId.cs_refreshClient}`] = (param) => {
                var actDoc = db.activity.getDocArr([3])[0];
                var matchArr = this.refreshBracket(actDoc);
                this.io.emit(`${CommandId.refreshClient}`, ScParam({matchArr: matchArr}));
            };

            cmdMap[`${CommandId.cs_changeColor}`] = (param)=> {
                return this.cs_changeColor(param);
            };
            cmdMap[`${CommandId.cs_updateWinScore}`] = (param)=> {
                return this.cs_updateWinScore(param);
            };
            cmdMap[`${CommandId.cs_saveGameRec}`] = (param)=> {
                return this.cs_saveGameRec(param, res);
            };
            ///
            cmdMap[`${CommandId.cs_fadeInFTShow}`] = (param)=> {
                return this.cs_fadeInFTShow(param);
            };
            var isSend = cmdMap[cmdId](param);
            if (!isSend)
                res.sendStatus(200);
        });
    }

    cs_updatePlayer(param) {
        if (this.gameInfo.gameState == GameInfo.GAME_STATE_ING) {
            var playerId = param.playerId;
            // if (playerId == ServerConf.king) {
            //     param.isKing = true;
            // }
            var playerIdx = param.idx;
            // if (!this.exPlayerIdMap[playerId]) {
            //     if (actPlayerIdArr().indexOf(playerId) < 0) {
            //         this.exPlayerIdMap[playerId] = playerId;
            //         console.log('ex player', playerId);
            //     }
            // }
            db.player.syncDataMap(()=> {
                param.playerDoc = db.player.dataMap[playerId];
                this.gameInfo.setPlayerInfoByIdx(playerIdx, db.player.getPlayerInfoById(playerId));
                db.game.updatePlayerByPos(this.gameInfo.id, playerIdx, playerId);
                // param.avgEloScore = this.gameInfo.getAvgEloScore();
                this.io.emit(`${CommandId.updatePlayer}`, ScParam(param))
            });
        }
    }

    cs_changeColor(param) {
        var p1 = {idx: 0, playerId: this.gameInfo.getPlayerDocArr()[1].id};
        var p2 = {idx: 1, playerId: this.gameInfo.getPlayerDocArr()[0].id};

        this.cs_updatePlayer(p1);
        this.cs_updatePlayer(p2);

        var tmp;
        tmp = this.playerQue[0];
        this.playerQue[0] = this.playerQue[1];
        this.playerQue[1] = tmp;

        tmp = this.gameInfo.leftFoul;
        this.gameInfo.leftFoul = this.gameInfo.rightFoul;
        this.gameInfo.rightFoul = tmp;
        this.io.emit(`${CommandId.updateRightFoul}`, ScParam({rightFoul: this.gameInfo.rightFoul}));
        this.io.emit(`${CommandId.updateLeftFoul}`, ScParam({leftFoul: this.gameInfo.leftFoul}));

        tmp = this.gameInfo.leftScore;
        this.gameInfo.leftScore = this.gameInfo.rightScore;
        this.gameInfo.rightScore = tmp;

        this.io.emit(`${CommandId.updateLeftScore}`, ScParam({leftScore: this.gameInfo.leftScore}));
        this.io.emit(`${CommandId.updateRightScore}`, ScParam({rightScore: this.gameInfo.rightScore}));

    }

    cs_saveGameRec(param, res) {
        ////////////////    bracket
        var bracketIdx = param.bracketIdx;
        if (bracketIdx) {
            var actDoc = db.activity.getDocArr([3])[0];
            var getLoserInfo = (isLoser: boolean = true)=> {
                var winner;
                var loser;
                var bluePlayer = {
                    id: this.gameInfo.playerInfoArr[0].id(),
                    name: this.gameInfo.playerInfoArr[0].name(),
                    avatar: this.gameInfo.playerInfoArr[0].avatar(),
                    score: this.gameInfo.leftScore
                };
                var redPlayer = {
                    id: this.gameInfo.playerInfoArr[1].id(),
                    name: this.gameInfo.playerInfoArr[1].name(),
                    avatar: this.gameInfo.playerInfoArr[1].avatar(),
                    score: this.gameInfo.rightScore
                };
                if (this.gameInfo.leftScore < this.gameInfo.rightScore) {
                    winner = redPlayer;
                    loser = bluePlayer;
                }
                else {
                    winner = bluePlayer;
                    loser = redPlayer;
                }
                return isLoser ? loser : winner;
            };

            var getWinnerInfo = ()=> {
                return getLoserInfo(false);
            };

            actDoc.bracket[bracketIdx] = {
                gameInfoArr: [
                    {
                        id: this.gameInfo.playerInfoArr[0].id(),
                        name: this.gameInfo.playerInfoArr[0].name(),
                        avatar: this.gameInfo.playerInfoArr[0].avatar(),
                        score: this.gameInfo.leftScore
                    },
                    {
                        id: this.gameInfo.playerInfoArr[1].id(),
                        name: this.gameInfo.playerInfoArr[1].name(),
                        avatar: this.gameInfo.playerInfoArr[1].avatar(),
                        score: this.gameInfo.rightScore
                    }
                ]
            };

            db.activity.ds().update({id: actDoc.id}, actDoc, ()=> {
            });

            var setBracketPlayer = (idx)=> {
                var map = bracketMap[idx];
                if (map) {
                    var bracketIdx = map.loser[0];
                    var playerPos = map.loser[1];
                    if (bracketIdx > 0) {
                        if (!actDoc.bracket[bracketIdx])
                            actDoc.bracket[bracketIdx] = {gameInfoArr: [{}, {}]};
                        actDoc.bracket[bracketIdx].gameInfoArr[playerPos] = getLoserInfo();
                        actDoc.bracket[bracketIdx].gameInfoArr[playerPos].score = 0;
                    }
                    bracketIdx = map.winner[0];
                    playerPos = map.winner[1];

                    if (bracketIdx > 0) {
                        if (!actDoc.bracket[bracketIdx])
                            actDoc.bracket[bracketIdx] = {gameInfoArr: [{}, {}]};
                        actDoc.bracket[bracketIdx].gameInfoArr[playerPos] = getWinnerInfo();
                        actDoc.bracket[bracketIdx].gameInfoArr[playerPos].score = 0;
                    }
                }
            };

            setBracketPlayer(bracketIdx);

            var matchArr = this.refreshBracket(actDoc);
            this.io.emit(`${CommandId.refreshClient}`, ScParam({matchArr: matchArr}));
        }


        ////////////////////////////////

        if (this.gameInfo.isFinish) {
            res.send(false);
        }
        else {
            this.lastGameIdx = Number(this.gameInfo.gameIdx);
            this.gameInfo.saveGameResult();
            this.quePlayer(this.gameInfo.winner_Idx[0], false);
            if (this.lastLoserPlayerInfo && this.lastLoserPlayerInfo.id() == this.gameInfo.loserPlayerInfo.id()) {
                console.log('player out: ', this.gameInfo.loserPlayerInfo.id(), this.gameInfo.loserPlayerInfo.name())
                // var playerDoc = db.player.dataMap[this.gameInfo.loserPlayerInfo.id()];
                // playerDoc.state = PlayerState1v1.Dead;
                this.gameInfo.loserPlayerInfo.playerData.state = PlayerState1v1.Dead;
                this.quePlayer(this.gameInfo.loser_Idx[0], true);
                // cmdMap[`${CommandId.cs_updatePlayerState}`]({playerDoc: playerDoc})
                this.nextPlayerIdArr[0] = this.playerQue[0];
                this.nextPlayerIdArr[1] = this.playerQue[1];
            }
            else {
                if (this.playerQue[0] != this.gameInfo.loser_Idx[0]) {
                    this.nextPlayerIdArr[this.gameInfo.winner_Idx[1]] = this.playerQue[0];
                }
                else
                    this.nextPlayerIdArr[this.gameInfo.winner_Idx[1]] = this.playerQue[1];
                this.nextPlayerIdArr[this.gameInfo.loser_Idx[1]] = this.gameInfo.loser_Idx[0];

                // this.nextPlayerIdArr[0] = this.playerQue[0];
                // this.nextPlayerIdArr[1] = this.playerQue[1];
                // this.quePlayer(this.gameInfo.loser_Idx[0], false);
                // this.quePlayer(this.gameInfo.loserId, false);
            }
            console.log('nextPlayerIdArr', this.nextPlayerIdArr);

            this.lastLoserPlayerInfo = this.gameInfo.loserPlayerInfo;
            // var playerDocArr = this.gameInfo.getPlayerDocArr();
            // this.quePlayer(playerDocArr[0], false);
            db.player.updatePlayerDoc(this.gameInfo.getPlayerDocArr(), null);
            res.send(true);
        }
        return ServerConst.SEND_ASYNC;
    }

    cs_updateWinScore(param) {
        console.log('cs_updateWinScore', param);
        this.gameInfo.winScore = param.winScore;
        this.io.emit(`${CommandId.updateWinScore}`, ScParam(param));
    }

    cs_fadeInFTShow(param: any) {
        var ftInfo
        this.io.emit(`${CommandId.fadeInFTShow}`);
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

    refreshBracket(actDoc: any) {
        //refresh bracket
        var matchArr = [];
        var playerHintMap = {
            '5': ['  第1场败者', '  第2场败者'],
            '6': ['  第3场败者', '  第4场败者'],
            '9': ['  第7场败者', ''],
            '13': ['  第11场败者', ''],
            '10': ['  第8场败者', ''],
            '14': ['', '  第13场胜者']
        };
        for (var i = 0; i < 15; i++) {
            var ms: MatchSvg = new MatchSvg(0, 0, i + 1);
            var bracketDoc = actDoc.bracket[ms.idx];

            if (bracketDoc) {
                if (bracketDoc.gameInfoArr[0]) {
                    ms.playerSvgArr[0].name = bracketDoc.gameInfoArr[0].name;
                    ms.playerSvgArr[0].avatar = bracketDoc.gameInfoArr[0].avatar;
                    ms.playerSvgArr[0].score = bracketDoc.gameInfoArr[0].score;
                }
                if (bracketDoc.gameInfoArr[1]) {
                    ms.playerSvgArr[1].name = bracketDoc.gameInfoArr[1].name;
                    ms.playerSvgArr[1].avatar = bracketDoc.gameInfoArr[1].avatar;
                    ms.playerSvgArr[1].score = bracketDoc.gameInfoArr[1].score;
                }

                if (ms.playerSvgArr[0].score || ms.playerSvgArr[1].score) {
                    if (ms.playerSvgArr[0].score > ms.playerSvgArr[1].score) {
                        ms.playerSvgArr[0].isWin = true;
                    }
                    else {
                        ms.playerSvgArr[1].isWin = true;
                    }
                }
            }

            if (!ms.playerSvgArr[0].name && playerHintMap[ms.idx]) {
                ms.playerSvgArr[0].name = playerHintMap[ms.idx][0];
                ms.playerSvgArr[0].isHint = true;
            }
            if (!ms.playerSvgArr[1].name && playerHintMap[ms.idx]) {
                ms.playerSvgArr[1].name = playerHintMap[ms.idx][1];
                ms.playerSvgArr[1].isHint = true;
            }
            matchArr.push(ms);
        }

        matchArr.sort(ascendingProp('idx'));
        return matchArr;

    }

    getActDoc(): any {
        return db.activity.getDocArr([3])[0];
    }

    private quePlayer(playerId: any, isout: boolean) {
        console.log('quePlayer playerId:', playerId, isout);
        if (this.playerQue[0] == playerId) {
            var p0 = this.playerQue.shift();
            if (!isout)
                this.playerQue.push(p0);
            else
                console.log('quePlayer out:', p0, this.playerQue);
        }
        else if (this.playerQue[1] == playerId) {
            var p0 = this.playerQue.shift();
            // this.playerQue.push(p0);
            var p1 = this.playerQue.shift();
            if (!isout)
                this.playerQue.push(p1);
            else {
                console.log('quePlayer out:', p1, this.playerQue);
            }
            this.playerQue = [p0].concat(this.playerQue);
        } else {
            console.log('quePlayer gg', playerId, this.playerQue);
        }
        console.log('quePlayer', this.playerQue);
    }


}