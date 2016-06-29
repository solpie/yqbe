import {db} from "../model/DbInfo";
import {ExternalInfo} from "../model/external/ExternalInfo";
// import {Act619} from "../event/Const";
export var dbRouter = require('express').Router();

// /db/player
dbRouter.post('/player/', function (req:any, res:any) {
    if (!req.body) return res.sendStatus(400);
    res.send({PlayerMap: db.player.dataMap});
});

dbRouter.post('/player/:playerId', function (req:any, res:any) {
    var playerId = req.params.playerId;
    console.log(`/player/${playerId}`);
    if (playerId) {
        res.send({playerDoc: db.player.dataMap[playerId]});
    }
});

dbRouter.post('/act/', function (req:any, res:any) {
    if (!req.body) return res.sendStatus(400);
    res.send({activityMap: db.activity.dataMap});
});

dbRouter.post('/act/combine', function (req:any, res:any) {
    res.send({
        activityMap: db.activity.dataMap,
        gameMap: db.game.dataMap
    });
});

dbRouter.post('/game/', function (req:any, res:any) {
    if (!req.body) return res.sendStatus(400);
    res.send({gameMap: db.game.dataMap});
});


dbRouter.post('/external/player', function (req:any, res:any) {
    res.send({playerInfoMap: db.playerHuiTi.dataMap})
});

dbRouter.get('/external/import', function (req:any, res:any) {
    //https://github.com/SheetJS/js-xlsx
    console.log('/db/external');
    ExternalInfo.importHuiTi();
    res.sendStatus(200);
});
