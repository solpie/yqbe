import {ServerConf} from "../Env";
import {ascendingProp} from "../utils/JsFunc";
export var panelRouter = require('express').Router();

class PlayerSvg {
    seed: number;//八强排位
    name: string;//
    score: number = 2;//
}
class MatchSvg {
    x: number;
    y: number;
    round: number;
    idx: number;//场次
    playerSvgArr: Array<PlayerSvg>;

    constructor(x, y, idx) {
        this.x = x;
        this.y = y;
        this.idx = idx;
        this.playerSvgArr = [new PlayerSvg, new PlayerSvg];
    }
}

panelRouter.get('/bracket', function (req, res) {
    console.log('get bracket:');

    var playerArr = [];
    for (var i = 0; i < 8; i++) {
        var ps = new PlayerSvg();
        ps.seed = i + 1;
        ps.name = '路人' + ps.seed;
        playerArr.push(ps)
    }

    var matchArr = [];
    for (var i = 0; i < 15; i++) {
        matchArr.push(new MatchSvg(0, 0, i + 1));
    }
    // //12    x="488" y="116"
    // matchArr.push(new MatchSvg(488, 116, 12));
    //
    //
    // //14    x="732" y="143"
    // matchArr.push(new MatchSvg(732, 143, 14));
    // //15    x="976" y="143"
    // matchArr.push(new MatchSvg(976, 143, 15));
    //
    //
    // //loser section
    // var py = 10;
    // // 9
    // matchArr.push(new MatchSvg(244, py + 377, 9));
    // // 10
    // matchArr.push(new MatchSvg(244, py + 323, 10));
    //
    // //11    x="488" y="340"
    // matchArr.push(new MatchSvg(488, py + 340, 11));
    //
    // //13    x="732" y="313"
    // matchArr.push(new MatchSvg(732, py + 313, 13));

    matchArr.sort(ascendingProp('idx'));


    res.render('panel/bracket/index',
        {matchArr: matchArr});
});

panelRouter.get('/', function (req, res) {
    console.log('get panel:');
    res.render('panel/index', {host: ServerConf.host, wsPort: ServerConf.wsPort});
});

panelRouter.get('/screen', function (req, res) {
    console.log('get screen:');
    res.render('screen/index', {host: ServerConf.host, wsPort: ServerConf.wsPort});
});

