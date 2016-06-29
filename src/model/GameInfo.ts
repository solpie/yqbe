import {TeamInfo} from "./TeamInfo";
import {PlayerInfo} from "./PlayerInfo";
import {setPropTo} from "./BaseInfo";
import {TimerState} from "../event/Const";
export class GameDoc {
    id:number = -1;
    playerDocArr:any;
    playerIdArr:any;
    isFinish:boolean;
    isBlueWin:boolean;
    isRedWin:boolean;
    blueScore:number = 0;
    redScore:number = 0;
    mvp:number = 0;
}
export class GameInfo {
    id:number = 0;
    winScore:number = 7;
    leftScore:number = 0;
    rightScore:number = 0;
    leftFoul:number = 0;
    rightFoul:number = 0;
    time:number = 0;
    timerState:number = 0;
    data:Date;//开始时间
    straightScoreLeft:number = 0;//连杀判定
    straightScoreStack:any = [];//history [{left,right}]
    straightScoreRight:number = 0;//连杀判定
    playerInfoArr:PlayerInfo[] = new Array(8);
    playerRecArr:any = [];
    _timer:number = 0;
    static GAME_STATE_ING = 0;
    static GAME_STATE_FIN = 1;
    static GAME_STATE_SAVE = 2;
    gameState:number = 0;//0 未确认胜负 1 确认胜负未录入数据 2确认胜负并录入数据
    unLimitScore:number = 0;///
    mvpPlayerId:number;

    _winTeam:TeamInfo;
    _loseTeam:TeamInfo;

    constructor(gameDoc?:any) {
        if (gameDoc) {
            setPropTo(gameDoc, this);
            var playerDocArr = this.playerInfoArr;
            this.playerInfoArr = [];
            for (var i = 0; i < playerDocArr.length; i++) {
                this.playerInfoArr.push(new PlayerInfo(playerDocArr[i]));
            }
        }
    }

    getAvgEloScore() {
        var sum = 0;
        var count = 0;
        var leftPlayerArr = this.getLeftTeam();
        for (var i = 0; i < leftPlayerArr.length; i++) {
            var obj:PlayerInfo = leftPlayerArr[i];
            if (obj) {
                count++;
                sum += obj.eloScore();
            }
        }
        var left = Math.floor(sum / count);
        sum = 0;
        count = 0;
        var playerArr = this.getRightTeam();
        for (var i = 0; i < playerArr.length; i++) {
            var obj:PlayerInfo = playerArr[i];
            if (obj) {
                count++;
                sum += obj.eloScore();
            }
        }
        var right = Math.floor(sum / count);

        return {left: left, right: right};
    }

    addLeftScore() {
        if (this.unLimitScore === 1)
            this.leftScore += 1;
        else
            this.leftScore = (this.leftScore + 1) % (this.winScore + 1);
        // cmd.emit(CommandId.addLeftScore, this.gameInfo.leftScore, this.pid);

        this.pushStraightScore()

        this.straightScoreRight = 0;
        this.straightScoreLeft++;
        if (this.leftScore == 0)
            this.straightScoreLeft = 0;

        return this.straightScoreLeft;
        // cmd.emit(CommandId.straightScore5, {team: "left"}, this.pid);
    }

    minLeftScore() {
        if (this.unLimitScore === 1)
            this.leftScore -= 1;
        else
            this.leftScore = (this.leftScore - 1) % (this.winScore + 1);

        this.popStraightScore()
    }

    pushStraightScore() {
        this.straightScoreStack.push({left: this.straightScoreLeft, right: this.straightScoreRight})
    }

    popStraightScore() {
        var stack = this.straightScoreStack.pop()
        this.straightScoreLeft = stack.left
        this.straightScoreRight = stack.right
    }

    minRightScore() {
        if (this.unLimitScore === 1)
            this.rightScore -= 1;
        else
            this.rightScore = (this.rightScore - 1) % (this.winScore + 1);

        this.popStraightScore()
    }

    addRightScore() {
        if (this.unLimitScore === 1)
            this.rightScore += 1;
        else
            this.rightScore = (this.rightScore + 1) % (this.winScore + 1);
        // cmd.emit(CommandId.addRightScore, this.rightScore, this.pid);

        this.pushStraightScore()

        this.straightScoreLeft = 0;
        this.straightScoreRight++;

        if (this.rightScore == 0)
            this.straightScoreRight = 0;

        return this.straightScoreRight;
        // if (this.gameInfo.straightScoreRight == 3)
        //     cmd.emit(CommandId.straightScore3, {team: "right"}, this.pid);
        // if (this.gameInfo.straightScoreRight == 5)
        //     cmd.emit(CommandId.straightScore5, {team: "right"}, this.pid);
    }

    getGameId() {
        return this.id;
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

    get isFinish() {
        return this.gameState === GameInfo.GAME_STATE_SAVE;
    }

    resetTimer() {
        clearInterval(this._timer);
        this._timer = 0;
        this.timerState = 0;
    }

    setPlayerInfoByIdx(pos, playerInfo:PlayerInfo) {
        playerInfo.isBlue = (pos < 4);
        playerInfo.isRed = !playerInfo.isBlue;
        this.playerInfoArr[pos] = playerInfo;
        return playerInfo;
    }

    setWinByMvpIdx(mvpIdx):TeamInfo {
        var isBlueWin = (mvpIdx < 4);
        this.mvpPlayerId = this.playerInfoArr[mvpIdx].id();
        if (isBlueWin) {
            return this.setLeftTeamWin();
        }
        else {
            return this.setRightTeamWin();
        }
    }

    _setGameResult(isLeftWin):TeamInfo {
        if (this.gameState === 0) {
            var teamLeft = new TeamInfo();
            teamLeft.setPlayerArr(this.getLeftTeam());

            var teamRight = new TeamInfo();
            teamRight.setPlayerArr(this.getRightTeam());

            if (isLeftWin) {
                teamLeft.beat2(teamRight, this.mvpPlayerId);
                this._winTeam = teamLeft;
                this._loseTeam = teamRight;
            }
            else {
                teamRight.beat2(teamLeft, this.mvpPlayerId);
                this._winTeam = teamRight;
                this._loseTeam = teamLeft;
            }
            // console.log("playerData", JSON.stringify(this.playerDataArr));
            this.gameState = 1;
        }
        return this._winTeam;
    }

    getGameDoc() {
        return {}
    }

    setLeftTeamWin():TeamInfo {
        return this._setGameResult(true);
    }

    setRightTeamWin():TeamInfo {
        return this._setGameResult(false);
    }

    getLeftTeam(start = 0) {
        var team = [];
        for (var i = start; i < 4 + start; i++) {
            var pInfo = this.playerInfoArr[i];
            team.push(pInfo);
            pInfo.isRed = (start > 0)
        }
        return team;
    }

    get isBlueWin() {
        return this.leftScore > this.rightScore;
    }

    getRightTeam() {
        return this.getLeftTeam(4);
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