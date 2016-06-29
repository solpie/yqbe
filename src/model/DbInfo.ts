import {PlayerInfo} from "./PlayerInfo";
import {_path} from "../Env";
import {descendingProp} from "../utils/JsFunc";
import {EloConf} from "../utils/EloUtil";
import {ExternalInfo} from "./external/ExternalInfo";
import {GameInfo} from "./GameInfo";
import {TeamInfo} from "./TeamInfo";
export var db:any;
var Datastore = require('nedb');

export class BaseDB {
    dataStore:any;
    config:any;
    dbPath:string;
    dataMap:any;
    indexName:string = 'id';

    constructor(option) {
        this.dbPath = option.filename;
        if (option.indexName) {
            this.indexName = option.indexName;
        }
        this.dataStore = new Datastore(option);
        this.dataStore.find({id: 0}, (err, docs) => {
            console.log('load config', this.dbPath);
            if (!err) {
                if (docs.length)
                    this.config = docs[0];
                else
                    this.init();
            }
        });
        this.syncDataMap();
        this.onloaded();
    }

    syncDataMap(callback?:any) {
        this.dataStore.find({$not: {id: 0}}, (err:any, docs:Array<any>)=> {
            this.dataMap = {};
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                this.dataMap[doc[this.indexName]] = doc;
            }
            if (callback)
                callback();
        });
    }

    getDataById(id) {
        return this.dataMap[id];
    }

    getDocArrByIdArr(idArr:number[]) {
        var a = [];
        for (var id of idArr) {
            a.push(this.dataMap[id]);
        }
        return a;
    }

    onloaded() {
    };

    init() {
        this.dataStore.insert({id: 0, idUsed: 1}, (err, newDoc) => {
            console.log('onload inti db config');
            console.log(this, JSON.stringify(newDoc));
            this.config = newDoc;
        });
    }

    saveIdUsed() {
        this.config.idUsed++;
        this.dataStore.update({id: 0}, {$set: this.config});
        return this.config.idUsed;
    };

    getIdNew() {
        return this.config.idUsed;
    }

    ds() {
        return this.dataStore;
    }

    create(doc, callback?) {
        this.ds().insert(doc, (err, newDoc)=> {
            if (!err) {
                this.saveIdUsed();
                this.syncDataMap(function () {
                    if (callback)
                        callback(err, newDoc);
                });
            }
            else
                throw err;
        });
    }

    remove(queryOption, callback?) {
        this.ds().remove(queryOption, {}, (err, numRemoved)=> {
            if (!err)
                this.syncDataMap(function () {
                    if (callback)
                        callback(err, numRemoved);
                });
            else
                throw  err;
        });
    }

    // upsert(queryOption, callback?) {
    //     this.ds().update(queryOption, doc, {upsert: true}, (err, newDoc) => {
    //         if (callback)
    //             callback(err, newDoc);
    //         // this.syncDataMap(callback);
    //     });
    // }

    getDocArr(idArr) {
        var a = [];
        for (var id of idArr) {
            a.push(this.dataMap[id]);
        }
        return a;
    }
}

class ActivityDB extends BaseDB {
    // addRound(data, callback) {
    //     data.round = this.config.idUsed;
    //     this.dataStore.insert(data, (err, newDoc) => {
    //         if (!err) {
    //             var newId = this.saveIdUsed();
    //         }
    //         if (callback)
    //             callback(err, newDoc);
    //     })
    // }


    getGameIdBase(roundId) {
        return roundId * 1000;
    }

    getCurRound(callback) {
        this.dataStore.find({$not: {id: 0}})
            .sort({round: -1})
            .exec(function (err, docs) {
                callback(err, docs);
            });
    }

