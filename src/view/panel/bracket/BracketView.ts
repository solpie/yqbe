import {VueEx, Component} from "../../VueEx";
import {matchview} from "./MatchView";
class PlayerSvg {
    seed: number;//八强排位
    name: string;//
    score: number;//
}
class MatchSvg {
    x: number;
    y: number;
    round: number;
    idx: number;//场次
    playerSvgArr: Array<PlayerSvg>;

    constructor() {
        this.playerSvgArr = [new PlayerSvg, new PlayerSvg];
    }
}

@Component({
    template: require('./bracket2.html'),
    components: {matchview},
    props: {
        matchArr: {}
    }
})
export class BracketView extends VueEx {
    matchArr: Array<any>;

    ready() {
        this.matchArr = [];
        for (var i = 0; i < 4; i++) {
            var ms: any = {}// new MatchSvg();
            ms.x = 0;
            ms.y = 35 + 54 * i;
            this.matchArr.push(new MatchSvg());
        }
    }
}