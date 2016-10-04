import Container = createjs.Container;
import Bitmap = createjs.Bitmap;
import BitmapText = createjs.BitmapText;

class AdNum extends Container {
    _text: BitmapText;
    _minBg: Bitmap;

    constructor() {
        super();
        var bg = new Bitmap('/img/panel/rkb/numAdBg.png');
        this.addChild(bg);

        var sheet = new createjs.SpriteSheet({
            animations: {
                "0": 0,
                "1": 1,
                "2": 2,
                "3": 3,
                "4": 4,
                "5": 5,
                "6": 6,
                "7": 7,
                "8": 8,
                "9": 9
            },
            images: ["/img/panel/rkb/numAd.png"],
            frames: [[0, 0, 51, 59],
                [157, 0, 52, 59],
                [104, 0, 52, 59],
                [157, 120, 52, 59],
                [0, 120, 55, 59],
                [52, 0, 51, 59],
                [104, 60, 52, 59],
                [56, 120, 52, 59],
                [157, 60, 52, 59],
                [0, 60, 55, 59]]
        });
        this._text = new createjs.BitmapText("0", sheet);
        this._text.x = 50;
        this._text.scaleX = this._text.scaleY = .8;
        this._text.y = 5;
        this.addChild(this._text);

        this._minBg = new Bitmap('/img/panel/rkb/numAd_.png');
        this._minBg.x = 5;
        this._minBg.y = -1;
        this.addChild(this._minBg);
    }

    setNum(v) {
        this._text.text = v + "";
    }
}
export class EventPanel {
    ctn: Container;
    numHit: BitmapText;
    private numAd: BitmapText;
    numHitArr: Array<BitmapText>;
    numAdArr: Array<AdNum>;

    constructor(stage: any) {
        this.ctn = new Container();
        stage.addChild(this.ctn);
        this.initNum();
    }

    fadeInAd(param) {
        this.numHit.text = param.ad + "";
        this.ctn.addChild(this.numHit);
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

    initNum() {
        this.numHitArr = [];
        var sheet = new createjs.SpriteSheet({
            animations: {
                "0": 1,
                "1": 2,
                "2": 3,
                "3": 4,
                "4": 5,
                "5": 6,
                "6": 7,
                "7": 8,
                "8": 9,
                "9": 0
            },
            images: ["/img/panel/rkb/numHit.png"],
            frames: [[0, 0, 51, 59],
                [157, 0, 52, 59],
                [157, 120, 52, 59],
                [104, 60, 52, 59],
                [56, 120, 55, 59],
                [52, 0, 51, 59],
                [104, 0, 52, 59],
                [0, 60, 52, 59],
                [157, 60, 52, 59],
                [0, 120, 55, 59]]
        });
        var numHit = new BitmapText('0', sheet);
        numHit.x = 30;
        numHit.y = 300;
        this.ctn.addChild(numHit);
        this.numHitArr.push(numHit);

        numHit = new BitmapText('0', sheet);
        numHit.x = 1300;
        numHit.y = 300;
        this.ctn.addChild(numHit);
        this.numHitArr.push(new BitmapText('0', sheet));


        this.numAdArr = [];
        var adNum = new AdNum();
        adNum.x = 30;
        adNum.y = 300;
        this.ctn.addChild(adNum);
        adNum.setNum(123456789);
        this.numAdArr.push(adNum);

        adNum = new AdNum();
        adNum.x = 1300;
        adNum.y = 300;
        this.ctn.addChild(adNum);
        adNum.setNum(1234567890);
        this.numAdArr.push(adNum);
    }
}