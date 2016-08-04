import {loadImg} from "../../../utils/JsFunc";
import {ViewConst} from "../../../event/Const";
import {PlayerInfo} from "../../../model/PlayerInfo";
import {TeamInfo} from "../../../model/TeamInfo";
import Container = createjs.Container;
import Text = createjs.Text;
export class EventPanel {
    ctn:Container;
    fireFx:any;

    constructor(parent:any) {
        var ctn = new createjs.Container();
        parent.stage.addChild(ctn);

        this.ctn = ctn;
    }


    fadeInWinPanel(teamInfo:TeamInfo, mvpIdx, mpvId) {
        //todo 优化mvpId mvpIdx
        var mvp = Number(mvpIdx);
        console.log(this, "show fadeInWinPanel mvp:", mvp);
        var ctn = this.ctn;
        var modal = new createjs.Shape();
        modal.graphics.beginFill('#000').drawRect(0, 0, ViewConst.STAGE_WIDTH, ViewConst.STAGE_HEIGHT);
        modal.alpha = .3;
        ctn.addChild(modal);

        var playerCtn = new createjs.Container();
        ctn.addChild(playerCtn);

        // if (this.verifyWin(paramDataArr, mvp)) {
        var isRedWin = (mvp > 3);
        var isBlue = (mvp < 4);

        var titlePath = "/img/panel/stage/win/winPanelTitle";
        if (isRedWin)
            titlePath += 'Red.png';
        else
            titlePath += 'Blue.png';
        var titleCtn = new createjs.Container();

        loadImg(titlePath, function () {
            var title = new createjs.Bitmap(titlePath);
            title.x = -419;//838 315
            title.y = -158;
            titleCtn.x = (ViewConst.STAGE_WIDTH) * .5;
            titleCtn.y = 198;
            titleCtn.scaleX = titleCtn.scaleY = 5;
            titleCtn.alpha = 0;
            createjs.Tween.get(titleCtn).to({scaleX: 1, scaleY: 1, alpha: 1}, 150);
            titleCtn.addChild(title);
            // console.log(title.getBounds());
        });

        ctn.addChild(titleCtn);

        var prePlayerIsMvp = false;
        playerCtn.x = (ViewConst.STAGE_WIDTH - 4 * 390) * .5;
        playerCtn.y = 300;


        var start = 0;
        if (!isBlue) {
            // start = 4;
        }

        if (!this.fireFx) {
            // var imgArr = [];
            // var drop = 3;
            // for (var i = 0; i < 90 / drop; i++) {
            //     imgArr.push('/img/panel/stage/win/fx/fire_' + pad(i * drop, 5) + '.png');
            // }
            // console.log(imgArr[0]);
            // var sheet = new createjs.SpriteSheet({
            //     images: imgArr,
            //     frames: {width: 599, height: 850},
            //     // framerate: 1,
            //     animations: {
            //         loop: [0, (90 / drop) - 1]
            //     }
            // });
            // this.fireFx = new createjs.Sprite(sheet, "loop");
            // this.fireFx.x = -132;
            // this.fireFx.y = -135;
        }

        for (var i = start; i < start + 4; i++) {
            var pInfo;
            pInfo = new PlayerInfo(teamInfo.playerInfoArr[i].playerData);
            pInfo.isRed = teamInfo.playerInfoArr[i].isRed;
            pInfo.isBlue = isBlue;
            pInfo.isMvp = pInfo.id() == mpvId;
            var playerCard = this.getWinPlayerCard(pInfo, (isMvp)=> {
                var bound = playerCard.getBounds();

                if (bound)
                    playerCard.cache(bound.x, bound.y, bound.width, bound.height);
                if (isMvp) {
                    // this.fireFx.parent.addChild(this.fireFx);
                }
            });
            playerCard.x = i * 390;
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
            playerCtn.addChild(playerCard);
            prePlayerIsMvp = pInfo.isMvp;
        }
        function pad(num, n) {
            var len = num.toString().length;
            while (len < n) {
                num = "0" + num;
                len++;
            }
            return num;
        }
    }

