import {CommandId} from "../../../event/Command";
import Component from "vue-class-component";
import {BasePanelView} from "../BasePanelView";
import {PanelId, TimerState} from "../../../event/Const";
import {PlayerInfo} from "../../../model/PlayerInfo";
import {StagePanel} from "./StagePanel";
import {SkillOP} from "../../../model/SkillOP";
// import Text = createjs.Text;
// import BitmapText = createjs.BitmapText;
// import Container = createjs.Container;

@Component({
    template: require('./stage-panel.html'),
    props: {
        op: {
            type: Boolean,
            required: true,
            default: false
        },
        timerName: {
            type: String,
            default: "start"
        },
        mvpIdx: {
            type: Number,
            required: true,
            default: 0
        },
        gameId: {
            type: Number,
            required: true,
            default: 0
        },
        playerInfoArr: {
            type: Array,
            default: [1, 2]
        }
    }
})
export class StagePanelView extends BasePanelView {
    // scorePanel:ScorePanel;
    // playerPanel:PlayerPanel;
    // eventPanel:EventPanel;

    stagePanel:StagePanel;

    mvpIdx:number;
    timerName:string;
    isInit:boolean;
    gameId:number;
    playerInfoArr:any;

    isSubmited:boolean = false;


    ready(pid?:string, isInitCanvas:boolean = true) {
        if (!pid)
            pid = PanelId.stagePanel;
        var io = super.ready(pid, isInitCanvas);
        this.initIO(io);
    }

    initIO(io:any) {
        io.on(`${CommandId.initPanel}`, (data) => {
            console.log(`${CommandId.initPanel}`, data);
            // ServerConf.isDev = data.isDev;
            if (!this.isInit && this.isInitCanvas)
                this.initStage(data.gameInfo);
        });

        io
            .on(`${CommandId.updateLeftScore}`, (data) => {
                console.log(`${CommandId.updateLeftScore}`, data);
                this.stagePanel.setLeftScore(data.leftScore);
            })
            .on(`${CommandId.updateRightScore}`, (data) => {
                this.stagePanel.setRightScore(data.rightScore);
            })
            .on(`${CommandId.updateLeftBall}`, (data) => {
                console.log(`${CommandId.updateLeftScore}`, data);
                this.stagePanel.setLeftBall(data.leftBall);
            })
            .on(`${CommandId.updateRightBall}`, (data) => {
                this.stagePanel.setRightBall(data.rightBall);
            })

            .on(`${CommandId.updateLeftSkill}`, (data) => {
                var skillInfoArr = data.skillInfoArr;
                console.log(skillInfoArr);
                this.stagePanel.setLeftSkillInfoArr(skillInfoArr);
            })
            .on(`${CommandId.updateRightSkill}`, (data) => {
                var skillInfoArr = data.skillInfoArr;
                this.stagePanel.setRightSkillInfoArr(skillInfoArr);
            })
            // .on(`${CommandId.straightScore3}`, (param) => {
            //     if (param.team === ViewEvent.STRAIGHT3_LEFT) {
            //         // this.eventPanel.fadeInStraight3(false);
            //     }
            //     else if (param.team === ViewEvent.STRAIGHT3_RIGHT) {
            //         // this.eventPanel.fadeInStraight3(true);
            //     }
            // })
            .on(`${CommandId.toggleTimer}`, (data) => {
                if (this.timerName === TimerState.START_STR)
                    this.timerName = TimerState.PAUSE_STR;
                else
                    this.timerName = TimerState.START_STR;
                // this.scorePanel.toggleTimer1();
            })
            .on(`${CommandId.resetTimer}`, (data) => {
                this.timerName = TimerState.START_STR;
                // this.scorePanel.resetTimer();
            })
            .on(`${CommandId.updatePlayer}`, (data) => {
                // this.getElem('#playerImg' + data.idx).src = data.playerDoc.avatar;
                // this.playerPanel.setPlayer(data.idx, new PlayerInfo(data.playerDoc));
                this.stagePanel.setPlayerInfo(data.idx, new PlayerInfo(data.playerDoc));
                // this.scorePanel.setAvgEloScore(data.avgEloScore);
            })
            .on(`${CommandId.updatePlayerAll}`, (param) => {
                //todo effect
                for (var i = 0; i < param.playerInfoArr.length; i++) {
                    var playerInfo:PlayerInfo = new PlayerInfo(param.playerInfoArr[i]);
                    // this.playerPanel.setPlayer(i, playerInfo);
                }
                // this.scorePanel.setLeftScore(0);
                // this.scorePanel.setRightScore(0);
                // this.scorePanel.setAvgEloScore(param.avgEloScore);
            })
            .on(`${CommandId.fadeInWinPanel}`, (param) => {
                var teamInfo = param.teamInfo;
                var mvpIdx = param.mvpIdx;
                var mvpId = param.mvpId;
                // this.eventPanel.fadeInWinPanel(teamInfo, mvpIdx, mvpId);
            })
            .on(`${CommandId.fadeOutWinPanel}`, (param) => {
                // this.eventPanel.fadeOutWinPanel();
            })
            .on(`${CommandId.updatePlayerBackNum}`, (param) => {
                // this.playerPanel.playerCardArr[param.idx].setBackNumber(param.backNum);
            })
    }

