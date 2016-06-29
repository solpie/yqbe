import {VueEx} from "../VueEx";
import {ViewConst} from "../../event/Const";
import Stage = createjs.Stage;
import Container = createjs.Container;
export class BasePanelView extends VueEx {
    op:boolean;
    stageWidth:number;
    stageHeight:number;
    stage:Stage;
    ctn:Container;
    opReq:(cmdId:string, param?:any, callback?:any)=>void;
    isInitCanvas:boolean;
    initCanvas() {
        this.stageWidth = ViewConst.STAGE_WIDTH;
        this.stageHeight = ViewConst.STAGE_HEIGHT;
        var canvas = document.getElementById("stage");
        if (canvas) {
            canvas.setAttribute("width", this.stageWidth + "");
            canvas.setAttribute("height", this.stageHeight + "");
            var stage = new createjs.Stage(canvas);
            stage.autoClear = true;
            createjs.Ticker.framerate = 60;
            createjs.Ticker.addEventListener("tick", function () {
                stage.update();
            });

            this.ctn = new createjs.Container();
            stage.addChild(this.ctn);
            this.stage = stage;
        }
    }

    ready(pid?:string, isInitCanvas:boolean = true) {
        this.isInitCanvas = isInitCanvas;
        if (isInitCanvas)
            this.initCanvas();
        this.opReq = (cmdId:string, param:any, callback:any)=> {
            this.$http.post(`/panel/${pid}/${cmdId}`,
                param,
                callback);
        };
        var panel:any = this.$parent;
        this.op = panel.isOp;
        console.log("BasePanelView.ready", panel.isOp);
        return panel.connect();
    }
}