import {BasePanelView} from "../BasePanelView";
import Component from "vue-class-component";
import {PlayerInfo, PlayerState1v1} from "../../../model/PlayerInfo";
import {PanelId, TimerState} from "../../../event/Const";
import {CommandId} from "../../../event/Command";
import {ScorePanel} from "./ScorePanel";
import {PlayerPanel} from "./PlayerPanel";
import {EventPanel} from "./EventPanel";
import {loadImgArr, descendingProp, mapToArr} from "../../../utils/JsFunc";
import {CountDownPanel} from "./CountDownPanel";
import $route = vuejs.$route;
import Tween = createjs.Tween;
declare var Materialize;

export var isAutoPanel: boolean;
@Component({
    template: require('./stage1v1-panel.html'),
    props: {
        op: {},
        gameId: {},
        gameIdx: {},
        bracketIdx: {},
        timerName: {},
        isUnLimitScore: {},
        leftFoul: {},
        rightFoul: {},
        cmdString: {},
        ftId: {},
        gameInfoText: {},
        cursorPlayerId: {},
        ftOptionArr: {},
        deadPlayerArr: {},
        playerNumArr: {
            type: Array,
            default: ['0', '0']
        },
        playerInfoArr: {
            type: Array,
            default: [1, 2]
        }
    },
    watch: {
        isUnLimitScore: 'onIsUnLimitScoreChanged',
        playerNumArr: 'onPlayerNumArrChanged',
        // cmdString: 'onCmdStringChanged',
        gameIdx: 'onGameIdxChanged'
    }
})
export class Stage1v1PanelView extends BasePanelView {
    op: boolean = false;
    playerInfoArr: PlayerInfo[];
    playerDocList: any;
    playerNumArr: number[];
    gameId: number;
    gameIdx: number;
    leftFoul: number;
    rightFoul: number;
    bracketIdx: number;//双败制场次序号 1-14
    cursorPlayerId: number;
    timerName: string;
    scorePanel: ScorePanel;
    playerPanel: PlayerPanel;
    eventPanel: EventPanel;
    countDownRender: CountDownPanel;

    isUnLimitScore: any;
    isShowWinPlayer: boolean = false;
    isSubmitGame: boolean = false;
    isInit: boolean = false;

    kingPlayer: number;
    pickUpArr: Array<any>;
    pickUpIdx: number;
    bracket18452736: string;

    pickUp8Map: any;

    //ft
    gameInfoText: string;
    deadPlayerArr: any;
    ftOptionArr: any;
    ftId: any;

    ready(pid?: string, isInitCanvas: boolean = true) {
        if (!pid)
            pid = PanelId.stage1v1Panel;
        var io = super.ready(pid, isInitCanvas);
        if (this.isAuto) {
            isAutoPanel = this.isAuto;
            this.initAuto(io);
        }
        else
            this.initIO(io);
        console.log('router', this.$route.params);
        this.initConsoleCmd();
    }

    initConsoleCmd() {
        window['setBracket'] = (playerArrStr) => {
            var a = playerArrStr.split(' ');
            for (var i = 0; i < a.length; i++) {
                a[i] = Number(a[i]);
            }
            this.opReq(`${CommandId.cs_setBracketPlayer}`, {playerIdArr: a});
            console.log(playerArrStr, a);
            return '';
        };
        window['showBracket'] = () => {
            console.log('bracket18452736', this.bracket18452736);
            return '';
        }
    }

