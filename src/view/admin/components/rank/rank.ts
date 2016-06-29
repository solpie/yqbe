import {VueEx, Component} from "../../../VueEx";
import {mapToArr, descendingProp} from "../../../../utils/JsFunc";
import {PlayerInfo} from "../../../../model/PlayerInfo";
@Component({
    template: require('./rank.html'),
    props: {
        playerDocArr: {
            type: Array
        }
    }
})
export class Rank extends VueEx {
    playerDocArr:Array<any>;

    ready() {
        console.log("rank");
        this.post('/db/player', {}, (data)=> {
            var playerMap = data.PlayerMap;
            this.playerDocArr = mapToArr(playerMap).sort(descendingProp('eloScore'));
            // this.playerDocArr = rank;
        });
    }

    onSortWinPercent() {
        console.log('onSortWinPercent');
    }

    onSortGameCount() {
        for (var p of this.playerDocArr) {
            p.gameCount = PlayerInfo.gameCount(p);
        }
        this.playerDocArr.sort(descendingProp('gameCount'));
        console.log('onSortGameCount');
    }
}
