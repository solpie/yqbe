import {PlayerDoc} from "./PlayerInfo";
export class FTInfo {
    id: number;
    name: string;
    fullName:string;
    logo: string;
    score: number;
    lastScore: number;//本轮积分
    memberArr: Array<PlayerDoc>;

    constructor() {
        this.memberArr = [];
    }
}