    initIO(io: any) {
        io.on(`${CommandId.initPanel}`, (data) => {
            console.log(`${CommandId.initPanel}`, data);
            // ServerConf.isDev = data.isDev;
            if (!this.isInit && this.isInitCanvas) {
                data.gameInfo.kingPlayer = data.kingPlayer;
                this.kingPlayer = data.kingPlayer;
                this.leftFoul = data.gameInfo.leftFoul;
                this.rightFoul = data.gameInfo.rightFoul;
                this.gameInfoText = data.gameInfo.infoText;
                this.deadPlayerArr = data.gameInfo.deadPlayerArr;
                // if (data.lastLoserPlayerInfo)
                data.gameInfo.lastLoserPlayerInfo = data.lastLoserPlayerInfo;
                if (this.op) {
                    var ftArr = data.ftArr;
                    this.ftOptionArr = [];
                    for (var i = 0; i < ftArr.length; i++) {
                        var ft = ftArr[i];
                        this.ftOptionArr.push({text: ft.name, value: ft.id});
                    }
                }
                this.initStage(data.gameInfo);
            }
        });
        io
            .on(`${CommandId.updateWinScore}`, (data) => {
                console.log('updateWinScore', data);
                this.scorePanel.set35ScoreLight(data.winScore);
            })
            .on(`${CommandId.updateLeftScore}`, (data) => {
                console.log('updateLeftScore', data);
                this.scorePanel.setLeftScore(data.leftScore);
            })
            .on(`${CommandId.updateRightScore}`, (data) => {
                console.log('updateRightScore', data);
                this.scorePanel.setRightScore(data.rightScore);
            })
            .on(`${CommandId.updateLeftFoul}`, (data) => {
                console.log('updateLeftFoul', data);
                this.leftFoul = data.leftFoul;
            })
            .on(`${CommandId.updateRightFoul}`, (data) => {
                console.log('updateRightFoul', data);
                this.rightFoul = data.rightFoul;
            })
            .on(`${CommandId.updatePlayer}`, (data) => {
                console.log('updatePlayer', data);
                if (this.op) {
                    this.getElem('#playerImg' + data.idx).src = data.playerDoc.avatar;
                    this.getElem("#player" + data.idx).value = data.playerDoc.id;
                }
                this.playerPanel.setPlayer(data.idx, data.playerDoc, data.isKing);

            })
            .on(`${CommandId.updatePlayerBackNum}`, (param) => {
                var backNumArr = param.backNumArr;
                for (var i = 0; i < backNumArr.length; i++) {
                    var backNum = backNumArr[i];
                    this.playerPanel.playerCardArr[i].setBackNumber(backNum);
                }
            })
            .on(`${CommandId.setGameIdx}`, (param) => {
                var gameIdx = param.gameIdx;
                this.scorePanel.setGameIdx(gameIdx);
            })
            .on(`${CommandId.toggleTimer}`, (param) => {
                if (param && param.hasOwnProperty('state')) {
                    console.log('set Timer:', param);
                    this.scorePanel.toggleTimer1(param.state);
                }
                else {
                    if (this.timerName === TimerState.START_STR)
                        this.timerName = TimerState.PAUSE_STR;
                    else
                        this.timerName = TimerState.START_STR;
                    this.scorePanel.toggleTimer1();
                }
            })
            .on(`${CommandId.resetTimer}`, (data) => {
                this.timerName = TimerState.START_STR;
                this.scorePanel.resetTimer();
            })
            .on(`${CommandId.fadeInActivityPanel}`, (data) => {
                console.log("fade in act ", data);
                this.pickUp8Map = {};
                var pathArr = [];
                for (var i = 0; i < data.playerDocArr.length; i++) {
                    var playerDoc = data.playerDocArr[i];
                    pathArr.push(playerDoc.avatar);
                    if (!playerDoc.winGameCount && !playerDoc.loseGameCount) {
                        playerDoc.winningPercent = -1;
                    }
                    else
                        playerDoc.winningPercent = playerDoc.winGameCount / (playerDoc.loseGameCount + playerDoc.winGameCount);
                }
                var b = data.playerDocArr = data.playerDocArr.sort(descendingProp('winningPercent'));
                if (b.length > 7)
                    this.bracket18452736 = `${b[0].id} ${b[7].id} ${b[3].id} ${b[4].id} ${b[1].id} ${b[6].id} ${b[2].id} ${b[5].id}`;
                loadImgArr(pathArr, ()=> {
                    this.eventPanel.fadeInActPanel(data.playerDocArr, this.op, data.page, this.onChangePlayerState);
                });
            })
            .on(`${CommandId.fadeOutActivityPanel}`, (param) => {
                this.eventPanel.fadeOutWinPanel();
            })
            .on(`${CommandId.updatePlayerState}`, (param) => {
                var playerDoc = param.playerDoc;
                this.eventPanel.updatePlayerState(playerDoc);
            })
            // .on(`${CommandId.updateKingPlayer}`, (param) => {
            //     // var kingPlayer = param.kingPlayer;
            //     //
            //     // console.log('updateKingPlayer', param);
            //     //
            // })
            .on(`${CommandId.startingLine}`, (param) => {
                var playerDocArr = param.playerDocArr;
                for (var i = 0; i < playerDocArr.length; i++) {
                    var playerDoc = playerDocArr[i];
                    if (playerDoc.id == this.kingPlayer) {
                        playerDoc.isKing = true;
                    }
                }
                this.eventPanel.playerInfoCard.fadeInfoPlayerInfoCard(playerDocArr);
            })

            .on(`${CommandId.hideStartingLine}`, (param) => {
                this.eventPanel.playerInfoCard.fadeOutPlayerInfoCard();
            })
            .on(`${CommandId.resetGame}`, (param) => {
                window.location.reload();
            })
            .on(`${CommandId.fadeInWinPanel}`, (param) => {
                this.eventPanel.playerInfoCard.fadeInWinPlayer(param.isBlue, param.playerDoc);
            })

            .on(`${CommandId.fadeOutWinPanel}`, (param) => {
                this.eventPanel.playerInfoCard.fadeOutWinPlayer();
            })

            .on(`${CommandId.fadeInFinalPlayer}`, (param) => {
                this.eventPanel.playerInfoCard.fadeInFinalPlayer(param.playerDoc);

            })
            .on(`${CommandId.fadeOutFinalPlayer}`, (param) => {
                this.eventPanel.playerInfoCard.fadeOutWinPlayer();
            })

            .on(`${CommandId.fadeInCountDown}`, (param)=> {
                var cdSec = param.cdSec;
                var cdText = param.cdText;
                this.countDownRender.fadeInCountDown(cdSec, cdText);
            })
            .on(`${CommandId.fadeOutCountDown}`, (param)=> {
                this.countDownRender.fadeOut();
            })
            /////ft    view
            .on(`${CommandId.fadeInFTShow}`, (data)=> {
                console.log('fadeInFTShow', data);
                this.eventPanel.fadeInFTIntro(data);
            })
            .on(`${CommandId.fadeOutFTShow}`, (data)=> {
                console.log('fadeOutFtShow', data);
                this.eventPanel.fadeOutFtShow();
            })
            .on(`${CommandId.fadeInPlayerRank}`, (data)=> {
                console.log('fadeInPlayerRank', data);
                this.eventPanel.fadeInPlayerRank(data);
            })
            .on(`${CommandId.fadeInFtRank}`, (data)=> {
                console.log('fadeInFtRank', data);
                this.eventPanel.fadeInFtRank(data);
            })
            .on(`${CommandId.fadeInMixRank}`, (data)=> {
                console.log('fadeInMixRank', data);
                this.eventPanel.fadeInMixRank(data);
            })

    }

