import {VueEx, Component} from "../../../VueEx";
import {descendingProp} from "../../../../utils/JsFunc";
@Component({
    template: require('./gamerec.html'),
    props: {
        gameRecArr: {}
    }
})
export class GameRec extends VueEx {
    gameRecArr;

    ready() {
        this.post('/db/game', (data)=> {
            console.log(data);
            var gameRecArr2 = data.gameRecArr.sort(descendingProp('start'));
            this.gameRecArr = [];
            for (var i = 0; i < gameRecArr2.length; i++) {
                var obj = gameRecArr2[i];
                if (obj.idx) {
                    var d = new Date(obj.start);
                    obj.timeStr = d.getMonth() + "月" + d.getDay() + "日";
                    obj.timeStr = d//d.getMonth() + "月" + d.getDay() + "日";
                    this.gameRecArr.push(obj);
                }
            }
            // var playerMap = data.PlayerMap;
            // this.playerDocArr = mapToArr(playerMap).sort(descendingProp('eloScore'));
            // this.playerDocArr = rank;
        });
    }
}