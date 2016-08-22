import {PlayerInfo} from "./PlayerInfo";
import {setPropTo} from "./BaseInfo";
import {TimerState} from "../event/Const";
export class Game1v1Info {
    id: number;
    leftScore: number;
    rightScore: number;

    leftFoul:number = 0;
    rightFoul:number = 0;

    playerInfoArr: PlayerInfo[] = new Array(2);
    gameIdx: number = 0;//场次
    winScore: number = 2;
    unLimitScore: any;
    gameState: number = 0;//0 未确认胜负 1 确认胜负未录入数据 2确认胜负并录入数据
    mvpPlayerId: number;
    playerDocArr: Array<any>;

    kingPlayer: number = 0;//擂主id
    _timer: any = null;
    timerState: number = 0;
    time: number = 0;
    loserPlayerInfo: PlayerInfo;

    constructor(gameDoc?: any) {
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
        if (this.unLimitScore === 1)
            this.leftScore += 1;
        else
            this.leftScore = (this.leftScore + 1) % (this.winScore + 1);
    }

    addRightScore() {
        if (this.unLimitScore === 1)
            this.rightScore += 1;
        else
            this.rightScore = (this.rightScore + 1) % (this.winScore + 1);
    }

    minRightScore() {
        this.rightScore = (this.rightScore - 1) % (this.winScore + 1);
    }

    minLeftScore() {
        this.leftScore = (this.leftScore - 1) % (this.winScore + 1);
    }


    setPlayerInfoByIdx(pos, playerInfo: PlayerInfo) {
        this.playerInfoArr[pos] = playerInfo;
        return playerInfo;
    }

    saveGameResult() {
        if (this.gameState === 0) {
            var isBlueWin = this.leftScore > this.rightScore;
            if (isBlueWin) {
                this.loserPlayerInfo = this.playerInfoArr[1];
                this.loserPlayerInfo.isBlue = false;

                PlayerInfo.addWinGameAmount(this.playerInfoArr[0].playerData);
                PlayerInfo.addLoseGameAmount(this.playerInfoArr[1].playerData);
            }
            else {
                this.loserPlayerInfo = this.playerInfoArr[0];
                this.loserPlayerInfo.isBlue = true;

                PlayerInfo.addLoseGameAmount(this.playerInfoArr[0].playerData);
                PlayerInfo.addWinGameAmount(this.playerInfoArr[1].playerData);
            }
            this.gameState = 1;
        }
    }

    get isFinish() {
        return this.gameState != 0;
    }


    getPlayerDocArr() {
        var a = [];
        for (var i = 0; i < this.playerInfoArr.length; i++) {
            a.push(this.playerInfoArr[i].playerData);
        }
        return a;
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


    ///foul
    addRightFoul() {
        this.rightFoul++;
        return this.rightFoul;
    }

    minRightFoul() {
        this.rightFoul--;
        return this.rightFoul;
    }

    addLeftFoul() {
        this.leftFoul++;
        return this.leftFoul;
    }

    minLeftFoul() {
        this.leftFoul--;
        return this.leftFoul;
    }
}