    removeGame(gameId, callback) {
        var isFind = false;
        for (var k in this.dataMap) {
            var actDoc = this.dataMap[k];
            for (var i = 0; i < actDoc.gameDataArr.length; i++) {
                var gameDoc = actDoc.gameDataArr[i];
                console.log('act gameId', gameDoc.id, gameId);
                if (gameDoc.id == gameId) {
                    actDoc.gameDataArr.splice(i, 1);
                    isFind = true;
                    this.ds().update({_id: actDoc._id}, actDoc, {upsert: true}, (err, newDoc) => {
                        this.syncDataMap();
                        if (err)
                            callback(false);
                        else
                            callback(true);
                    });
                    break;
                }
            }
            if (isFind)
                break;
        }
    }

    addGame(activityId, roundId, playerIdArr, section, callback?) {
        this.ds().findOne({round: roundId}, (err, doc) => {
            // this.ds().findOne({activityId: activityId, $and: {round: roundId}}, (err, doc) => {
            console.log("findOne:", JSON.stringify(err), doc);
            if (doc && doc.activityId === activityId) {
                if (!doc.gameDataArr)
                    doc.gameDataArr = [];

                var gameData:any = {};
                gameData.id = this.getGameIdBase(roundId) + doc.gameDataArr.length + 1;
                gameData.playerIdArr = playerIdArr;
                gameData.section = section;
                doc.gameDataArr.push(gameData);
                console.log("update Round Data:", JSON.stringify(doc.gameDataArr.length));
                this.ds().update({round: roundId}, doc, {}, (newNum) => {
                    console.log("addGame:", newNum);
                    this.syncDataMap();
                    if (callback)
                        callback(true);
                });
            }
            else {
                console.log("no activity:", activityId, "round:", roundId);
                if (callback)
                    callback(false)
            }
        })
    }

    getGameDocByGameId(gameId) {
        for (var k in this.dataMap) {
            var roundDoc = this.dataMap[k];
            for (var i = 0; i < roundDoc.gameDataArr.length; i++) {
                var gameDoc = roundDoc.gameDataArr[i];
                if (gameDoc.id == gameId)
                    return gameDoc;
            }

        }
        return null;
    }

    getDataByRound(roundId, callback) {
        this.ds().findOne({round: roundId}, (err, doc)=> {
            callback(err, doc);
        });
    }

    getActivityPlayerIdArr() {

    }

    getDateArrByActivityId(actId, callback) {
        this.dataStore.find({activityId: actId}, function (err, docs) {
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                for (var j = 0; j < doc.gameDataArr.length; j++) {
                    var gameId = doc.gameDataArr[j].id;
                    var gameData = db.game.getDataById(gameId);
                    if (gameData)//换人的数据同步
                    {
                        doc.gameDataArr[j].playerIdArr = gameData.playerIdArr.concat();
                    }
                }
            }
            callback(docs);
        });
    }

}
class GameDB extends BaseDB {
    startGame(gameData) {
        this.ds().update({id: gameData.id}, gameData, {upsert: true}, (err, newDoc) => {
            this.syncDataMap();
        });
    }

    restartGame(gameId, callback = null) {
        var gameDoc = this.dataMap[gameId];
        if (gameDoc) {
            gameDoc.isFinish = false;
            this.ds().update({id: gameDoc.id}, gameDoc, {upsert: true}, (err, newDoc) => {
                this.syncDataMap(callback);
            });
        }
    }

    isGameFinish(gameId) {
        var gameDataInDb = this.dataMap[gameId];
        return gameDataInDb && gameDataInDb.isFinish;
    }

    /*
     开始比赛之后换人
     */
    updatePlayerByPos(gameId, pos, playerId) {//开始比赛之后换人
        if (!this.isGameFinish(gameId)) {
            this.ds().findOne({id: gameId}, (err, doc)=> {
                if (doc) {
                    var oldPlayerId = doc.playerIdArr[pos];
                    doc.playerIdArr[pos] = playerId;
                    this.ds().update({id: gameId}, {$set: doc}, {}, ()=> {
                        console.log('updatePlayerByPos', oldPlayerId, "=>", playerId);
                        this.syncDataMap();
                    });
                }
            });
        }
        else {
            console.log('closed game can not modify!!!', gameId);
        }
    }

