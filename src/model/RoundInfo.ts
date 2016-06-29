import {GameInfo} from "./GameInfo";
export class RoundInfo {
    static HIGH_SECTION:string = 'high';
    static LOW_SECTION:string = 'low';
    date:number;//比赛日
    gameInfoArr:Array<GameInfo>;
    id:number;
    section:number;

    constructor() {
        this.gameInfoArr = [];
    }

    getGameInfoById(id) {
        for (var gameData of this.gameInfoArr) {
            if (gameData.id === id)
                return gameData;
        }
        return null;
    }
    
    

   
}