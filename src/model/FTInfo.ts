import {PlayerDoc} from "./PlayerInfo";
export class FTInfo {
    id: number;
    name: string;
    fullName: string;
    logo: string;
    score: number;
    lastScore: number;//上一轮积分
    curScore: number;//本轮积分
    memberArr: Array<PlayerDoc>;

    constructor() {
        this.memberArr = [];
    }

    static saveScore(ftDoc,score) {
        ftDoc.score ? ftDoc.score += score : ftDoc.score = score;
        ftDoc.curScore ? ftDoc.curScore += score : ftDoc.curScore = score;
    }
}