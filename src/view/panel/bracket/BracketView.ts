import {Component} from "../../VueEx";
import {matchsvg} from "./match-svg";
import {BasePanelView} from "../BasePanelView";
import {PanelId} from "../../../event/Const";
import {CommandId} from "../../../event/Command";
import {MatchSvg} from "../../../model/BracketInfo";

@Component({
    template: require('./bracket2.html'),
    components: {matchsvg},
    props: {
        matchArr: {}
    },
    watch: {
        matchArr: 'onMatchArrChanged'
    }
})
export class BracketView extends BasePanelView {
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
        var io = super.ready(PanelId.stage1v1Panel, false);

        io
            .on(`${CommandId.initPanel}`, (param) => {
                console.log(`${CommandId.initPanel}`, param);
                this.updateBracket(param.matchArr);
            })
            .on(`${CommandId.refreshClient}`, (param)=> {
                console.log('refresh bracket', param);
                this.updateBracket(param.matchArr);
            });
    }

    updateBracket(matchArr) {
        for (var j = 0; j < 14; j++) {
            var match: MatchSvg = matchArr[j];
            for (var k = 0; k < 2; k++) {
                var playerSvg = match.playerSvgArr[k];
                var $playerSvg = $('#playerName' + (j * 2 + k));
                $playerSvg.text(playerSvg.name);
                if (playerSvg.isHint) {
                    console.log('player name isHint');
                    $playerSvg.attr('class', 'match--player-name -placeholder')
                } else {
                    $playerSvg.attr('class', 'match--player-name2');
                    if (playerSvg.name && playerSvg.name.length > 6) {
                        $playerSvg.attr('class', 'match--player-name3')
                    }
                }

                if (playerSvg.isWin) {
                    $('#winner' + (j * 2 + k)).show();
                    // match--winner-background
                }
                else {
                    $('#winner' + (j * 2 + k)).hide();
                }
                $('#score' + (j * 2 + k)).text(playerSvg.score);
            }
        }
    }

    onMatchArrChanged(v) {
        console.log('onMatchArrChanged', v)
    }
}