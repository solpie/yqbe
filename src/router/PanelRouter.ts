import {ServerConf} from "../Env";
import {ascendingProp} from "../utils/JsFunc";
import {db} from "../model/DbInfo";
import {MatchSvg} from "../model/BracketInfo";
export var panelRouter = require('express').Router();


// panelRouter.get('/bracket', function (req, res) {
//     console.log('get bracket:');
//     var actDoc = db.activity.getDocArr([3])[0];
//
//     var matchArr = [];
//     for (var i = 0; i < 15; i++) {
//         var ms: MatchSvg = new MatchSvg(0, 0, i + 1);
//         var bracketDoc = actDoc.bracket[ms.idx];
//         if (bracketDoc) {
//             if (bracketDoc.gameInfoArr[0]) {
//                 ms.playerSvgArr[0].name = bracketDoc.gameInfoArr[0].name;
//                 ms.playerSvgArr[0].avatar = bracketDoc.gameInfoArr[0].avatar;
//                 ms.playerSvgArr[0].score = bracketDoc.gameInfoArr[0].score;
//             }
//             if (bracketDoc.gameInfoArr[1]) {
//                 ms.playerSvgArr[1].name = bracketDoc.gameInfoArr[1].name;
//                 ms.playerSvgArr[1].avatar = bracketDoc.gameInfoArr[1].avatar;
//                 ms.playerSvgArr[1].score = bracketDoc.gameInfoArr[1].score;
//             }
//         }
//         matchArr.push(ms);
//     }
//
//     matchArr.sort(ascendingProp('idx'));
//     res.render('panel/bracket/index',
//         {matchArr: matchArr});
// });

panelRouter.get('/', function (req, res) {
    console.log('get panel:');
    res.render('panel/index', {host: ServerConf.host, wsPort: ServerConf.wsPort});
});

panelRouter.get('/screen', function (req, res) {
    console.log('get screen:');
    res.render('screen/index', {host: ServerConf.host, wsPort: ServerConf.wsPort});
});

