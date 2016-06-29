import {_path} from "../../Env";
import {BaseXLSX} from "./BaseXLSX";
import {PlayerInfo} from "../PlayerInfo";
import {EloUtil, EloConf} from "../../utils/EloUtil";
import {db} from "../DbInfo";
var XLSX = require('xlsx');
class PlayerXLSX extends BaseXLSX {
    id:string;
    userName:string;
    phone:number;
    playerInfo:PlayerInfo;

    constructor(sheet, row) {
        super(sheet, row);
        if (!this.isEmpty) {
            this.userName = this.col('A').v;
            this.phone = this.col('B').v;
            this.id = this.col('C').v;
            this.playerInfo = new PlayerInfo();
            this.playerInfo.eloScore(EloConf.score);
            this.playerInfo.name(this.userName);
            this.playerInfo.phone(this.phone);
        }
    }

    static getData(xlsxPath) {
        var playerMap:any = {};

        var playerWB = XLSX.readFile(xlsxPath);
        var playerSheet = playerWB.Sheets['Sheet4'];
        // var playerXLSXArr:PlayerXLSX[] = [];
        var countPlayer = 0;
        for (var i = 2; ; i++) {
            var playerXLSX:PlayerXLSX = new PlayerXLSX(playerSheet, i);
            if (!playerXLSX.isEmpty) {
                playerMap[playerXLSX.id] = playerXLSX;
                // playerXLSXArr.push(playerXLSX);
                if (i < 10) {
                    console.log(playerXLSX);
                }
                countPlayer++;
            }
            else
                break;
        }
        console.log('player count:', countPlayer);
        return playerMap;
    }
}
class Team {
    id:string;
    playerIdArr:string[] = [];
    playerInfoArr:PlayerInfo[] = [];
    isFake:boolean = false;//找不到playerid

    beat(loseTeam:Team) {
        if (!this.isFake) {
            var winScore = EloUtil.classicMethod(this.teamEloScore(), loseTeam.teamEloScore());
            this.saveScore(winScore, true);
            loseTeam.saveScore(-winScore, false);
        }
    }

    saveScore(dtScore:number, isWin:boolean) {
        for (var i = 0; i < this.playerInfoArr.length; i++) {
            var playerInfo:PlayerInfo = this.playerInfoArr[i];
            playerInfo.eloScore(playerInfo.eloScore() + dtScore);
            if (isWin) {
                playerInfo.winGameCount(playerInfo.winGameCount() + 1);
            }
            else {
                playerInfo.loseGameCount(playerInfo.loseGameCount() + 1);
            }
            // if (playerInfo.gameCount() > 0) {
            //     console.log('saveScore', playerInfo.name());
            // }
        }
    }

    teamEloScore() {
        var teamEloScore = 0;
        for (var i = 0; i < this.playerInfoArr.length; i++) {
            var playerInfo:PlayerInfo = this.playerInfoArr[i];
            teamEloScore += playerInfo.eloScore();
        }
        return Math.floor(teamEloScore / this.playerInfoArr.length);
    }

}
class Game_PlayersXLSX extends BaseXLSX {
    gameId:string;
    teamId:string;
    playerId:string;

    constructor(sheet, row) {
        super(sheet, row);
        if (!this.isEmpty) {
            this.gameId = this.col('A').v;
            this.teamId = this.col('B').v;
            this.playerId = this.col('C').v;
        }
    }

    static getData(xlsxPath, playerMap:any) {
        var teamMap:any = {};

        var wb = XLSX.readFile(xlsxPath);
        var sheet = wb.Sheets['Sheet4'];
        // var xlsxArr:Game_PlayersXLSX[] = [];
        for (var i = 2; ; i++) {
            var xlsxObj:Game_PlayersXLSX = new Game_PlayersXLSX(sheet, i);
            if (!xlsxObj.isEmpty) {
                if (!teamMap[xlsxObj.teamId]) {
                    teamMap[xlsxObj.teamId] = new Team();
                }
                var team:Team = teamMap[xlsxObj.teamId];
                team.id = xlsxObj.teamId;
                team.playerIdArr.push(xlsxObj.playerId);
                if (!playerMap[xlsxObj.playerId]) {
                    team.isFake = true;
                    console.warn(`no player map data ${xlsxObj.playerId} ,teamId${xlsxObj.teamId}`);
                }
                else {
                    team.playerInfoArr.push(playerMap[xlsxObj.playerId].playerInfo);
                }
                if (i < 10) {
                    console.log(xlsxObj);
                }
            }
            else
                break;
        }
        return teamMap;
    }
}
class GameXLSX extends BaseXLSX {
    gameId:string;
    date:number;
    homeTeamId:string;
    guestTeamId:string;
    homeTeamScore:number;
    guestTeamScore:number;
//
    id:string;

    constructor(sheet, row) {
        super(sheet, row);
        if (!this.isEmpty) {
            this.gameId = this.col('A').v;
            this.date = this.col('B').v;
            this.homeTeamId = this.col('C').v;
            this.guestTeamId = this.col('D').v;
            this.homeTeamScore = this.col('E').v;
            this.guestTeamScore = this.col('F').v;
            this.id = this.gameId;
        }
    }

