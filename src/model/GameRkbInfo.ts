import {PlayerRkbInfo} from "./PlayerRkbInfo";
export class GameRkbInfo {
    round: number = 0;
    playerRkbInfoArr: Array<PlayerRkbInfo>;

    constructor() {
        this.playerRkbInfoArr = [new PlayerRkbInfo(20), new PlayerRkbInfo(30)];
    }

}