    submitGame(gameId, isBlueWin, mvp, blueScore, redScore, playerRecArr, callback) {
        this.ds().findOne({id: gameId}, (err, docs)=> {
            var doc = docs;
            if (doc.isFinish) {
                console.log('closed game can not modify!!!', doc.id);
                callback(false);
            }
            else {
                doc.blueScore = blueScore;
                doc.redScore = redScore;
                doc.isFinish = true;
                doc.mvp = mvp;
                doc.playerRecArr = playerRecArr;
                doc.isBlueWin = isBlueWin;
                doc.isRedWin = !isBlueWin;
                console.log('update game data:', JSON.stringify(doc));
                this.ds().update({id: gameId},
                    {$set: doc}, {upsert: true}, (err, numUpdate)=> {
                        console.log('submitGame:', gameId, JSON.stringify(numUpdate));
                        this.syncDataMap();
                        callback(true);
                    });
            }
        })
    }

    saveGameRecToPlayer(gameInfo:GameInfo, callback) {
        var gameId = gameInfo.id;
        // if (this.isUnsaved) {
        // if (this.gameState === GameInfo.GAME_STATE_ING) {
        //     if (isRedWin)
        //         this.setRightTeamWin();
        //     else
        //         this.setLeftTeamWin();
        // }
        function saveGameDb() {
            var playerRecArr = [];
            for (var i = 0; i < gameInfo.playerInfoArr.length; i++) {
                var newPlayerInfo = gameInfo.playerInfoArr[i];
                // var newPlayerInfo:PlayerInfo = new PlayerInfo(db.player.getDataById(playerData.id));
                playerRecArr.push(newPlayerInfo.getRec());
                console.log("push rec", JSON.stringify(newPlayerInfo.getRec()));
            }
            db.game.submitGame(gameInfo.id, gameInfo.isBlueWin, gameInfo.mvpPlayerId, gameInfo.leftScore, gameInfo.rightScore, playerRecArr, (isSus)=> {
                if (isSus) {
                    console.log("submit Game sus");
                }
                else {
                    console.log("submit Game failed!!");
                }
            })
        }

        if (gameInfo.gameState < GameInfo.GAME_STATE_SAVE) {
            var saveTeamPlayerData = (teamInfo:TeamInfo)=> {
                for (var playerInfo of teamInfo.playerInfoArr) {
                    console.log("playerData", JSON.stringify(playerInfo));
                    if (!playerInfo.gameRec())
                        playerInfo.gameRec([]);
                    playerInfo.gameRec().push(gameId);
                    console.log(playerInfo.name(), " cur player score:", playerInfo.eloScore(), playerInfo.dtScore());
                    db.player.ds().update({id: playerInfo.id()}, {$set: playerInfo.playerData}, {}, (err, doc)=> {
                        savePlayerCount--;
                        console.log("saveGameRecToPlayer:", savePlayerCount);
                        if (savePlayerCount === 0) {
                            console.log("change game state 2 and callback");
                            saveGameDb();
                            gameInfo.gameState = GameInfo.GAME_STATE_SAVE;
                            db.player.syncDataMap(callback);
                        }
                    });


                }
            };

            var savePlayerCount = 8;
            saveTeamPlayerData(gameInfo._winTeam);
            saveTeamPlayerData(gameInfo._loseTeam);


        }
    }
}
class PlayerDB extends BaseDB {
    clearGameDataByPlayerId(playerId) {
        var playerData = this.dataMap[playerId];
        if (playerData) {
            playerData.eloScore = EloConf.score;
            playerData.winpercent = 0;
            playerData.gameCount = 0;
            playerData.loseGameCount = 0;
            playerData.winGameCount = 0;
            playerData.gameRec = [];
            this.ds().update({id: playerId},
                {$set: playerData}, {}, (err, numUpdate)=> {
                    console.log("clearGameDataByPlayerId", playerId);
                    this.syncDataMap();
                });
        }
    }

    clearGameDataByPlayerAll() {
        console.log('clearGameDataByPlayerAll');
        for (var key in this.dataMap) {
            var playerId = parseInt(key);
            this.clearGameDataByPlayerId(playerId);
        }
    }

