import {PlayerDoc} from "./PlayerInfo";
export class FTInfo {
    _id: string;
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

    static saveScore(ftDoc, score) {
        ftDoc.score ? ftDoc.score += score : ftDoc.score = score;
        ftDoc.curScore ? ftDoc.curScore += score : ftDoc.curScore = score;
    }

    static  clone(ftDoc) {
        var f = new FTInfo();
        f._id = ftDoc._id;
        f.id = ftDoc.id;
        f.name = ftDoc.name;
        f.fullName = ftDoc.fullName;
        f.logo = ftDoc.logo;
        f.score = ftDoc.score;
        f.curScore = ftDoc.curScore;
        return f;
    }
}