    initStage(gameDoc: any) {
        // console.log('is2v2:', (this.$parent as any).is2v2);
        // this.is2v2 = (this.$parent as any).is2v2;
        this.isInit = true;
        this.scorePanel = new ScorePanel(this, true);
        this.scorePanel.init(gameDoc);
        this.playerPanel = new PlayerPanel(this, true);
        this.playerPanel.init(gameDoc);
        this.gameId = gameDoc.id;
        this.eventPanel = new EventPanel(this);
        this.countDownRender = new CountDownPanel(this.stage);
        console.log('initStage', gameDoc);
        if (this.op) {
            this.pickUpArr = [0, 0];
            this.pickUpIdx = 0;
            this.pickUp8Map = {};

            if (gameDoc.lastLoserPlayerInfo.isBlue) {
                this.getElem("#player0").value = gameDoc.lastLoserPlayerInfo.playerData.id;
            }
            else {
                this.getElem("#player1").value = gameDoc.lastLoserPlayerInfo.playerData.id;
            }
            this.gameIdx = gameDoc.gameIdx;
            for (var i = 0; i < gameDoc.playerInfoArr.length; i++) {
                var playerInfo = gameDoc.playerInfoArr[i];
                if (playerInfo)
                    this.getElem("#player" + i).value = playerInfo.playerData.id;
            }
            this.isUnLimitScore = gameDoc.unLimitScore;
            document.onkeyup = (e)=> {
                var currKey = e.keyCode;
                var isShift = e.shiftKey;
                console.log('key:', currKey);
                if (currKey == 192) {
                    var $stagePanel = $('#stage-panel');
                    var display = $stagePanel.css('display');
                    if (display == 'none')
                        $stagePanel.show();
                    else
                        $stagePanel.hide();
                    // console.log('key:', display);
                }
                else if (currKey == 219) {
                    if (isShift)
                        this.onMinLeftScore();
                    else
                    //add left score
                        this.onAddLeftScore();
                }
                else if (currKey == 221) {
                    if (isShift)
                        this.onMinRightScore();
                    else
                    //add right score
                        this.onAddRightScore();
                }
                else if (currKey == 59 || currKey == 186) {
                    if (isShift)
                        this.onMinLeftFoul();
                    else
                    //add left foul
                        this.onAddLeftFoul();
                }
                else if (currKey == 222) {
                    if (isShift)
                        this.onMinRightFoul();
                    else

                    //add right foul
                        this.onAddRightFoul();
                }
            }
        }
    }

