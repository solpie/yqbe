import {ServerConf} from "../Env";
export var panelRouter = require('express').Router();

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
    for (var i = 0; i < 4; i++) {
        var ms: MatchSvg = new MatchSvg();// new MatchSvg();
        ms.playerSvgArr[0] = playerArr[i * 2];
        ms.playerSvgArr[1] = playerArr[i * 2 + 1];
        ms.x = 0;
        ms.y = 35 + 54 * i;
        ms.idx = i + 1;
        matchArr.push(ms);
    }
    // 5  6
    for (var i = 0; i < 2; i++) {
        var ms: MatchSvg = new MatchSvg();// new MatchSvg();
        ms.playerSvgArr[0] = playerArr[i * 2];
        ms.playerSvgArr[1] = playerArr[i * 2 + 1];
        ms.x = 0;
        ms.y = 340 + 54 * i;
        ms.idx = i + 5;//5 6
        matchArr.push(ms);
    }
    // 7  8
    for (var i = 0; i < 2; i++) {
        var ms: MatchSvg = new MatchSvg();// new MatchSvg();
        ms.playerSvgArr[0] = playerArr[i * 2];
        ms.playerSvgArr[1] = playerArr[i * 2 + 1];
        ms.x = 244;
        ms.y = 62 + (170 - 62) * i;
        ms.idx = i + 7;//5 6
        matchArr.push(ms);
    }
    // x="244" y="62"
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

