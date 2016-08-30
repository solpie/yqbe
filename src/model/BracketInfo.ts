class PlayerSvg {
    seed: number;//八强排位
    name: string;//
    avatar: string;//
    isHint:boolean = false;
    isWin:boolean = false;
    score: number = 0;//
}
export class MatchSvg {
    x: number;
    y: number;
    round: number;
    idx: number;//场次
    playerSvgArr: Array<PlayerSvg>;

    constructor(x=0, y=0, idx=0) {
        this.x = x;
        this.y = y;
        this.idx = idx;
        this.playerSvgArr = [new PlayerSvg, new PlayerSvg];
    }
}