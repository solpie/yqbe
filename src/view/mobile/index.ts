import {PanelId} from "../../event/Const";
import {VueEx,Component} from "../VueEx";
import {OpLinks} from "../admin/components/home/home";
import {FooterBar} from "./footerbar/footerbar";
import {Navbar} from "../admin/components/navbar/navbar";

declare var io:any;
declare var pid:string;
declare var op:boolean;
declare var host:any;
declare var wsPort:any;

@Component({
    components: {FooterBar}
})
export class Mobile extends VueEx {
    pid:string;
    isOp:boolean;
    panel:any;
    ready(){
        console.log('mobile ready');
    }
    connect() {
        var wsUrl = `http://${host}:${wsPort}/${this.pid}`;
        console.log("init panel!!!", this.pid, this.isOp, wsUrl);
        return io.connect(wsUrl)
    }
}

//router

import Vue = require('vue');
Vue.use(require('vue-resource'));

import VueRouter = require('vue-router');
import ComponentOption = vuejs.ComponentOption;
import {StagePanelViewMobile} from "../panel/mobile/StagePanelViewMobile";
Vue.use(VueRouter);

var router = new VueRouter<Mobile>();

router.map({
    '/': {
        component: OpLinks,
        name: 'home'
    },
    '/panel/stage/op': {
        component: StagePanelViewMobile,
        name: 'stage'
    },
    // '/screen/:op': {
    //     component: ScreenView,
    // },
    // '/act/:op': {
    //     component: ActivityPanelView,
    //     name: 'act'
    // }
});
router.afterEach((transition) => {
    var toPath = transition.to.path;
    router.app.isOp = /\/op/.test(toPath);
    if (/\/stage/.test(toPath)) {
        router.app.pid = PanelId.stagePanel;
    } else if (/\/act/.test(toPath)) {
        router.app.pid = PanelId.actPanel;
    } else if (/\/screen/.test(toPath)) {
        router.app.pid = PanelId.screenPanel;
    }
    console.log('after each!!!', toPath);
});
router.start(Mobile, '#app');
console.log('start router');
