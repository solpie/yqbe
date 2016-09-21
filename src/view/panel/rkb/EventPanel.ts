import Container = createjs.Container;
import Bitmap = createjs.Bitmap;
export class EventPanel {
    ctn: Container;

    constructor(stage: any) {
        this.ctn = new Container();
        stage.addChild(this.ctn);

    }

    fadeInOK() {
        this.ctn.removeAllChildren();

        var bmpK = new Bitmap('/img/panel/rkb/k.png');
        this.ctn.addChild(bmpK);
        createjs.Tween.get(bmpK, {x: 1500, scaleX: 1, scaleY: 1}, 200);

        var bmpO = new Bitmap('/img/panel/rkb/o.png');
        this.ctn.addChild(bmpO);
        createjs.Tween.get(bmpO, {x: 1500, scaleX: 1, scaleY: 1}, 200);
    }
}