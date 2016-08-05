import Container = createjs.Container;
import {PlayerInfo} from "../../../model/PlayerInfo";
import {loadImg} from "../../../utils/JsFunc";
import {CreateJsEx} from "../CreateJsEx";
import {fadeOutCtn} from "../../../utils/Fx";
import {ViewConst} from "../../../event/Const";
import Text = createjs.Text;
export class PlayerInfoCard {
    ctn: Container;

    constructor(parent: Container) {
        this.ctn = new createjs.Container();
        parent.addChild(this.ctn);
    }

    fadeInfoPlayerInfoCard(playerDocArr) {
        this.ctn.removeAllChildren();
        $('#ex').html("");
        this.ctn.addChild(CreateJsEx.newModal());
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
            });
            pInfo.playerCard = playerCard;
            playerCard.x = i * 830 + 400;
            playerCard.y = 250;
            // console.log("new player card", paramDataArr[i], playerCard.x, playerCard.y, mvp);
            playerCard.px = playerCard.x;
            playerCard.py = playerCard.y;
            playerCard.x = 500;
            playerCard.scaleX = playerCard.scaleY = 0.01;
            createjs.Tween.get(playerCard)
                .to({x: playerCard.px, scaleX: 1.1, scaleY: 1.1}, 200)
                .to({scaleX: 1, scaleY: 1}, 60).call(()=> {
                $('.BlueIntro').show();
                $('.RedIntro').show();
            });
            this.ctn.addChild(playerCard);
        }
    }

    getWinPlayerCard(p: PlayerInfo, callback): any {
        // var isMvp = p.isMvp;
        var ctn = new createjs.Container();
        console.log("playerCard=======:", p.avatar());
        loadImg(p.avatar(), function () {
            var avatar = new createjs.Bitmap(p.avatar());
            var scale = 80 / avatar.getBounds().height;
            avatar.scaleX = avatar.scaleY = 1.2 * scale;
            avatar.x = (180 - 180 * 1.2) * .5 + 60;
            avatar.y = 50 + 30;
            if (isFinal) {
                avatar.scaleX = avatar.scaleY = 1.5 * scale;
                avatar.x = (180 - 180 * 1.2) * .5 + 70;
                avatar.y = 45 + 30;
            }
            ctn.addChild(avatar);


            var isFinal = (p as any).final;
            var bgPath = '/img/panel/stage/win/playerBgWin';
            if (p.isBlue)
                bgPath += "Blue";
            else
                bgPath += "Red";
            if (isFinal) {
                bgPath = '/img/panel/stage1v1/finalPlayerBg';
            }
            bgPath += '.png';
            var bg = new createjs.Bitmap(bgPath);
            bg.x = -116;
            bg.y = -80;

            if (isFinal) {
                bg.x = -132;
                bg.y = -105;
            }
            ctn.addChild(bg);


            var col;
            if (p.isBlue) {
                col = "#1ac3fa";
            } else {
                col = "#e23f6b";
            }
            var nameCol = "#ddd";
            var nameText: Text;
            nameText = new createjs.Text(p.name(), "bold 30px Arial", col);
            nameText.textAlign = 'center';
            nameText.x = 90 + 60;
            nameText.y = 200;
            if (isFinal) {
                nameText.x += 20;
                nameText.y = 215;
            }
            ctn.addChild(nameText);

            var playerInfoText;
            playerInfoText = new createjs.Text(`身高：${PlayerInfo.height(p)} cm  体重：${PlayerInfo.weight(p)} kg`, "18px Arial", nameCol);
            playerInfoText.textAlign = 'center';
            playerInfoText.x = nameText.x;
            playerInfoText.y = 245 + 30;
            if (isFinal) {
                // playerInfoText.x += 5;
                playerInfoText.y += 15;
            }
            ctn.addChild(playerInfoText);

            // var cnLength = function (text) {
            //     var arr = text.match(/[^x00-xff]/ig);
            //     return text.length + (arr == null ? 0 : arr.length);
            // };
            //
            // var wrap = (text, num = 12)=> {
            //     var outText = '';
            //     for (var i = 0; ; i++) {
            //         if (i * num < cnLength(text))
            //             outText += text.substr(i * num, (i + 1) * num) + '\n';
            //         else
            //             break;
            //     }
            //     return outText;
            // };


            if (p.isBlue)
                $('#ex').append(`<textarea class="PlayerIntro BlueIntro" >${PlayerInfo.intro(p)}</textarea>`);
            else
                $('#ex').append(`<textarea class="PlayerIntro RedIntro"  >${PlayerInfo.intro(p)}</textarea>`);


            var winLoseText: Text = new createjs.Text(`${p.winGameCount()}胜 / ${p.loseGameCount()}负`, "25px Arial", '#f1c236');
            winLoseText.textAlign = 'center';
            winLoseText.x = nameText.x;
            winLoseText.y = 410;

            if (isFinal) {
                winLoseText.x += 5;
                winLoseText.y += 48;
            }
            ctn.addChild(winLoseText);
            callback(p);
        });
        return ctn;
    }

    fadeOutPlayerInfoCard() {
        $('.BlueIntro').hide();
        $('.RedIntro').hide();
        fadeOutCtn(this.ctn);
    }


    fadeInWinPlayer(isBlue, playerDoc) {
        this.ctn.removeAllChildren();
        var ctn = this.ctn;
        $('#ex').html("");
        ctn.addChild(CreateJsEx.newModal());
        ///////////
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
            titleCtn.y = 170;
            titleCtn.scaleX = titleCtn.scaleY = 5;
            titleCtn.alpha = 0;
            createjs.Tween.get(titleCtn).to({scaleX: 1, scaleY: 1, alpha: 1}, 150);
            titleCtn.addChildAt(title, 0);
            // console.log(title.getBounds());
        });
        ctn.addChild(titleCtn);
        /////////////////

        var playerInfo = new PlayerInfo(playerDoc);
        var playerCard = this.getWinPlayerCard(playerInfo, (pInfo2)=> {
            var bound = pInfo2.playerCard.getBounds();
            if (bound)
                pInfo2.playerCard.cache(bound.x, bound.y, bound.width, bound.height);
        });

        (playerInfo as any).playerCard = playerCard;
        (playerInfo as any).isBlue = isBlue;
        playerCard.x = 800;
        playerCard.y = 250;
        playerCard.px = playerCard.x;
        playerCard.py = playerCard.y;
        playerCard.x = 500;
        playerCard.scaleX = playerCard.scaleY = 0.01;
        createjs.Tween.get(playerCard)
            .to({x: playerCard.px, scaleX: 1.1, scaleY: 1.1}, 200)
            .to({scaleX: 1, scaleY: 1}, 60).call(()=> {
            var $playerIntro = $('.PlayerIntro').css({left: '835px'});
            $playerIntro.show();
        });
        ctn.addChild(playerCard);
    }

    fadeOutWinPlayer() {
        $('.PlayerIntro').hide();
        fadeOutCtn(this.ctn);
    }

    fadeInFinalPlayer(playerDoc) {
        this.ctn.removeAllChildren();
        var ctn = this.ctn;
        $('#ex').html("");
        ctn.addChild(CreateJsEx.newModal(1));
        ///////////
        var titlePath = "/img/panel/stage1v1/finalPlayerTitle.png";
        var titleCtn = new createjs.Container();
        loadImg(titlePath, function () {
            var title = new createjs.Bitmap(titlePath);
            title.x = -(ViewConst.STAGE_WIDTH) * .5;
            titleCtn.x = -title.x;
            titleCtn.scaleX = titleCtn.scaleY = 5;
            titleCtn.alpha = 0;
            createjs.Tween.get(titleCtn).to({scaleX: 1, scaleY: 1, alpha: 1}, 150);
            titleCtn.addChild(title);
        });
        ctn.addChild(titleCtn);

        var playerInfo = new PlayerInfo(playerDoc);
        var playerCard = this.getWinPlayerCard(playerInfo, (pInfo2)=> {
            var bound = pInfo2.playerCard.getBounds();
            if (bound)
                pInfo2.playerCard.cache(bound.x, bound.y, bound.width, bound.height);
        });

        (playerInfo as any).playerCard = playerCard;
        (playerInfo as any).final = true;
        playerCard.x = 800;
        playerCard.y = 250;
        playerCard.px = playerCard.x;
        playerCard.py = playerCard.y;
        playerCard.x = 500;
        playerCard.scaleX = playerCard.scaleY = 0.01;
        createjs.Tween.get(playerCard)
            .to({x: playerCard.px, scaleX: 1.1, scaleY: 1.1}, 200)
            .to({scaleX: 1, scaleY: 1}, 60).call(()=> {
            var $playerIntro = $('.PlayerIntro').css({left: '858px', top: '575px'});
            $playerIntro.show();
        });
        ctn.addChild(playerCard);
    }
}