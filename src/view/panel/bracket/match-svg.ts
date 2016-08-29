import {Component} from "../../VueEx";
import {MatchSvg} from "./BracketView";
@Component({
    template: require('./match.html'),
    props: {
        playerArr: {},
        idx: {},
        x: {},
        y: {},
        match: {}
    }
})
export class matchsvg {
    playerArr: Array<any>;
    idx: number;
    match: MatchSvg;
    x: number;
    y: number;

    ready() {
        this.idx = 2;
        this.playerArr = [
            {name: "player1", score: 1},
            {name: "player2", score: 3, isWin: true}
        ];
        this.x = this.match.x;
        this.y = this.match.y;
        this.idx = this.match.idx;
        this.playerArr = this.match.playerSvgArr;
        if (this.playerArr[0].score && this.playerArr[1].score) {
            if (this.playerArr[0].score > this.playerArr[1].score)
                this.playerArr[0].isWin = true;
            else
                this.playerArr[1].isWin = true;
        }

        // for (var i = 0; i < this.playerArr.length; i++) {
        //     var player = this.playerArr[i];
        //     if (player.score) {
        //
        //     }
        //     // player.isWin =
        // }
        console.log('match ready', this.match);
    }
}