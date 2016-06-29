import {StagePanelView} from "../stage/StagePanelView";
import Component from "vue-class-component";
import {PanelId} from "../../../event/Const";
import {CommandId} from "../../../event/Command";
@Component({
    template: require('./stage-panel-mobile.html'),
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
            default: [1, 2, 3, 4, 5, 6, 7, 8]
        }
    }
})
export class StagePanelViewMobile extends StagePanelView {
    ready() {
        super.ready(PanelId.stagePanel, false);
    }

    initIO(io:any) {
        console.log('init io!!!');
    
    }

    onAddLeftFoul() {
        console.log('onAddLeftFoul');
        this.opReq(`${CommandId.cs_addLeftFoul}`);
    }

    onMinLeftFoul() {
        console.log('onMinLeftFoul');
        this.opReq(`${CommandId.cs_minLeftFoul}`);
    }

    onMinRightFoul() {
        console.log('onMinRightFoul');
        this.opReq(`${CommandId.cs_minRightFoul}`);
    }

    onAddRightFoul() {
        console.log('onAddRightFoul');
        this.opReq(`${CommandId.cs_addRightFoul}`);
    }

    onComingActivity() {
        console.log('onComingActivity');
        this.opReq(`${CommandId.cs_setGameComing}`);
    }
}