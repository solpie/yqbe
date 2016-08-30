import {StagePanelView} from "./stage/StagePanelView";
import {PanelId} from "../../event/Const";
import {VueEx} from "../VueEx";
import {OpLinks} from "../admin/components/home/home";
import {Stage1v1PanelView} from "./stage1v1/Stage1v1PanelView";
import {ScreenView} from "./screen1v1/ScreenView";
import {BracketView} from "./bracket/BracketView";

declare var io: any;
declare var pid: string;
declare var op: boolean;
declare var host: any;
declare var wsPort: any;
export class Panel extends VueEx {
    pid: string;
    isOp: boolean;
    panel: any;

    connect() {
        var wsUrl = `http://${window.location.host}:${wsPort}/${this.pid}`;
        console.log("init panel!!!", this.pid, this.isOp, wsUrl);
        return io.connect(wsUrl)
    }
}

//router

import Vue = require('vue');
Vue.use(require('vue-resource'));

import VueRouter = require('vue-router');
import ComponentOption = vuejs.ComponentOption;
Vue.use(VueRouter);

var router = new VueRouter<Panel>();

router.map({
    '/': {
        component: OpLinks,
        name: 'OpLinks'
    },
    '/stage/:op': {
        component: StagePanelView,
        name: 'stage'
    },
    '/screen1v1/:ob': {
        component: ScreenView,
        name: 'screen1v1'
    },
    '/bracket/:ob': {
        component: BracketView,
        name: 'bracket'
    },
    '/stage1v1/:op': {
        component: Stage1v1PanelView,
        name: 'stage1v1'
    }
});
router.afterEach((transition) => {
    var toPath = transition.to.path;
    router.app.isOp = /\/op/.test(toPath);
    if (/\/stage1v1/.test(toPath)) {
        router.app.pid = PanelId.stage1v1Panel;
    }
    else if (/\/screen1v1/.test(toPath)) {
        router.app.pid = PanelId.stage1v1Panel;
    }
    else if (/\/stage/.test(toPath)) {
        router.app.pid = PanelId.stagePanel;
    }
    else if (/\/act/.test(toPath)) {
        router.app.pid = PanelId.actPanel;
    } else if (/\/screen/.test(toPath)) {
        router.app.pid = PanelId.screenPanel;
    }
    else if (/\/bracket/.test(toPath)) {
        router.app.pid = PanelId.stage1v1Panel;
    }
    console.log('after each!!!', toPath);
});
router.start(Panel, '#panel');
console.log('start router');
