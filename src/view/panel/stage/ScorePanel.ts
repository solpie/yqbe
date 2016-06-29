
////////////////////////////////ScorePanel///////////////////////////////////////////////
import BitmapText = createjs.BitmapText;
import Container = createjs.Container;
import Text = createjs.Text;
import {StagePanelView} from "./StagePanelView";
import {formatSecond} from "../../../utils/JsFunc";
import {GameInfo} from "../../../model/GameInfo";
import {blink} from "../../../utils/Fx";
import {TimerState} from "../../../event/Const";

export class ScorePanel {
    timeText:Text;
    leftAvgEloScoreText:Text;
    rightAvgEloScoreText:Text;
    leftScoreText:BitmapText;
    rightScoreText:BitmapText;
    leftScoreTextX:number;
    rightScoreTextX:number;
    leftCircleArr:any;
    rightCircleArr:any;
    timeOnSec:number;

    timerId:any;
    timerState:number;
    ctn:Container;

    constructor(parent:StagePanelView) {
        this.timeOnSec = 0;

        var scoreCtn = new createjs.Container();
        this.ctn = scoreCtn;
        scoreCtn.y = parent.stageHeight - 132;

        parent.stage.addChild(scoreCtn);

        var bg = new createjs.Bitmap('/img/panel/stage/scoreBg.png');
        bg.x = 1;
        scoreCtn.addChild(bg);

        var timeText:Text = new createjs.Text("99:99", "28px Arial", "#fff");
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
        var px = 675;
        var py = 88;
        for (var i = 0; i < 7; i++) {
            var leftScoreBg = new createjs.Bitmap("/img/panel/stage/leftScoreBg.png");//694x132
            leftScoreBg.x = px + i * 20;
            leftScoreBg.y = py;
            scoreCtn.addChild(leftScoreBg);
            var leftScore = new createjs.Bitmap("/img/panel/stage/leftScore.png");//694x132
            leftScore.x = leftScoreBg.x;
            leftScore.y = leftScoreBg.y;
            scoreCtn.addChild(leftScore);
            this.leftCircleArr.push(leftScore);
        }
        //right score
        px = 1090;
        for (var i = 0; i < 7; i++) {
            var rightScoreBg = new createjs.Bitmap("/img/panel/stage/rightScoreBg.png");//694x132
            rightScoreBg.x = px + i * 20;
            rightScoreBg.y = py;
            scoreCtn.addChild(rightScoreBg);
            var rightScore = new createjs.Bitmap("/img/panel/stage/rightScore.png");//694x132
            rightScore.x = rightScoreBg.x;
            rightScore.y = rightScoreBg.y;
            scoreCtn.addChild(rightScore);
            this.rightCircleArr.push(rightScore);
        }

        px = 770;
        var lTxt = new createjs.Text("", "28px Arial", "#fff");
        lTxt.text = '0';
        lTxt.textAlign = 'center';
        lTxt.x = px;
        lTxt.y = 22;
        this.leftAvgEloScoreText = lTxt;
        scoreCtn.addChild(lTxt);

        var rTxt = new createjs.Text("", "28px Arial", "#fff");
        rTxt.text = '0';
        rTxt.textAlign = 'center';
        rTxt.x = lTxt.x + 385;
        rTxt.y = lTxt.y;
        this.rightAvgEloScoreText = rTxt;
        scoreCtn.addChild(rTxt);
    }

    get isBlueWin():boolean {
        return Number(this.leftScoreText.text) > Number(this.rightScoreText.text);
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
                if (this.leftCircleArr[len - 1 - i].alpha == 0)
                    blink(this.leftCircleArr[len - 1 - i]);
                //circleArr[i].alpha = 1;
            }
            else {
                createjs.Tween.get(this.leftCircleArr[len - 1 - i]).to({alpha: 0}, 200);
                //circleArr[i].alpha = 0;
            }
        }
        // console.log(leftScore);
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

    setAvgEloScore(data) {
        this.leftAvgEloScoreText.text = data.left + "";
        this.rightAvgEloScoreText.text = data.right + "";

        // this.leftAvgEloScoreText.text = "1969";
        // this.rightAvgEloScoreText.text = data.right + "";
    }

    resetTimer() {
        this.timeOnSec = 0;
        this.timerState = TimerState.PAUSE;//0
        this.timeText.text = formatSecond(this.timeOnSec);
    }

    toggleTimer1() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = 0;
            this.timerState = TimerState.PAUSE;
        }
        else {
            this.timerId = setInterval(()=> {
                this.timeOnSec++;
                this.timeText.text = formatSecond(this.timeOnSec);
            }, 1000);
            this.timerState = TimerState.RUNNING;
        }
    }

    setTime(time, state:number) {
        this.timeText.text = formatSecond(time);
        this.timeOnSec = time;
        if (state) {
            this.toggleTimer1();
        }
    }

    init(gameInfo:any) {
        this.setLeftScore(gameInfo.leftScore);
        this.setRightScore(gameInfo.rightScore);
        var gameInfoClone:GameInfo = new GameInfo(gameInfo);
        this.setAvgEloScore(gameInfoClone.getAvgEloScore());
    }
}