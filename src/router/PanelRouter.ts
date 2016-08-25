import {ServerConf} from "../Env";
import {ascendingProp} from "../utils/JsFunc";
import {db} from "../model/DbInfo";
export var panelRouter = require('express').Router();

class PlayerSvg {
    seed: number;//八强排位
    name: string;//
    avatar: string;//
    score: number = 0;//
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


    // var playerArr = [];
    // for (var i = 0; i < 8; i++) {
    //     var ps = new PlayerSvg();
    //     ps.seed = i + 1;
    //     ps.name = '路人' + ps.seed;
    //     playerArr.push(ps)
    // }
    var actDoc = db.activity.getDocArr([3])[0];

    var matchArr = [];
    for (var i = 0; i < 15; i++) {
        var ms: MatchSvg = new MatchSvg(0, 0, i + 1);
        var bracketDoc = actDoc.bracket[ms.idx];
        if (bracketDoc) {
            if (bracketDoc.gameInfoArr[0]) {
                ms.playerSvgArr[0].name = bracketDoc.gameInfoArr[0].name;
                ms.playerSvgArr[0].avatar = bracketDoc.gameInfoArr[0].avatar;
                ms.playerSvgArr[0].score = bracketDoc.gameInfoArr[0].score;
            }
            if (bracketDoc.gameInfoArr[1]) {
                ms.playerSvgArr[1].name = bracketDoc.gameInfoArr[1].name;
                ms.playerSvgArr[1].avatar = bracketDoc.gameInfoArr[1].avatar;
                ms.playerSvgArr[1].score = bracketDoc.gameInfoArr[1].score;
            }
        }
        matchArr.push(ms);
    }

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

