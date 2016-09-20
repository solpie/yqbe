import {BasePanelView} from "../BasePanelView";
import Component from "vue-class-component";
import {PanelId} from "../../../event/Const";
import {CommandId} from "../../../event/Command";
import {HealthPanel} from "./HealthBar";
@Component({
    template: require('./rkb-panel.html'),
    props: {
        op: {},
        playerInfoArr: {
            type: Array,
            default: [1, 2]
        }
    }

})
export class RkbPanelView extends BasePanelView {
    isInit;
    op: boolean = false;
    playerInfoArr;
    health: HealthPanel;

    ready(pid?: string, isInitCanvas: boolean = true) {
        if (!pid)
            pid = PanelId.rkbPanel;
        var io = super.ready(pid, isInitCanvas);
        this.initIO(io);
    }

    initIO(io) {
        io.on(`${CommandId.initPanel}`, (data) => {
            console.log(`${CommandId.initPanel}`, data);
            // ServerConf.isDev = data.isDev;
            var gameInfo = data.gameInfo;

            if (!this.isInit && this.isInitCanvas) {
                this.initStage(gameInfo);
            }
        })
            .on(`${CommandId.attack}`, (data)=> {
                console.log('attack', data);
                this.health.attackHandle(data);
            });
    }

    initStage(gameInfo) {
        this.isInit = true;
        this.health = new HealthPanel(this.stage);
        this.health.init(gameInfo);
        if (this.op) {

        }
    }

    on1PAttack() {
        console.log('on1PAttack');
        var ad = 20 + (Math.random() + 50);
        this.opReq(`${CommandId.cs_attack}`, {target: 2});
    }

    onMin1PHealth() {
        console.log('onMin1PHealth');
    }

    on2pAttack() {
        console.log('on2pAttack');
        this.opReq(`${CommandId.cs_attack}`, {target: 1});
    }

    onMin2PHealth() {
        console.log('onMin2PHealth');
    }

}