    static getData(xlsxPath) {
        var gameWB = XLSX.readFile(xlsxPath);
        var gameSheet = gameWB.Sheets['Sheet4'];
        var gameXLSXArr:GameXLSX[] = [];
        for (var i = 2; ; i++) {
            var gameXLSX:GameXLSX = new GameXLSX(gameSheet, i);
            if (!gameXLSX.isEmpty) {
                gameXLSXArr.push(gameXLSX);
                if (i < 10) {
                    console.log(gameXLSX);
                }
            }
            else
                break;
        }
        console.log('game count:', gameXLSXArr.length);
        return gameXLSXArr;
    }
}
export class ExternalInfo {
    playerInfoMap:any;
    isInit:boolean = false;

    constructor() {
    }

    setupHuitiDB() {
        if (this.isInit)
            return this.playerInfoMap;
        this.isInit = true;
        //playerXLSX
        var playerMap:any = PlayerXLSX.getData(_path('app/db/xlsx/player.xlsx'));
        var teamMap:any = Game_PlayersXLSX.getData(_path('app/db/xlsx/game_players.xlsx'), playerMap);

        db.gameHuiTi.ds().find({$not: {id: 0}})
            .sort({date: -1})
            .exec((err, docs) => {
                for (var key in db.gameHuiTi.dataMap) {
                    var gameXLSX:GameXLSX = db.gameHuiTi.dataMap[key];
                    var homeTeam:Team = teamMap[gameXLSX.homeTeamId];
                    var guestTeam:Team = teamMap[gameXLSX.guestTeamId];
                    if (Number(gameXLSX.homeTeamScore) > Number(gameXLSX.guestTeamScore)) {
                        homeTeam.beat(guestTeam);
                    }
                    else
                        guestTeam.beat(homeTeam);
                }

                var playerInfoMap:any = {};
                var playerInfoCount = 0;
                var playerDocArr = [];
                for (var key in playerMap) {
                    var playerXLSX:PlayerXLSX = playerMap[key];
                    if (playerXLSX.playerInfo.gameCount() > 0) {
                        playerInfoCount++;
                        playerInfoMap[playerXLSX.id] = playerXLSX.playerInfo;
                        // playerDocArr.push(playerXLSX.playerInfo.playerData);
                    }
                }
                this.playerInfoMap = playerInfoMap;
                // db.playerHuiTi.ds().insert(playerDocArr);
                console.log('playerInfo map count:', playerInfoCount);
                return this.playerInfoMap;
            });
    }

    static importHuiTi() {
        var gameXLSXArr:GameXLSX[] = GameXLSX.getData(_path('app/db/xlsx/game.xlsx'));
        var playerMap:any = PlayerXLSX.getData(_path('app/db/xlsx/player.xlsx'));
        var teamMap:any = Game_PlayersXLSX.getData(_path('app/db/xlsx/game_players.xlsx'), playerMap);


        var gameXLSXavailble = [];
        for (var i = 0; i < gameXLSXArr.length; i++) {
            var gameXLSX:GameXLSX = gameXLSXArr[i];
            var homeTeam:Team = teamMap[gameXLSX.homeTeamId];
            var guestTeam:Team = teamMap[gameXLSX.guestTeamId];
            if (homeTeam && guestTeam) {
                if (homeTeam.isFake || guestTeam.isFake) {
                    gameXLSX.isFake = true;
                    continue;
                }
                // console.log("homeTeam", homeTeam, homeTeam.teamEloScore(), 'guestTeam', guestTeam, guestTeam.teamEloScore());
                if (gameXLSX.homeTeamScore > gameXLSX.guestTeamScore) {
                    homeTeam.beat(guestTeam);
                }
                else
                    guestTeam.beat(homeTeam);
                // console.log("homeTeam", homeTeam.teamEloScore(), 'guestTeam', guestTeam.teamEloScore());
                var gameDoc = {
                    id: gameXLSX.id,
                    date: gameXLSX.date,
                    homeTeamId: gameXLSX.homeTeamId,
                    guestTeamId: gameXLSX.guestTeamId,
                    homeTeamScore: gameXLSX.homeTeamScore,
                    guestTeamScore: gameXLSX.guestTeamScore,
                };
                gameXLSXavailble.push(gameDoc);
                // db.gameHuiTi.ds().insert(gameDoc);
                // db.gameHuiTi.upsert(gameXLSX);
            }
            else {
                gameXLSX.isFake = true;
            }
        }

        db.gameHuiTi.ds().insert(gameXLSXavailble, function (err, doc) {
            console.log('hui ti data import complete!!');
        });
        // function upsert(idx) {
        //     if (idx < gameXLSXavailble.length)
        //         db.gameHuiTi.ds().insert(gameXLSXavailble[idx], function () {
        //             upsert(idx++);
        //         });
        // }

        // upsert(0);

        console.log('gameXLSXavailble', gameXLSXavailble.length);
    }
}