    getRankPlayerArr(actId, limit, callback) {
        this.dataStore.find({$not: {id: 0}, activityId: actId})
            .sort({eloScore: -1})
            .limit(limit)
            .exec(function (err, docs) {
                callback(err, docs);
            });
    }

    getActivityPlayerDataArr(actId, callback) {
        this.dataStore.find({$not: {id: 0}, activityId: actId})
            .sort({eloScore: -1})
            .exec(function (err, docs) {
                callback(err, docs);
            });
        // this.dataStore.find({$not: {id: 0}, activityId: actId}).sort({eloScore: 1}).exec(function (err, docs) {
        //     callback(err, docs);
        // });

    }

    getPlayerRank(playerIdArr:number[]) {
        var playerDocArr = [];
        for (var i = 0; i < playerIdArr.length; i++) {
            var playerId = playerIdArr[i];
            var playerDoc = this.dataMap[playerId];
            if (playerDoc) {
                playerDocArr.push(playerDoc);
            }
        }
        //ascending
        playerDocArr.sort(descendingProp('eloScore'));
        return playerDocArr;
    }

    getPlayerIdArrRank(playerIdArr:number[]):number[] {
        var playerDocArr = this.getPlayerRank(playerIdArr);
        var a = [];
        for (var playerDoc of playerDocArr) {
            a.push(playerDoc.id);
        }
        return a;
    }

    getPlayerDataMapByIdArr(idArr, callback) {
        this.dataStore.find({'$or': idArr}, function (err, docs) {
            var playerIdMap:any = {};
            for (var playerData of docs) {
                playerIdMap[playerData.id] = playerData;
            }
            callback(err, playerIdMap);
        });
    }

    onloaded() {
        super.onloaded();
        // this.dataStore.find({$not: {id: 0}}).sort({eloScore: 1}).exec(function (err, docs) {
        //     callback(err, docs);
        // });
    }

    fillPlayerInfo(playerIdArr, dataContainer, callback) {
        this.getPlayerDataMapByIdArr(playerIdArr, function (err, playerIdMap) {
            dataContainer.playerInfoMap = {};
            for (var i = 0; i < playerIdArr.length; i++) {
                var playerId = playerIdArr[i];
                dataContainer.playerInfoMap[playerId] = new PlayerInfo(playerIdMap[playerId]);
            }
            console.log('fillPlayerInfo');
            callback();
        });
    }

    getPlayerInfoById(id) {
        var playerDoc = this.dataMap[id];
        if (playerDoc)
            return new PlayerInfo(playerDoc);
        return null;
    }

    getPlayerArrEloScore(playerIdArr:number[]) {
        var sum = 0;
        for (var playerId of playerIdArr) {
            sum += this.dataMap[playerId].eloScore;
        }
        return sum;
    }
}

export function initDB() {
// Fetch a collection to insert document into
    var playerDb:string = _path('app/db/player.db');
    var activityDb:string = _path('app/db/activity.db');
    var gameDbPath:string = _path('app/db/game.db');

    var huitiDbPath:string = _path('app/db/gameHuiTi.db');
    var huitiPlayerDbPath:string = _path('app/db/playerHuiTi.db');

    db = {};
    db.player = new PlayerDB({filename: playerDb, autoload: true});
    db.activity = new ActivityDB({filename: activityDb, autoload: true});
    db.game = new GameDB({filename: gameDbPath, autoload: true});
    //hui ti
    db.gameHuiTi = new BaseDB({filename: huitiDbPath, autoload: true, indexName: '_id'});
    db.playerHuiTi = new BaseDB({filename: huitiPlayerDbPath, autoload: true, indexName: '_id'});

    db.externalInfo = new ExternalInfo();
    // var ProtoBuf = require('protobufjs');
    // var builder = ProtoBuf.loadProtoFile(_path('app/proto/player.proto'));
    // var Player:any = builder.build('Player');
    // var player1 = new Player();
    // player1.encode();
    //
    // console.log("builder",player1, JSON.stringify(player1))
}