    initStage(gameDoc:any) {
        this.isInit = true;
        this.stagePanel = new StagePanel(this.stage);
        // this.scorePanel = new ScorePanel(this);
        // this.scorePanel.init(gameDoc);
        // this.playerPanel = new PlayerPanel(this);
        // this.playerPanel.init(gameDoc);
        this.gameId = gameDoc.id;
        // this.eventPanel = new EventPanel(this);
        console.log('initStage', gameDoc);
        if (this.op) {
            for (var i = 0; i < gameDoc.playerInfoArr.length; i++) {
                var playerInfo = gameDoc.playerInfoArr[i];
                if (playerInfo)
                    this.getElem("#player" + i).value = playerInfo.playerData.id;
            }
        }

    }

    onToggleTimer() {
        this.opReq(`${CommandId.cs_toggleTimer}`);
        console.log('onToggleTimer');
    }

    onResetTimer() {
        console.log('onResetTimer');
        this.opReq(`${CommandId.cs_resetTimer}`);
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

    onQueryPlayer(idx) {
        var queryId = this.getElem("#player" + idx).value;
        console.log('onQueryPlayer', idx, queryId);
        this.post(`/db/player/${queryId}`, (data) => {
            console.log('res: ', data);
            var playerDoc = data.playerDoc;
            this.getElem('#playerImg' + idx).src = playerDoc.avatar;
        });
    }

    onUpdatePlayerNum(idx) {
        var backNum = this.getElem("#playerNum" + idx).value;
        console.log('onUpdatePlayerNum', idx, backNum);
        this.opReq(`${CommandId.cs_updatePlayerBackNum}`, {idx: idx, backNum: backNum});
        // this.playerPanel.playerCardArr[idx].setBackNumber(playerNum);
    }

    onStarting() {
        console.log('onStarting');
        var playerIdArr = [];
        var backNumArr = [];
        for (var i = 0; i < 8; i++) {
            var queryId = Number(this.getElem("#player" + i).value);
            playerIdArr.push(queryId);
            backNumArr.push(Number(this.getElem("#playerNum" + i).value));
        }
        // playerIdArr = [10002, 10003, 10004, 10005,
        //     10008, 10010, 10011, 10012];
        this.opReq(`${CommandId.cs_updatePlayerAll}`,
            {playerIdArr: playerIdArr, backNumArr: backNumArr}
        );
    }

    onUpdatePlayer(idx) {
        console.log('onUpdatePlayer', idx);
        var queryId = Number(this.getElem("#player" + idx).value);
        console.log('onQueryPlayer', idx, queryId);
        this.opReq(`${CommandId.cs_updatePlayer}`, {idx: idx, playerId: queryId});
    }

    onAddBallNum(idx:number) {
        if (idx == 0)//left
        {
            console.log('onAddBallNum left', idx);
            this.opReq(`${CommandId.cs_addLeftBall}`)
        }
        else if (idx == 1) {
            console.log('onAddBallNum right', idx);
            this.opReq(`${CommandId.cs_addRightBall}`)

        }
    }


    onMinBallNum(idx:number) {
        console.log('onMinBallNum', idx);
        if (idx == 0)//left
        {
            this.opReq(`${CommandId.cs_minLeftBall}`)
        }
        else if (idx == 1) {
            this.opReq(`${CommandId.cs_minRightBall}`)
        }
    }

    onAddScore(idx:number) {
        console.log('onAddScore', idx);
        if (idx == 0)//left
        {
            this.opReq(`${CommandId.cs_addLeftScore}`)
        }
        else if (idx == 1) {
            this.opReq(`${CommandId.cs_addRightScore}`)
        }

    }

    onMinScore(idx:number) {
        console.log('onMinScore', idx);
        if (idx == 0)//left
        {
            this.opReq(`${CommandId.cs_minLeftScore}`)
        }
        else if (idx == 1) {
            this.opReq(`${CommandId.cs_minRightScore}`)
        }
    }

    onAddSkillOne(idx:number) {
        console.log('onMinScore', idx);
        if (idx == 0)//left
        {
            var skillOP = new SkillOP();
            skillOP.idx = 0;
            skillOP.op = SkillOP.ADD;
            this.opReq(`${CommandId.cs_updateLeftSkill}`, skillOP.toJson());
        }
        else if (idx == 1) {
            var skillOP = new SkillOP();
            skillOP.idx = 0;
            skillOP.op = SkillOP.ADD;
            this.opReq(`${CommandId.cs_updateRightSkill}`, skillOP.toJson());
        }
    }

    onMinSkillOne(idx:number) {
        console.log('onMinScore', idx);
        if (idx == 0)//left
        {
            var skillOP = new SkillOP();
            skillOP.idx = 0;
            skillOP.op = SkillOP.MIN;
            this.opReq(`${CommandId.cs_updateLeftSkill}`, skillOP.toJson());
        }
        else if (idx == 1) {
            var skillOP = new SkillOP();
            skillOP.idx = 0;
            skillOP.op = SkillOP.MIN;
            this.opReq(`${CommandId.cs_updateRightSkill}`, skillOP.toJson());
        }
    }

    onAddSkillTwo(idx:number) {
        console.log('onMinScore', idx);
        if (idx == 0)//left
        {
            var skillOP = new SkillOP();
            skillOP.idx = 1;
            skillOP.op = SkillOP.ADD;
            this.opReq(`${CommandId.cs_updateLeftSkill}`, skillOP.toJson());
        }
        else if (idx == 1) {
            var skillOP = new SkillOP();
            skillOP.idx = 1;
            skillOP.op = SkillOP.ADD;
            this.opReq(`${CommandId.cs_updateRightSkill}`, skillOP.toJson());
        }
    }

    onMinSkillTwo(idx:number) {
        console.log('onMinScore', idx);
        if (idx == 0)//left
        {
            var skillOP = new SkillOP();
            skillOP.idx = 1;
            skillOP.op = SkillOP.MIN;
            this.opReq(`${CommandId.cs_updateLeftSkill}`, skillOP.toJson());
        }
        else if (idx == 1) {
            var skillOP = new SkillOP();
            skillOP.idx = 1;
            skillOP.op = SkillOP.MIN;
            this.opReq(`${CommandId.cs_updateRightSkill}`, skillOP.toJson());
        }
    }


    onRefresh() {
        console.log('onRefresh');
        if (this.isSubmited)
            window.location.reload();
        else
            alert('还没提交比赛结果');
    }
}
