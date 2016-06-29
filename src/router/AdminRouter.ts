import {PlayerInfo} from "../model/PlayerInfo";
import {db} from "../model/DbInfo";
import {base64ToPng} from "../utils/NodeJsFunc";
import {ServerConst} from "../event/Const";
export var adminRouter = require('express').Router();

adminRouter.get('/', function (req:any, res:any) {
    res.render('admin/index');
});

// adminRouter.get('/player', function (req:any, res:any) {
//     res.render('admin/admin-player', {playerDataArr: []});
// });
// post /admin/player/add
adminRouter.post('/player/wx/add', function (req:any, res:any) {

});

adminRouter.post('/player/add', function (req:any, res:any) {
    if (!req.body) return res.sendStatus(400);

    var playerData = req.body.playerData;
    var playerInfo = new PlayerInfo(playerData);
    console.log('/admin/player/add', db.player.getIdNew());
    playerInfo.id(db.player.getIdNew());
    function createPlayer() {
        db.player.create(playerInfo.playerData, function (err, newDoc) {
            if (!err) {
                res.sendStatus(200);
            }
            else
                res.sendStatus(400);
        });
    }

    var avatarPath = 'img/player/' + playerInfo.id() + '.png';
    if (playerData.avatar) {
        var dbImgPath = "app/db/" + avatarPath;
        console.log('/admin/player/add');
        base64ToPng(dbImgPath, playerData.avatar, function (imgPath) {
            playerInfo.avatar("/" + avatarPath);
            console.log('/admin/player/add', JSON.stringify(playerInfo.playerData));
            createPlayer();
        });
    }
    else {
        playerInfo.avatar(ServerConst.DEF_AVATAR);
        createPlayer();
    }

});

adminRouter.post('/player/delete', function (req:any, res:any) {
    if (!req.body) return res.sendStatus(400);
    var playerId = req.body.id;
    db.player.remove({id: playerId}, function (err, numRemoved) {
        // numRemoved = 1
        if (!err) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400);
        }
    });
});

adminRouter.post('/player/update', function (req:any, res:any) {
    if (!req.body) return res.sendStatus(400);
    var playerDocUpdate:any = req.body.playerDoc;
    console.log('/player/update', playerDocUpdate);

    var playerDoc = db.player.dataMap[playerDocUpdate.id];
    if (playerDoc) {
        var avatarPathOld = playerDoc.avatar;
        if (avatarPathOld == ServerConst.DEF_AVATAR)
            avatarPathOld = '/' + 'img/player/' + playerDocUpdate.id + '.png';

        function updatePlayer() {
            playerDocUpdate.avatar = avatarPathOld;
            console.log('/player/update playerDoc', playerDocUpdate);
            db.player.ds().update({id: playerDocUpdate.id}, {$set: playerDocUpdate}, {}, (err, newDoc) => {
                db.player.syncDataMap();
                res.sendStatus(200);
            });
        }

        if (playerDocUpdate.avatar) {
            var avatarPath = 'img/player/' + playerDocUpdate.id + '.png';
            var dbImgPath = "app/db/" + avatarPath;
            base64ToPng(dbImgPath, playerDocUpdate.avatar, (imgPath)=> {
                console.log('/player/update base64ToPng');
                updatePlayer();
            });
        }
        else {
            updatePlayer();
        }
    }
    else {
        console.log('/player/update no playerDoc in map');
    }
});

////////////// game admin 
adminRouter.get('/game/delete/:gameId', function (req:any, res:any) {
    var gameId = Number(req.params.gameId);
    console.log('/admin/game/delete/', gameId);
    db.game.remove({id: gameId});
    db.activity.removeGame(gameId, (sus)=> {
        res.send(sus);
    });
});

//////////////////activity admin
adminRouter.post('/act/19', function (req:any, res:any) {
    // if (!req.body) return res.sendStatus(400);
    // var act:any = Act619;
    // for (var gameDoc of act.gameDataArr) {
    //     gameDoc.playerDocArr = [];
    //     for (var i = 0; i < gameDoc.playerIdArr.length; i++) {
    //         var playerId = gameDoc.playerIdArr[i];
    //         console.log('playerId: ', playerId);
    //         gameDoc.playerDocArr.push(db.player.dataMap[playerId]);
    //     }
    // }
    // res.send(act);
});