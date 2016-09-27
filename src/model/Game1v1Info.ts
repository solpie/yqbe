import {PlayerInfo, PlayerDoc} from "./PlayerInfo";
import {setPropTo} from "./BaseInfo";
import {TimerState} from "../event/Const";
export var bracketMap = {
    "1": {'loser': [5, 0], 'winner': [7, 0]},
    "2": {'loser': [5, 1], 'winner': [7, 1]},
    "3": {'loser': [6, 0], 'winner': [8, 0]},
    "4": {'loser': [6, 1], 'winner': [8, 1]},
    "5": {'loser': [-1, 0], 'winner': [10, 1]},
    "6": {'loser': [-1, 0], 'winner': [9, 1]},
    "7": {'loser': [9, 0], 'winner': [11, 0]},
    "8": {'loser': [10, 0], 'winner': [11, 1]},
    "9": {'loser': [-1, 0], 'winner': [12, 1]},
    "10": {'loser': [-1, 0], 'winner': [12, 0]},
    "11": {'loser': [13, 0], 'winner': [14, 0]},
    "12": {'loser': [-1, 0], 'winner': [13, 1]},
    "13": {'loser': [-1, 0], 'winner': [14, 1]}
};
export class Game1v1Info {
    id: number;
    leftScore: number;
    rightScore: number;

    leftFoul: number = 0;
    rightFoul: number = 0;

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
    _startDate;

    constructor(gameDoc?: any) {
        this.rightScore = 0;
        this.leftScore = 0;
        this._startDate = new Date().getTime();
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

    winner_Idx: any;
    loser_Idx: any;

    saveGameResult() {
        if (this.gameState === 0) {
            var isBlueWin = this.leftScore > this.rightScore;
            var bluePlayerDoc = this.playerInfoArr[0].playerData;
            var redPlayerDoc = this.playerInfoArr[1].playerData;
            bluePlayerDoc.ftScore ? bluePlayerDoc.ftScore += this.leftScore : bluePlayerDoc.ftScore = this.leftScore;
            bluePlayerDoc.curFtScore ? bluePlayerDoc.curFtScore += this.leftScore : bluePlayerDoc.curFtScore = this.leftScore;
            bluePlayerDoc.dtScore = this.leftScore;

            redPlayerDoc.ftScore ? redPlayerDoc.ftScore += this.rightScore : redPlayerDoc.ftScore = this.rightScore;
            redPlayerDoc.curFtScore ? redPlayerDoc.curFtScore += this.rightScore : redPlayerDoc.curFtScore = this.rightScore;
            redPlayerDoc.dtScore = this.rightScore;

            // this.playerInfoArr[0].playerData.ftScore?
            if (isBlueWin) {
                this.loserPlayerInfo = this.playerInfoArr[1];
                this.loserPlayerInfo.isBlue = false;
                this.winner_Idx = [this.playerInfoArr[0].playerData.id, 0];
                this.loser_Idx = [this.playerInfoArr[1].playerData.id, 1];
                PlayerInfo.addWinGameAmount(this.playerInfoArr[0].playerData);
                PlayerInfo.addLoseGameAmount(this.playerInfoArr[1].playerData);
            }
            else {
                this.winner_Idx = [this.playerInfoArr[1].playerData.id, 1];
                this.loser_Idx = [this.playerInfoArr[0].playerData.id, 0];

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

    getGameDoc() {
        var g: any = {};
        var date = new Date();
        g.time = this.time;
        var winner: any = this.playerInfoArr[this.winner_Idx[1]].playerData;
        var loser: any = this.playerInfoArr[this.loser_Idx[1]].playerData;
        g.idx = this.gameIdx;
        g.start = this._startDate;
        g.end = date.getTime();
        var gameDoc = (playerDoc)=> {
            return {name: playerDoc.name, _id: playerDoc._id, score: playerDoc.dtScore}
        };
        g.winner = gameDoc(winner);
        g.loser = gameDoc(loser);
        console.log('getGameDoc', g);
        return g;
    }

    getPlayerDocArr(): Array<PlayerDoc> {
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