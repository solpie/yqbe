import {BasePanelView} from "../BasePanelView";
import Component from "vue-class-component";
import {PlayerInfo} from "../../../model/PlayerInfo";
import {PanelId} from "../../../event/Const";
import {CommandId} from "../../../event/Command";
import {ScorePanel} from "./ScorePanel";
import {PlayerPanel} from "./PlayerPanel";
import {EventPanel} from "./EventPanel";
@Component({
    template: require('./stage1v1-panel.html'),
    props: {
        op: {},
        gameId: {},
        playerInfoArr: {
            type: Array,
            default: [1, 2]
        }
    }
})
export class Stage1v1PanelView extends BasePanelView {
    op:boolean = false;
    playerInfoArr:PlayerInfo[];
    gameId:number;
    scorePanel:ScorePanel;
    playerPanel:PlayerPanel;
    eventPanel:EventPanel;
    isInit:boolean = false;

    ready(pid?:string, isInitCanvas:boolean = true) {
        if (!pid)
            pid = PanelId.stage1v1Panel;
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
                console.log('updateLeftScore', data);
                this.scorePanel.setLeftScore(data.leftScore);
            })
            .on(`${CommandId.updateRightScore}`, (data) => {
                console.log('updateRightScore', data);
                this.scorePanel.setRightScore(data.rightScore);
            })
    }

    initStage(gameDoc:any) {
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


}