    fadeInWinPanel2v2(teamInfo:TeamInfo, mvpIdx, mpvId) {
        //todo 优化mvpId mvpIdx
        var mvp = Number(mvpIdx);
        console.log(this, "show fadeInWinPanel mvp:", mvp);
        var ctn = this.ctn;
        var modal = new createjs.Shape();
        modal.graphics.beginFill('#000').drawRect(0, 0, ViewConst.STAGE_WIDTH, ViewConst.STAGE_HEIGHT);
        modal.alpha = .3;
        ctn.addChild(modal);

        var playerCtn = new createjs.Container();
        ctn.addChild(playerCtn);

        // if (this.verifyWin(paramDataArr, mvp)) {
        var isBlue = (mvp < 4);

        var titlePath = "/img/panel/stage/win/winPanelTitle";
        if (isBlue)
            titlePath += 'Blue.png';
        else
            titlePath += 'Red.png';
        var titleCtn = new createjs.Container();

        loadImg(titlePath, function () {
            var title = new createjs.Bitmap(titlePath);
            title.x = -419;//838 315
            title.y = -158;
            titleCtn.x = (ViewConst.STAGE_WIDTH) * .5;
            titleCtn.y = 198;
            titleCtn.scaleX = titleCtn.scaleY = 5;
            titleCtn.alpha = 0;
            createjs.Tween.get(titleCtn).to({scaleX: 1, scaleY: 1, alpha: 1}, 150);
            titleCtn.addChild(title);
            // console.log(title.getBounds());
        });

        ctn.addChild(titleCtn);

        var prePlayerIsMvp = false;
        playerCtn.x = (ViewConst.STAGE_WIDTH - 4 * 390) * .5;
        playerCtn.y = 300;


        var start = 0;
        if (!isBlue) {
            // start = 4;
        }
        var px = 400;
        for (var i = start; i < start + 4; i++) {
            if (i > 1) {
                break;
            }
            var pInfo;
            pInfo = new PlayerInfo(teamInfo.playerInfoArr[i].playerData);
            pInfo.isRed = teamInfo.playerInfoArr[i].isRed;
            pInfo.isBlue = isBlue;
            pInfo.isMvp = pInfo.id() == mpvId;
            var playerCard = this.getWinPlayerCard(pInfo, (isMvp)=> {
                var bound = playerCard.getBounds();

                if (bound)
                    playerCard.cache(bound.x, bound.y, bound.width, bound.height);
                if (isMvp) {
                    // this.fireFx.parent.addChild(this.fireFx);
                }
            });
            playerCard.x = i * 390 + px;
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
            playerCtn.addChild(playerCard);

            prePlayerIsMvp = pInfo.isMvp;
        }
        function pad(num, n) {
            var len = num.toString().length;
            while (len < n) {
                num = "0" + num;
                len++;
            }
            return num;
        }
    }

    getWinPlayerCard(p:PlayerInfo, callback):any {
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
            if (p.isMvp)
                bgPath += "Mvp";
            bgPath += '.png';
            var bg = new createjs.Bitmap(bgPath);
            if (p.isMvp) {
                bg.x = -132;
                bg.y = -105;
            }
            else {
                bg.x = -116;
                bg.y = -80;
            }
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

            var winpercent:Text = new createjs.Text("胜率" + p.getWinPercent(), "18px Arial", col);
            winpercent.textAlign = 'center';
            winpercent.x = name.x;
            winpercent.y = 320;
            if (isMvp)
                winpercent.y += 35;
            ctn.addChild(winpercent);

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
            callback(p.isMvp);
        });
        return ctn;
    }

    fadeOutWinPanel() {
        console.log(this, "show fade Out WinPanel");
        var ctn = this.ctn;
        createjs.Tween.get(ctn).to({alpha: 0}, 200)
            .call(function () {
                ctn.alpha = 1;
                ctn.removeAllChildren();
            });
    }
}