import {VueEx, Component} from "../../VueEx";
import {matchsvg} from "./match-svg";
class PlayerSvg {
    name: string = "player 2";//
    score: number = 4;//
}
export class MatchSvg {
    x: number;
    y: number;
    round: number;
    idx: number;//场次
    playerSvgArr: Array<PlayerSvg>;

    constructor() {
        this.playerSvgArr = [new PlayerSvg, new PlayerSvg];
        this.playerSvgArr[0].score = 1;
        this.playerSvgArr[1].score = 4;
    }
}

@Component({
    template: require('./bracket2.html'),
    components: {matchsvg},
    props: {
        matchArr: {}
    }
})
export class BracketView extends VueEx {
    matchArr: Array<any>;

    ready() {
        this.matchArr = [];
        for (var i = 0; i < 14; i++) {
            var ms: MatchSvg = new MatchSvg();// new MatchSvg();
            ms.idx = i + 1;
            this.matchArr.push(ms);
        }
        var matchArr = this.matchArr;
        var setMatchPos = function (idx, x, y) {
            matchArr[idx].x = x;
            matchArr[idx].y = y;
        };

        var i: number;
        var ms: MatchSvg;
        for (i = 0; i < 4; i++) {
            ms = matchArr[i];
            ms.x = 0;
            ms.y = 35 + 160 * i;
        }
        // 5 6
        for (i = 0; i < 2; i++) {
            ms = matchArr[i + 4];
            ms.x = 0;
            ms.y = 760 + 160 * i
        }
        // 7 8
        var col2x = 400;
        for (i = 0; i < 2; i++) {
            ms = matchArr[i + 6];
            ms.x = col2x;
            ms.y = 115 + 320 * i
        }
        // 9 10
        setMatchPos(8, col2x, 700 + 160);
        setMatchPos(9, col2x, 700);
        var col3x = col2x * 2;
        //  11
        setMatchPos(10, col3x, 280);
        // 12
        setMatchPos(11, col3x, 780);
        var col4x = col2x * 3;
        //  13
        setMatchPos(12, col4x, 730);
        // 14
        setMatchPos(13, col4x, 345);
    }
}