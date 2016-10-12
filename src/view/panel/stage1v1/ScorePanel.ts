////////////////////////////////ScorePanel///////////////////////////////////////////////
import BitmapText = createjs.BitmapText;
import Container = createjs.Container;
import Text = createjs.Text;
import {formatSecond} from "../../../utils/JsFunc";
import {GameInfo} from "../../../model/GameInfo";
import {blink} from "../../../utils/Fx";
import {TimerState} from "../../../event/Const";
import Ease = createjs.Ease;
import Tween = createjs.Tween;

export class ScorePanel {
    timeText: Text;
    // leftAvgEloScoreText:Text;
    // rightAvgEloScoreText:Text;
    gameThText: Text;

    leftScoreText: BitmapText;
    rightScoreText: BitmapText;
    leftScoreTextX: number;
    rightScoreTextX: number;
    leftCircleArr: any;
    rightCircleArr: any;
    leftCircleBgArr: any;
    rightCircleBgArr: any;

    leftFoulCircleArr: any;
    rightFoulCircleArr: any;
    leftFoulHint: any;
    rightFoulHint: any;

    timeOnSec: number;

    timerId: any;
    timerState: number;

    ctn: Container;

    constructor(parent: any, is2v2: boolean = false) {
        this.timeOnSec = 0;

        var scoreCtn = new createjs.Container();
        this.ctn = scoreCtn;
        scoreCtn.y = parent.stageHeight - 132;

        parent.stage.addChild(scoreCtn);

        var bg;
        // if (is2v2)
        bg = new createjs.Bitmap('/img/panel/stage1v1/scoreBg1v1.png');
        // else
        //     bg = new createjs.Bitmap('/img/panel/stage/scoreBg.png');

        // bg.x = 1;
        scoreCtn.addChild(bg);

        var timeText: Text = new createjs.Text("99:99", "28px Arial", "#fff");
        timeText.x = parent.stageWidth * .5 - 31;
        timeText.y = 100;
        this.timeText = timeText;
        scoreCtn.addChild(timeText);


        var sheet = new createjs.SpriteSheet({
            animations: {
                "0": 1, "1": 2, "2": 3, "3": 4, "4": 5,
                "5": 6, "6": 7, "7": 8, "8": 9, "9": 0
            },
            images: ["/img/panel/stage/scoreNum.png"],
            frames: [[0, 0, 40, 54],
                [41, 0, 40, 54],
                [0, 55, 40, 54],
                [41, 55, 40, 54],
                [82, 0, 40, 54],
                [82, 55, 40, 54],
                [123, 0, 40, 54],
                [123, 55, 40, 54],
                [0, 110, 40, 54],
                [41, 110, 40, 54]]
        });
        var px = 865;
        var leftScoreNum = new createjs.BitmapText("0", sheet);
        leftScoreNum.letterSpacing = -2;
        leftScoreNum.x = px;
        leftScoreNum.y = 60;
        this.leftScoreText = leftScoreNum;
        this.leftScoreTextX = leftScoreNum.x;
        scoreCtn.addChild(leftScoreNum);

        var rightScoreNum = new createjs.BitmapText("0", sheet);
        rightScoreNum.letterSpacing = -2;
        rightScoreNum.x = px + 160;
        rightScoreNum.y = leftScoreNum.y;
        this.rightScoreText = rightScoreNum;
        this.rightScoreTextX = rightScoreNum.x;
        scoreCtn.addChild(rightScoreNum);


        //////
        this.leftCircleArr = [];
        this.rightCircleArr = [];
        this.leftCircleBgArr = [];
        this.rightCircleBgArr = [];
        this.set35ScoreLight(2);

        this.initFoulCircle();

        px = 770;

        var gameThText = new createjs.Text("第x场", "23px Arial", "#fff");
        gameThText.textAlign = 'center';
        gameThText.x = 964;
        gameThText.y = 59;
        scoreCtn.addChild(gameThText);

        this.gameThText = gameThText;
    }

