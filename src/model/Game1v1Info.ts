import {PlayerInfo} from "./PlayerInfo";
export class Game1v1Info {
    id:number;
    blueScore:number;
    redScore:number;
    playerInfoArr:PlayerInfo[] = new Array(2);
    index:number;//场次
    winScore:number = 2;

    constructor() {

    }

    addBlueScore() {
        this.blueScore = (this.blueScore + 1) % (this.winScore + 1);
    }

    addRedScore() {
        this.redScore = (this.redScore + 1) % (this.winScore + 1);
    }

    setPlayerInfoByIdx(pos, playerInfo:PlayerInfo) {
        playerInfo.isBlue = (pos < 4);
        this.playerInfoArr[pos] = playerInfo;
        return playerInfo;
    }

    setGameResult(isBlueWin:boolean) {
        if (isBlueWin) {

        }
        else {

        }
    }
}