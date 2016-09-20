import {BasePanelView} from "../BasePanelView";
import Component from "vue-class-component";
import {PanelId} from "../../../event/Const";
import {CommandId} from "../../../event/Command";
@Component({
    template: require('./rkb-panel.html'),

})
export class RkbPanelView extends BasePanelView {
    isInit;

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
            }
        });
    }

}