    initFoulCircle() {
        var circle;
        this.leftFoulCircleArr = [];
        this.rightFoulCircleArr = [];

        for (var i = 0; i < 4; i++) {
            circle = new createjs.Bitmap('/img/panel/stage1v1/foul.png');
            circle.x = 604 + i * 9;
            circle.y = 120 - i * 15;
            circle.alpha = 0;
            this.ctn.addChild(circle);
            this.leftFoulCircleArr.push(circle);

            circle = new createjs.Bitmap('/img/panel/stage1v1/foul.png');
            circle.x = 1318 - i * 9;
            circle.scaleX = -1;
            circle.y = 120 - i * 15;
            circle.alpha = 0;
            this.ctn.addChild(circle);
            this.rightFoulCircleArr.push(circle);
        }
        this.leftFoulHint = new createjs.Bitmap('/img/panel/stage1v1/foulHint.png')
        this.leftFoulHint.x = 590;
        this.leftFoulHint.y = 62;
        this.ctn.addChild(this.leftFoulHint);

        this.rightFoulHint = new createjs.Bitmap('/img/panel/stage1v1/foulHint.png')
        this.rightFoulHint.scaleX = -1;
        this.rightFoulHint.x = 1332;
        this.rightFoulHint.y = 62//this.leftFoulHint.y;
        this.ctn.addChild(this.rightFoulHint);

        this.rightFoulHint.alpha = this.leftFoulHint.alpha = 0;

    }

    get isBlueWin(): boolean {
        return Number(this.leftScoreText.text) > Number(this.rightScoreText.text);
    }

    setLeftFoul(leftFoul) {
        this._setFoul(leftFoul, this.leftFoulCircleArr, this.leftFoulHint);
    }

    _setFoul(foul, circleArr, hint) {
        foul = Number(foul);
        if (foul > 4)
            foul = 4;
        // var circleArr = this.leftFoulCircleArr;
        for (var i = 0; i < circleArr.length; i++) {
            if (i < foul) {
                if (circleArr[i].alpha == 0)
                    blink(circleArr[i]);
            }
            else {
                createjs.Tween.get(circleArr[i]).to({alpha: 0}, 200);
            }
        }

        if (foul > 3) {

            createjs.Tween.get(hint, {loop: true})
            // .to({alpha: 1}, 100,Ease.backIn)
            // .to({alpha: 0}, 100,Ease.backOut)
            // .to({alpha: 1}, 100,Ease.bounceIn)
            // .to({alpha: 0}, 100,Ease.bounceOut)
                .to({alpha: 1}, 150, Ease.circIn)
                .to({alpha: 0}, 150, Ease.circOut);
        }
        else
            Tween.get(hint, {loop: false}, null, true).to({alpha: 0});

    }

    setRightFoul(rightFoul) {
        this._setFoul(rightFoul, this.rightFoulCircleArr, this.rightFoulHint);
    }

    setLeftScore(leftScore) {
        this.leftScoreText.text = leftScore + "";
        if (leftScore > 9)
            this.leftScoreText.x = this.leftScoreTextX - 18;
        else
            this.leftScoreText.x = this.leftScoreTextX;

        // console.log("LeftScoreLabel width:", this.leftScoreLabel.getBounds().width);
        var len = this.leftCircleArr.length;

        for (var i = 0; i < this.leftCircleArr.length; i++) {
            if (i < leftScore) {
                if (this.leftCircleArr[i].alpha == 0)
                    blink(this.leftCircleArr[i]);
            }
            else {
                createjs.Tween.get(this.leftCircleArr[i]).to({alpha: 0}, 200);
            }
        }
        // for (var i = 0; i < this.leftCircleArr.length; i++) {
        //     if (i < leftScore) {
        //         if (this.leftCircleArr[len - 1 - i].alpha == 0)
        //             blink(this.leftCircleArr[len - 1 - i]);
        //     }
        //     else {
        //         createjs.Tween.get(this.leftCircleArr[len - 1 - i]).to({alpha: 0}, 200);
        //     }
        // }
    }

    setRightScore(rightScore) {
        if (rightScore > 9)
            this.rightScoreText.x = this.rightScoreTextX - 18;
        else
            this.rightScoreText.x = this.rightScoreTextX;
        this.rightScoreText.text = rightScore + "";

        var len = this.rightCircleArr.length;
        for (var i = 0; i < len; i++) {
            if (i < rightScore) {
                if (this.rightCircleArr[i].alpha == 0)
                    blink(this.rightCircleArr[i]);
                // createjs.Tween.get(this.rightCircleArr[len - 1 - i]).to({alpha: 1}, 200);
            }
            else {
                createjs.Tween.get(this.rightCircleArr[i]).to({alpha: 0}, 200);
            }
        }
    }

