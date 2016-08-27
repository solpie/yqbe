import {formatSecond} from "../../../utils/JsFunc";
import {ViewConst} from "../../../event/Const";
import Container = createjs.Container;

export class CountDownPanel {
    ctn: Container;
    cdSec: number;
    cdTimer: any;

    constructor(parent: Container) {
        this.ctn = new Container();
        parent.addChild(this.ctn);
    }

    fadeInCountDown(sec: number, cdText: string) {
        this.ctn.removeAllChildren();
        this.ctn.alpha = 0;
        this.cdSec = sec;
        var countDownCtn = new createjs.Container();
        countDownCtn.x = ViewConst.STAGE_WIDTH - 479;
        countDownCtn.y = ViewConst.STAGE_HEIGHT - 200;

        var bg = new createjs.Bitmap('/img/panel/act/countDownBg.png');
        countDownCtn.addChild(bg);

        var txt1 = new createjs.Text("", "40px Arial", "#fff");
        txt1.x = 50;
        txt1.y = 25;
        countDownCtn.addChild(txt1);

        if (this.cdTimer)
            clearInterval(this.cdTimer);

        txt1.text = cdText + formatSecond(this.cdSec, '分', '秒');
        this.cdTimer = setInterval(()=> {
            this.cdSec--;
            if (this.cdSec > 0)
                txt1.text = cdText + formatSecond(this.cdSec, '分', '秒');
            else {
                this.fadeOutCountDown();
            }
        }, 1000);

        this.ctn.addChild(countDownCtn);
        createjs.Tween.get(this.ctn)
            .to({alpha: 1}, 300);
    }

    fadeOut() {
        clearInterval(this.cdTimer);

        createjs.Tween.get(this.ctn)
            .to({alpha: 0}, 300).call(
            ()=> {
                this.ctn.removeAllChildren();
            }
        );
    }

    fadeOutCountDown() {
        this.fadeOut();
    }
}