import {RoundInfo} from "./RoundInfo";
import {BaseDoc} from "./BaseInfo";
import {mapToArr} from "../utils/JsFunc";
// declare var db;
export class ActivityDoc extends BaseDoc {
    id:number = -1;
    playerIdArr:number[] = [];//16 
    gameIdArr:number[] = [];
    date:number = -1;
}
export class ActivityInfo {
    // activityDoc:ActivityDoc;
    id:number;
    roundInfoArr:RoundInfo[];

    constructor() {
        this.roundInfoArr = [];
        // this.activityDoc = new ActivityDoc();
    }

    getRoundInfoById(id):RoundInfo {
        for (var roundInfo of this.roundInfoArr) {
            if (roundInfo.id === id)
                return roundInfo;
        }
        return null;
    }

    getActivityPlayerIdArr() {
        var playerIdMap:any = {};
        for (var roundInfo of this.roundInfoArr) {
            for (var i = 0; i < roundInfo.gameInfoArr.length; i++) {
                var gameDoc:any = roundInfo.gameInfoArr[i];
                for (var playerId of gameDoc.playerIdArr) {
                    playerIdMap[playerId] = playerId;
                }
            }
        }
        return mapToArr(playerIdMap);
    }

    getGameIdArr() {
        var gameIdArr = [];
        for (var roundInfo of this.roundInfoArr) {
            for (var i = 0; i < roundInfo.gameInfoArr.length; i++) {
                var gameDoc:any = roundInfo.gameInfoArr[i];
                gameIdArr.push(gameDoc.id);
            }
        }
        return gameIdArr;
    }

    getGameInfoById(gameId, roundId) {
        var roundInfo = this.getRoundInfoById(roundId);
        if (roundInfo)
            return roundInfo.getGameInfoById(gameId);
        return null;
    }

    addGame(gameDocArr, roundId) {
        this.getRoundInfoById(roundId).gameInfoArr = this.getRoundInfoById(roundId).gameInfoArr.concat(gameDocArr);
    }

    setPlayerIdArr(playerIdArr:number[]) {
        // if (playerIdArr.length != 16) {
        //     throw new Error('人数不满足条件')
        // }
        // else {
        //     this.activityDoc.playerIdArr = playerIdArr.concat();
        // }
    }

    /*
     加赛两场 完全高低分组队 （高分和高分组队）
     */
    createExGameInHighLowMode(playerMap) {
        // var playerDocArr = (this.activityDoc.playerIdArr);
        // var game1PlayerIdArr = playerDocArr.slice(0, 7);
        // var game2PlayerIdArr = playerDocArr.slice(8, 15);
        // console.log('game1', game1PlayerIdArr);
        // console.log('game2', game2PlayerIdArr);
    }

    /*
     混合分组
     */
    createGameInMixMode() {

    }

    static build(activityId, activityMap, gameMap) {
        var activityMap = activityMap;
        var gameMap = gameMap;
        var reBuildGameDataArr = [];
        var actInfo = new ActivityInfo();
        for (var key in activityMap) {
            var roundData = activityMap[key];
            if (roundData.activityId == activityId) {
                for (var gameData of roundData.gameDataArr) {
                    var gameDataInMap = gameMap[gameData.id];
                    if (gameDataInMap) {
                        reBuildGameDataArr.push(gameDataInMap);
                    }
                    else {
                        reBuildGameDataArr.push(gameData)
                    }
                }
                roundData.gameDataArr = reBuildGameDataArr;

                var roundInfo:RoundInfo = new RoundInfo();
                roundInfo.gameInfoArr = reBuildGameDataArr;
                roundInfo.id = roundData.round;
                roundInfo.section = roundData.section;
                actInfo.roundInfoArr.push(roundInfo);
            }
        }
        return actInfo;
    }
}