    onCreateGame() {
        if (this.isShowWinPlayer) {
            if (this.isSubmitGame)
                this.opReq(`${CommandId.cs_resetGame}`);
            else {
                alert('还没提交比赛结果');
            }
        }
        else {
            this.opReq(`${CommandId.cs_resetGame}`);
        }
    }

    onStarting() {
        this.opReq(`${CommandId.cs_startingLine}`);
    }

    onHideStarting() {
        this.opReq(`${CommandId.cs_hideStartingLine}`);
    }

    onUpdateWinScore(winScore) {
        console.log('onUpdateWinScore', winScore);
        this.opReq(`${CommandId.cs_updateWinScore}`, {winScore: winScore});
    }

    onAddLeftScore() {
        console.log('onAddLeftScore');
        this.opReq(`${CommandId.cs_addLeftScore}`,
            {param: 'addLeftScore'});
        Materialize.toast('onAddLeftScore', 4000);
    }

    onAddRightScore() {
        console.log('onAddRightScore');
        this.opReq(`${CommandId.cs_addRightScore}`);
        Materialize.toast('onAddRightScore', 4000);
    }

    onMinRightScore() {
        console.log('onMinRightScore');
        this.opReq(`${CommandId.cs_minRightScore}`);
        Materialize.toast('onMinRightScore', 4000);
    }

    onMinLeftScore() {
        console.log('onMinLeftScore');
        this.opReq(`${CommandId.cs_minLeftScore}`);
        Materialize.toast('onMinLeftScore', 4000);
    }

    onAddLeftFoul() {
        console.log('onAddLeftFoul');
        this.opReq(`${CommandId.cs_addLeftFoul}`);
        Materialize.toast('onAddLeftFoul', 4000);
    }

    onAddRightFoul() {
        console.log('onAddRightFoul');
        this.opReq(`${CommandId.cs_addRightFoul}`);
        Materialize.toast('onAddRightFoul', 4000);
    }

    onMinRightFoul() {
        console.log('onMinRightFoul');
        this.opReq(`${CommandId.cs_minRightFoul}`);
        Materialize.toast('onMinRightFoul', 4000);
    }

