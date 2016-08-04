import {BasePanelView} from "../BasePanelView";
import Component from "vue-class-component";
import {PlayerInfo} from "../../../model/PlayerInfo";
import {PanelId, TimerState} from "../../../event/Const";
import {CommandId} from "../../../event/Command";
import {ScorePanel} from "./ScorePanel";
import {PlayerPanel} from "./PlayerPanel";
import {EventPanel} from "./EventPanel";
@Component({
    template: require('./stage1v1-panel.html'),
    props: {
        op: {},
        gameId: {},
        gameIdx: {},
        timerName: {},
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
        playerNumArr: 'onPlayerNumArrChanged',
        gameIdx: 'onGameIdxChanged'
    }
})
export class Stage1v1PanelView extends BasePanelView {
    op: boolean = false;
    playerInfoArr: PlayerInfo[];
    playerNumArr: number[];
    gameId: number;
    gameIdx: number;
    timerName: string;
    scorePanel: ScorePanel;
    playerPanel: PlayerPanel;
    eventPanel: EventPanel;
    isInit: boolean = false;

    ready(pid?: string, isInitCanvas: boolean = true) {
        if (!pid)
            pid = PanelId.stage1v1Panel;
        var io = super.ready(pid, isInitCanvas);
        this.initIO(io);
    }

    initIO(io: any) {
        io.on(`${CommandId.initPanel}`, (data) => {
            console.log(`${CommandId.initPanel}`, data);
            // ServerConf.isDev = data.isDev;
            if (!this.isInit && this.isInitCanvas)
                this.initStage(data.gameInfo);
        });
        io
            .on(`${CommandId.updateLeftScore}`, (data) => {
                console.log('updateLeftScore', data);
                this.scorePanel.setLeftScore(data.leftScore);
            })
            .on(`${CommandId.updateRightScore}`, (data) => {
                console.log('updateRightScore', data);
                this.scorePanel.setRightScore(data.rightScore);
            })
            .on(`${CommandId.updatePlayer}`, (data) => {
                console.log('updatePlayer', data);
                this.getElem('#playerImg' + data.idx).src = data.playerDoc.avatar;
                // this.playerPanel.setPlayer(data.idx, new PlayerInfo(data.playerDoc));
                this.playerPanel.setPlayer(data.idx, new PlayerInfo(data.playerDoc));
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
        console.log('initStage', gameDoc);
        if (this.op) {
            for (var i = 0; i < gameDoc.playerInfoArr.length; i++) {
                var playerInfo = gameDoc.playerInfoArr[i];
                if (playerInfo)
                    this.getElem("#player" + i).value = playerInfo.playerData.id;
            }
        }
    }

    onAddLeftScore() {
        console.log('onAddLeftScore');
        this.opReq(`${CommandId.cs_addLeftScore}`,
            {param: 'addLeftScore'});
    }

    onAddRightScore() {
        console.log('onAddRightScore');
        this.opReq(`${CommandId.cs_addRightScore}`);
    }

    onMinRightScore() {
        console.log('onMinRightScore');
        this.opReq(`${CommandId.cs_minRightScore}`);
    }

    onMinLeftScore() {
        console.log('onMinLeftScore');
        this.opReq(`${CommandId.cs_minLeftScore}`);
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

        var date = new Date();
        var dateTime = date.getTime();
        this.opReq(`${CommandId.cs_saveGameRec}`, {date: dateTime}, (res) => {
            console.log(res);
            if (res) {
                alert('比赛结果提交成功');
            }
            else {
                alert('比赛结果已经提交过了');
            }
        });
        // if (this.scorePanel.isBlueWin != isBlueMvp) {
        //     alert('比赛结果与mvp不符')
        // }
        // else {
        //     var date = new Date();
        //     var dateTime = date.getTime();
        //     console.log('onSubmitGame', dateTime);
        //     this.opReq(`${CommandId.cs_saveGameRec}`, {date: dateTime}, (res) => {
        //         console.log(res);
        //         this.isSubmited = true;
        //         if (res) {
        //             alert('比赛结果提交成功');
        //         }
        //         else {
        //             alert('比赛结果已经提交过了');
        //         }
        //     });
        // }
    }

}