    set35ScoreLight(count) {
        // this.leftCircleArr.length = 0;
        // this.rightCircleArr.length = 0;
        for (var i = 0; i < this.rightCircleArr.length; i++) {
            var img = this.rightCircleArr[i];
            img.parent.removeChild(img);
        }
        this.rightCircleArr.length = 0;

        for (var i = 0; i < this.rightCircleBgArr.length; i++) {
            var img = this.rightCircleBgArr[i];
            img.parent.removeChild(img);
        }
        this.rightCircleBgArr.length = 0;

        for (var i = 0; i < this.leftCircleArr.length; i++) {
            var img = this.leftCircleArr[i];
            img.parent.removeChild(img);
        }
        this.leftCircleArr.length = 0;
        for (var i = 0; i < this.leftCircleBgArr.length; i++) {
            var img = this.leftCircleBgArr[i];
            img.parent.removeChild(img);
        }
        this.leftCircleBgArr.length = 0;

        var scoreCtn = this.ctn;
        ///////////////
        var px;
        var py = 88;
        var pxLeft;
        var pxRight;
        var invert;
        var pathBigCircle = 'stage';
        if (count == 3) {
            pxLeft = 780;
            pxRight = 1110;
            invert = 45
        }
        else if (count == 5) {
            pxLeft = 780;
            pxRight = 1110;
            invert = 27;
        }
        else if (count == 2) {
            invert = 80;
            pxLeft = 750;
            pxRight = 1090;
            pathBigCircle = 'stage1v1'
        }
        px = pxLeft;
        for (var i = 0; i < count; i++) {
            var leftScoreBg = new createjs.Bitmap(`/img/panel/${pathBigCircle}/leftScoreBg.png`);//694x132
            leftScoreBg.x = px - i * invert;
            leftScoreBg.y = py;
            scoreCtn.addChild(leftScoreBg);
            this.leftCircleBgArr.push(leftScoreBg);
            var leftScore = new createjs.Bitmap(`/img/panel/${pathBigCircle}/leftScore.png`);//694x132
            leftScore.x = leftScoreBg.x;
            leftScore.y = leftScoreBg.y;
            scoreCtn.addChild(leftScore);
            this.leftCircleArr.push(leftScore);
        }
        //right score
        px = pxRight;
        for (var i = 0; i < count; i++) {
            var rightScoreBg = new createjs.Bitmap(`/img/panel/${pathBigCircle}/rightScoreBg.png`);//694x132
            rightScoreBg.x = px + i * invert;
            rightScoreBg.y = py;
            scoreCtn.addChild(rightScoreBg);
            this.rightCircleBgArr.push(rightScoreBg);
            var rightScore = new createjs.Bitmap(`/img/panel/${pathBigCircle}/rightScore.png`);//694x132
            rightScore.x = rightScoreBg.x;
            rightScore.y = rightScoreBg.y;
            scoreCtn.addChild(rightScore);
            this.rightCircleArr.push(rightScore);
        }

        this.setLeftScore(Number(this.leftScoreText.text));
        this.setRightScore(Number(this.rightScoreText.text));
    }

    setAvgEloScore(data) {
        // this.leftAvgEloScoreText.text = (data.left || 0) + "";
        // this.rightAvgEloScoreText.text = (data.right || 0) + "";

        // this.leftAvgEloScoreText.text = "1969";
        // this.rightAvgEloScoreText.text = data.right + "";
    }

    resetScore() {
        this.setLeftScore(0);
        this.setRightScore(0);
        this.setLeftFoul(0);
        this.setRightFoul(0);
    }

    resetTimer() {
        this.timeOnSec = 0;
        this.timerState = TimerState.PAUSE;//0
        this.timeText.text = formatSecond(this.timeOnSec);
    }

    toggleTimer1(state?) {
        var pauseTimer = ()=> {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = 0;
                this.timerState = TimerState.PAUSE;
            }
        };

        var playTimer = ()=> {
            if (this.timerId)
                clearInterval(this.timerId);
            this.timerId = setInterval(()=> {
                this.timeOnSec++;
                this.timeText.text = formatSecond(this.timeOnSec);
            }, 1000);
            this.timerState = TimerState.RUNNING;
        };

        if (state != null) {
            if (state == TimerState.PAUSE) {
                pauseTimer();
            }
            else if (state == TimerState.RUNNING) {
                playTimer();
            }
        }
        else {
            if (this.timerId) {
                pauseTimer();
            }
            else {
                playTimer();
            }
        }

    }

    setTime(time, state: number) {
        this.timeText.text = formatSecond(time);
        this.timeOnSec = time;
        if (state) {
            this.toggleTimer1();
        }
    }

    setGameIdx(idx: number) {
        if (idx == null)
            idx = 0;
        this.gameThText.text = `第${idx}场`;
    }

    init(gameInfo: any) {
        this.setLeftScore(gameInfo.leftScore);
        this.setRightScore(gameInfo.rightScore);
        this.setLeftFoul(gameInfo.leftFoul);
        this.setRightFoul(gameInfo.rightFoul);
        var gameInfoClone: GameInfo = new GameInfo(gameInfo);
        this.setAvgEloScore(gameInfoClone.getAvgEloScore());
        this.setGameIdx(gameInfo.gameTh);
    }
}