    onMinLeftFoul() {
        console.log('onMinLeftFoul');
        this.opReq(`${CommandId.cs_minLeftFoul}`);
        Materialize.toast('onMinLeftFoul', 4000);
    }

    onChangeColor() {
        var playerId0 = Number(this.getElem("#player0").value);
        var playerId1 = Number(this.getElem("#player1").value);
        if (playerId0 && playerId1) {
            this.opReq(`${CommandId.cs_changeColor}`, {idx: 0, playerId: playerId1});
            // this.opReq(`${CommandId.cs_updatePlayer}`, {idx: 0, playerId: playerId1});
            // this.opReq(`${CommandId.cs_updatePlayer}`, {idx: 1, playerId: playerId0});
        }
    }

    onUpdatePlayer(idx) {
        console.log('onUpdatePlayer', idx);
        var queryId = Number(this.getElem("#player" + idx).value);
        console.log('onQueryPlayer', idx, queryId);
        this.opReq(`${CommandId.cs_updatePlayer}`, {idx: idx, playerId: queryId});
    }

    onToggleTimer() {
        console.log('onToggleTimer');
        this.opReq(`${CommandId.cs_toggleTimer}`);
    }

    onResetTimer() {
        console.log('onResetTimer');
        this.opReq(`${CommandId.cs_resetTimer}`);
    }

    onGameIdxChanged(val) {
        console.log('onGameIdxChanged', val);
        this.opReq(`${CommandId.cs_setGameIdx}`, {gameIdx: val});
    }

    onPlayerNumArrChanged(val) {
        console.log('onPlayerNumArrChanged', val);
        this.opReq(`${CommandId.cs_updatePlayerBackNum}`, {backNumArr: val});
    }


    onSubmitGame() {
        var isBlueWin = this.scorePanel.isBlueWin;
        console.log("isBlueWin:", isBlueWin);

        var data: any = {bracketIdx: this.bracketIdx};
        this.opReq(`${CommandId.cs_saveGameRec}`, data, (res) => {
            console.log(res);
            if (res) {
                this.isSubmitGame = true;
                this.onShowWin();
                alert('比赛结果提交成功');
            }
            else {
                alert('比赛结果已经提交过了');
            }
        });
    }


    onShowAct() {
        console.log('onShowAct');
        this.opReq(`${CommandId.cs_fadeInActivityPanel}`, {page: 0})
    }

    onShowActPre() {
        console.log('onShowActPre');
        this.opReq(`${CommandId.cs_fadeInActivityPanel}`, {page: -1})
    }

    onShowActNext() {
        console.log('onShowActNext');
        this.opReq(`${CommandId.cs_fadeInActivityPanel}`, {page: 1})
    }

    onHideAct() {
        console.log('onHideAct');
        this.opReq(`${CommandId.cs_fadeOutActivityPanel}`)
    }

    onChangePlayerState(playerDoc) {
        console.log('onChangePlayerState', playerDoc);
        if (playerDoc.state == PlayerState1v1.FIGHTING) {
            console.log('pickUpIdx', this.pickUpIdx);
            this.pickUpArr[this.pickUpIdx] = playerDoc.id;
            this.pickUpIdx ? this.pickUpIdx = 0 : this.pickUpIdx = 1;
            this.pickUp8Map[playerDoc.id] = playerDoc;
        }

        this.opReq(`${CommandId.cs_updatePlayerState}`, {playerDoc: playerDoc});
    }

    onPickUpAct() {
        console.log('onChangePlayerState', this.pickUpArr);
        if (this.pickUpArr[0] && this.pickUpArr[1]) {
            this.opReq(`${CommandId.cs_updatePlayer}`, {idx: 0, playerId: this.pickUpArr[0]});
            this.opReq(`${CommandId.cs_updatePlayer}`, {idx: 1, playerId: this.pickUpArr[1]});
            this.onHideAct();
        }
    }

