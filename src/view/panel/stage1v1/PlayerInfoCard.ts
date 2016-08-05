import Container = createjs.Container;
import {PlayerInfo} from "../../../model/PlayerInfo";
import {loadImg} from "../../../utils/JsFunc";
export class PlayerInfoCard {
    ctn: Container;

    constructor(parent: Container) {
        this.ctn = new createjs.Container();
        parent.addChild(this.ctn);
    }

    fadeInfoPlayerInfoCard(playerDocArr) {
        this.ctn.removeAllChildren();
        for (var i = 0; i < playerDocArr.length; i++) {
            var isBlue = (i < 1);
            var playerDoc = playerDocArr[i];
            var pInfo;
            pInfo = new PlayerInfo(playerDoc);
            pInfo.isBlue = isBlue;
            var playerCard = this.getWinPlayerCard(pInfo, (pInfo2)=> {
                var bound = pInfo2.playerCard.getBounds();

                if (bound)
                    pInfo2.playerCard.cache(bound.x, bound.y, bound.width, bound.height);
                // if (isMvp) {
                //     // this.fireFx.parent.addChild(this.fireFx);
                // }
            });
            pInfo.playerCard = playerCard;
            playerCard.x = i * 390 + 300;
            if (pInfo.isMvp) {
                playerCard.y = -30;
                // playerCard.addChild(this.fireFx)
            }
            else
                playerCard.y = 0;
            // console.log("new player card", paramDataArr[i], playerCard.x, playerCard.y, mvp);
            playerCard.px = playerCard.x;
            playerCard.py = playerCard.y;
            playerCard.x = 500;
            playerCard.scaleX = playerCard.scaleY = 0.01;
            createjs.Tween.get(playerCard)
                .to({x: playerCard.px, scaleX: 1.1, scaleY: 1.1}, 200)
                .to({scaleX: 1, scaleY: 1}, 60).call(()=> {
            });
            this.ctn.addChild(playerCard);
        }
    }

    getWinPlayerCard(p: PlayerInfo, callback): any {
        var isMvp = p.isMvp;
        var ctn = new createjs.Container();
        console.log("playerCard=======:", p.avatar());
        loadImg(p.avatar(), function () {
            var avatar = new createjs.Bitmap(p.avatar());
            var scale = 80 / avatar.getBounds().height;
            if (isMvp) {
                avatar.scaleX = avatar.scaleY = 1.5 * scale;
                avatar.x = (180 - 180 * 1.2) * .5 + 60;
                avatar.y = 45 + 30;
            }
            else {
                avatar.scaleX = avatar.scaleY = 1.2 * scale;
                avatar.x = (180 - 180 * 1.2) * .5 + 60;
                avatar.y = 50 + 30;
            }
            ctn.addChild(avatar);


            var bgPath = '/img/panel/stage/win/playerBgWin';
            if (p.isBlue)
                bgPath += "Blue";
            else
                bgPath += "Red";
            // if (p.isMvp)
            //     bgPath += "Mvp";
            bgPath += '.png';
            var bg = new createjs.Bitmap(bgPath);
            // if (p.isMvp) {
            //     bg.x = -132;
            //     bg.y = -105;
            // }
            // else {
                bg.x = -116;
                bg.y = -80;
            // }
            ctn.addChild(bg);


            var col;
            if (p.isRed)
                col = "#e23f6b";
            else
                col = "#1ac3fa";

            var nameCol = "#ddd";
            if (isMvp)
                nameCol = "#f1c236";
            var name;
            if (isMvp)
                name = new createjs.Text(p.name(), "30px Arial", nameCol);
            else
                name = new createjs.Text(p.name(), "30px Arial", col);
            name.textAlign = 'center';
            name.x = 90 + 60;
            name.y = 200;
            if (isMvp) {
                name.x += 20;
                name.y = 215;
            }
            ctn.addChild(name);

            var eloScore;
            var eloScoreText = '新秀';
            if (p.gameCount() >= 3) {
                eloScoreText = p.eloScore();
            }
            eloScore = new createjs.Text(eloScoreText, "bold 32px Arial", nameCol);
            eloScore.textAlign = 'center';
            eloScore.x = name.x;
            eloScore.y = 245 + 30;
            if (isMvp)
                eloScore.y += 30;
            ctn.addChild(eloScore);

            var eloScoreDt = new createjs.Text("+" + p.dtScore(), "12px Arial", col);
            eloScoreDt.textAlign = 'left';
            eloScoreDt.x = 140 + 60;
            eloScoreDt.y = 260 + 30;
            if (isMvp) {
                eloScoreDt.x += 30;
                eloScoreDt.y += 30;
            }
            ctn.addChild(eloScoreDt);

            // var winpercent: Text = new createjs.Text("胜率" + p.getWinPercent(), "18px Arial", col);
            // winpercent.textAlign = 'center';
            // winpercent.x = name.x;
            // winpercent.y = 320;
            // if (isMvp)
            //     winpercent.y += 35;
            // ctn.addChild(winpercent);

            var gameCount = new createjs.Text("场数" + p.gameCount(), "18px Arial", col);
            gameCount.textAlign = 'center';
            gameCount.x = name.x;
            gameCount.y = 350;
            if (isMvp)
                gameCount.y += 35;
            ctn.addChild(gameCount);

            var style = new createjs.Bitmap(p.getWinStyleIcon());
            style.x = 110;
            style.y = 370;
            if (isMvp) {
                style.x += 20;
                style.y += 45;
            }
            ctn.addChild(style);
            callback(p);
        });
        return ctn;
    }
}