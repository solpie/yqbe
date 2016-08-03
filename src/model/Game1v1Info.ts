import {PlayerInfo} from "./PlayerInfo";
import {setPropTo} from "./BaseInfo";
import {TimerState} from "../event/Const";
export class Game1v1Info {
    id:number;
    leftScore:number;
    rightScore:number;
    playerInfoArr:PlayerInfo[] = new Array(2);
    gameIdx:number = 0;//场次
    winScore:number = 2;
    gameState:number = 0;//0 未确认胜负 1 确认胜负未录入数据 2确认胜负并录入数据
    mvpPlayerId:number;
    isFinish:boolean;

    _timer:any = null;
    timerState:number = 0;
    time:number = 0;

    constructor(gameDoc?:any) {
        this.rightScore = 0;
        this.leftScore = 0;
        if (gameDoc) {
            setPropTo(gameDoc, this);
            var playerDocArr = this.playerInfoArr;
            this.playerInfoArr = [];
            for (var i = 0; i < playerDocArr.length; i++) {
                this.playerInfoArr.push(new PlayerInfo(playerDocArr[i]));
            }
        }
    }

    addLeftScore() {
        this.leftScore = (this.leftScore + 1) % (this.winScore + 1);
    }

    addRightScore() {
        this.rightScore = (this.rightScore + 1) % (this.winScore + 1);
    }

    minRightScore() {
        this.rightScore = (this.rightScore - 1) % (this.winScore + 1);
    }

    minLeftScore() {
        this.leftScore = (this.leftScore - 1) % (this.winScore + 1);
    }


    setPlayerInfoByIdx(pos, playerInfo:PlayerInfo) {
        this.playerInfoArr[pos] = playerInfo;
        return playerInfo;
    }

    setGameResult(isBlueWin:boolean) {
        if (isBlueWin) {
            this.playerInfoArr[0];
        }
        else {
            this.playerInfoArr[1];

        }
    }

    toggleTimer(state?) {
        if (state) {
            if (state === TimerState.PAUSE) {
                this.resetTimer();
            }
        }
        else {
            if (this._timer) {
                this.resetTimer();
            }
            else {
                this._timer = setInterval(() => {
                    this.time++;
                }, 1000);
                this.timerState = 1;
            }
        }

    }
    resetTimer() {
        clearInterval(this._timer);
        this._timer = 0;
        this.timerState = 0;
    }
}