    onPickUp8() {
        var playerDocArr = mapToArr(this.pickUp8Map);
        var a = [];
        for (var i = 0; i < playerDocArr.length; i++) {
            var playerDoc = playerDocArr[i];
            if (playerDoc.state == PlayerState1v1.FIGHTING) {
                a.push(playerDoc);
            }
        }
        if (a.length == 8) {
            var b = a.sort(descendingProp('winningPercent'));
            this.bracket18452736 = `${b[0].id} ${b[7].id} ${b[3].id} ${b[4].id} ${b[1].id} ${b[6].id} ${b[2].id} ${b[5].id}`;
            window['setBracket'](this.bracket18452736);
            console.log('pick up 8', this.bracket18452736);
            this.onHideAct();
        }
        else {
            alert('未选满8人');
        }
    }

    onShowWin() {
        this.isShowWinPlayer = true;
        this.opReq(`${CommandId.cs_fadeInWinPanel}`);
    }

    onHideWin() {
        this.opReq(`${CommandId.cs_fadeOutWinPanel}`);
    }

    onFinalPlayer(idx) {
        console.log('onUpdatePlayer', idx);
        var playerId = Number(this.getElem("#player" + idx).value);
        this.opReq(`${CommandId.cs_fadeInFinalPlayer}`, {playerId: playerId});
    }

    onPickPlayer(idx) {
        console.log('onPickPlayer', idx);
    }

    onIsUnLimitScoreChanged(val) {
        var unLimitScore = Number(val);
        console.log('onIsUnlimitScoreChanged', val, unLimitScore);
        this.opReq(`${CommandId.cs_unLimitScore}`, {unLimitScore: unLimitScore});
    }

    onCmdStringChanged(val) {

    }

    onGetBracketInfo() {
        this.opReq(`${CommandId.cs_getBracketPlayerByIdx}`, {bracketIdx: this.bracketIdx});
    }


    cdText: string;
    cdSec: number;

    onCountDownIn() {
        console.log('onCountDownIn');
        this.opReq(`${CommandId.cs_fadeInCountDown}`,
            {cdSec: this.cdSec, cdText: this.cdText},
            (param)=> {
                console.log(param);
            });
    }

    onCountDownOut() {
        console.log('onCountDownOut');
        this.opReq(`${CommandId.cs_fadeOutCountDown}`);
    }

    /////////////////////////////////
    onFTShow() {
        console.log('onFTShow ftId:', this.ftId);
        this.opReq(`${CommandId.cs_fadeInFTShow}`, {idx: 0, ftId: this.ftId});
    }

    onFTHide() {
        console.log('onFTHide');
        this.opReq(`${CommandId.cs_fadeOutFTShow}`);
    }

    onFtFadeInPlayerRank() {
        console.log('onFtFadeInPlayerRank');
        this.opReq(`${CommandId.cs_fadeInPlayerRank}`);
    }

    onFtFadeInFtRankHide() {
        console.log('onFtFadeInFtRankHide');
        this.opReq(`${CommandId.cs_fadeInFtRank}`);
    }

    onFtFadeInMixRank() {
        console.log('onFtFadeInMixRank');
        this.opReq(`${CommandId.cs_fadeInMixRank}`);
    }


    onSetCursor() {
        var playerId = Number(this.cursorPlayerId);
        console.log('onSetCursor', this.cursorPlayerId, playerId);
        this.opReq(`${CommandId.cs_setCursorPlayer}`, {playerId: playerId}, (res)=> {
            alert(res);
        });
    }

