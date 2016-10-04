import {db} from "../model/DbInfo";
import {mapToArr} from "../utils/JsFunc";
// import {Act619} from "../event/Const";
export var dbRouter = require('express').Router();

// /db/player
dbRouter.post('/player/', function (req: any, res: any) {
    if (!req.body) return res.sendStatus(400);
    res.send({PlayerMap: db.player.dataMap});
});

dbRouter.post('/player/:playerId', function (req: any, res: any) {
    var playerId = req.params.playerId;
    console.log(`/player/${playerId}`);
    if (playerId) {
        res.send({playerDoc: db.player.dataMap[playerId]});
    }
});

dbRouter.post('/act/', function (req: any, res: any) {
    if (!req.body) return res.sendStatus(400);
    res.send({activityMap: db.activity.dataMap});
});

dbRouter.post('/act/combine', function (req: any, res: any) {
    res.send({
        activityMap: db.activity.dataMap,
        gameMap: db.game.dataMap
    });
});

dbRouter.get('/act/1v1', function (req: any, res: any) {
    var playerIdArr;
    for (var k in db.activity.dataMap) {
        if (db.activity.dataMap[k].activityId == 3) {
            playerIdArr = db.activity.dataMap[k].gameDataArr[0].playerIdArr;
            break;
        }
    }
    res.send({
        playerIdArr: playerIdArr,
    });
});

dbRouter.post('/game/', function (req: any, res: any) {
    if (!req.body) return res.sendStatus(400);
    res.send({gameMap: db.game.dataMap});
});

////  /db/ft
dbRouter.get('/ft', function (req: any, res: any) {
    var ftArr = mapToArr(db.ft.dataMap);
    res.send({ftArr: ftArr});
});