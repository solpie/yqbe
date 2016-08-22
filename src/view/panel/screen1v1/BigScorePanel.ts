import {ScreenView} from "./ScreenView";
import Container = createjs.Container;
import BitmapText = createjs.BitmapText;
import {BaseScreen} from "./BaseScreen";
export class BigScorePanel extends BaseScreen{
    leftFoulText:BitmapText;
    rightFoulText:BitmapText;
    leftScoreText:BitmapText;
    rightScoreText:BitmapText;

    constructor(parent:ScreenView) {
        super();
        var bigScoreCtn = new createjs.Container();
        parent.stage.addChild(bigScoreCtn);
        this.ctn = bigScoreCtn;


        //////////////////
        var bg = new createjs.Bitmap('/img/panel/screen/score/bg.jpg');
        bigScoreCtn.addChild(bg);

        var sheet = new createjs.SpriteSheet({
            animations: {
                "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
                "5": 5, "6": 6, "7": 7, "8": 8, "9": 9
            },
            images: ["/img/panel/screen/score/scoreNum.png"],
            frames: [
                [0, 0, 315, 435],
                [316, 0, 315, 435],
                [0, 436, 315, 435],
                [316, 436, 315, 435],
                [632, 0, 315, 435],
                [632, 436, 315, 435],
                [948, 0, 315, 435],
                [948, 436, 315, 435],
                [0, 872, 315, 435],
                [316, 872, 315, 435]
            ]
        });

// 0,0,0,315,435
// 1,316,0,315,435
// 2,0,436,315,435
// 3,316,436,315,435
// 4,632,0,315,435
// 5,632,436,315,435
// 6,948,0,315,435
// 7,948,436,315,435
// 8,0,872,315,435
// 9,316,872,315,435
        var leftScoreText = new createjs.BitmapText("7", sheet);
        leftScoreText.x = 260;
        leftScoreText.y = 210;
        this.leftScoreText = leftScoreText;
        bigScoreCtn.addChild(leftScoreText);

        var rightScoreText = new createjs.BitmapText("7", sheet);
        rightScoreText.x = 1380;
        rightScoreText.y = leftScoreText.y;
        this.rightScoreText = rightScoreText;
        bigScoreCtn.addChild(rightScoreText);


        var foulSheet = new createjs.SpriteSheet({
            animations: {
                "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
                "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "x": 10
            },
            images: ["/img/panel/screen/score/foulNum.png"],
            frames: [
                [166, 0, 165, 255],
                [332, 256, 165, 255],
                [332, 0, 165, 255],
                [0, 256, 165, 255],
                [166, 256, 165, 255],
                [0, 0, 165, 255],
                [498, 0, 165, 255],
                [498, 256, 165, 255],
                [0, 512, 165, 255],
                [166, 512, 165, 255],
                [332, 512, 165, 255]
            ]
        });

        var leftFoulText = new createjs.BitmapText("x", foulSheet);
        leftFoulText.x = 750;
        leftFoulText.y = 170;
        this.leftFoulText = leftFoulText;
        bigScoreCtn.addChild(leftFoulText);

        var rightFoulText = new createjs.BitmapText("6", foulSheet);
        rightFoulText.x = 1040;
        rightFoulText.y = leftFoulText.y;
        this.rightFoulText = rightFoulText;
        bigScoreCtn.addChild(rightFoulText);
    }

    setLeftScore(leftScore:number) {
        this.leftScoreText.text = `${leftScore}`;
    }

    setRightScore(rightScore:number) {
        this.rightScoreText.text = `${rightScore}`;
    }

    setLeftFoul(foulNum:number) {
        if (foulNum < 0)return;
        if (foulNum > 9)
            this.leftFoulText.text = 'x';
        else
            this.leftFoulText.text = `${foulNum}`;
    }

    setRightFoul(foulNum:number) {
        if (foulNum < 0)return;
        if (foulNum > 9)
            this.rightFoulText.text = 'x';
        else
            this.rightFoulText.text = `${foulNum}`;
    }

    reset() {
        this.setLeftFoul(0);
        this.setRightFoul(0);
        this.setLeftScore(0);
        this.setRightScore(0);
    }
}