    private initAuto(io) {
        this.scorePanel = new ScorePanel(this, true);
        // this.scorePanel.init(gameDoc);
        this.playerPanel = new PlayerPanel(this, true);
        // this.playerPanel.init(gameDoc);
        // this.gameId = gameDoc.id;
        this.eventPanel = new EventPanel(this);
        this.countDownRender = new CountDownPanel(this.stage);
        var setPlayer = (leftPlayer, rightPlayer)=> {
            var leftPlayerInfo = new PlayerInfo();
            var playerData = leftPlayer;
            leftPlayerInfo.name(playerData.name);
            leftPlayerInfo.avatar(playerData.avatar);
            leftPlayerInfo.winGameCount(playerData.winAmount);
            leftPlayerInfo.loseGameCount(playerData.loseAmount);
            leftPlayerInfo.playerData['ftDoc'] = {name: leftPlayer.group};
            this.playerPanel.setPlayer(0, leftPlayerInfo.playerData);

            var rightPlayerInfo = new PlayerInfo();
            playerData = rightPlayer;
            rightPlayerInfo.name(playerData.name);
            rightPlayerInfo.avatar(playerData.avatar);
            rightPlayerInfo.winGameCount(playerData.winAmount);
            rightPlayerInfo.loseGameCount(playerData.loseAmount);
            rightPlayerInfo.playerData['ftDoc'] = {name: rightPlayer.group};
            this.playerPanel.setPlayer(1, rightPlayerInfo.playerData);
        };
        io.on('connect', ()=> {
            console.log('hupuAuto socket connected');
            io.emit('passerbyking', {
                game_id: this.$route.params.game_id
            })
        })
        io.on('wall', (data: any)=> {
            var event = data.et;
            var eventMap = {};
            console.log('event:', event, data);

            eventMap['init'] = ()=> {
                console.log('init', data);
                this.scorePanel.set35ScoreLight(data.winScore);
                this.scorePanel.setGameIdx(data.gameIdx);
                setPlayer(data.player.left, data.player.right);
                this.scorePanel.setLeftScore(data.player.left.leftScore);
                this.scorePanel.setRightScore(data.player.right.rightScore);
                if (data.status == 0) {//status字段吧 0 进行中 1已结束
                    this.scorePanel.resetTimer();
                    this.scorePanel.toggleTimer1(TimerState.RUNNING);
                }
                //test
                // this.eventPanel.playerInfoCard.fadeInWinPlayer(true, data.player);

                // this.scorePanel.resetTimer();
                // this.scorePanel.toggleTimer1(TimerState.RUNNING);
                // Tween.get(this).wait(3000).call(()=> {
                //     this.scorePanel.toggleTimer1(TimerState.PAUSE);
                // });
            };
            eventMap['updateScore'] = ()=> {
                console.log('updateScore', data);
                if (data.leftScore != null) {
                    this.scorePanel.setLeftScore(data.leftScore);
                }
                if (data.rightScore != null) {
                    this.scorePanel.setRightScore(data.rightScore);
                }
            };
            eventMap['startGame'] = ()=> {
                console.log('startGame', data);
                this.scorePanel.set35ScoreLight(data.winScore);
                this.scorePanel.setGameIdx(data.gameIdx);
                setPlayer(data.player.left, data.player.right);
                // window.location.reload();
                this.scorePanel.resetScore();
                this.scorePanel.resetTimer();
                this.scorePanel.toggleTimer1(TimerState.RUNNING);
            };
            eventMap['commitGame'] = ()=> {
                var isBlue = data.idx == 0;
                data.player.winGameCount = data.player.winAmount;
                data.player.loseGameCount = data.player.loseAmount;
                this.eventPanel.playerInfoCard.fadeInWinPlayer(isBlue, data.player);
                this.scorePanel.toggleTimer1(TimerState.PAUSE);
            };
            eventMap['fadeInCountDown'] = ()=> {
                var text = data.text;
                var cdSec = data.cdSec;
                var type = data.type;
                this.countDownRender.fadeInCountDown(cdSec, text);
                console.log('fadeInCountDown', data);
            };
            eventMap['fadeOutCountDown'] = ()=> {
                this.countDownRender.fadeOut();
                console.log('fadeOutCountDown', data);
            };
            if (eventMap[event])
                eventMap[event]();
        });
    }
}