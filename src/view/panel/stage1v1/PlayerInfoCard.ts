import Container = createjs.Container;
import {PlayerInfo} from "../../../model/PlayerInfo";
import {loadImg} from "../../../utils/JsFunc";
import {CreateJsEx} from "../CreateJsEx";
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
                // if (isMvp) {
                //     // this.fireFx.parent.addChild(this.fireFx);
                // }
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
            // if (isMvp) {
            //     avatar.scaleX = avatar.scaleY = 1.5 * scale;
            //     avatar.x = (180 - 180 * 1.2) * .5 + 60;
            //     avatar.y = 45 + 30;
            // }
            // else {
            avatar.scaleX = avatar.scaleY = 1.2 * scale;
            avatar.x = (180 - 180 * 1.2) * .5 + 60;
            avatar.y = 50 + 30;
            // }
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
            if (p.isBlue) {
                col = "#1ac3fa";
            } else {
                col = "#e23f6b";
            }
            var nameCol = "#ddd";
            // if (isMvp)
            //     nameCol = "#f1c236";
            var nameText: Text;
            // if (isMvp)
            //     name = new createjs.Text(p.name(), "30px Arial", nameCol);
            // else
            nameText = new createjs.Text(p.name(), "bold 30px Arial", col);
            nameText.textAlign = 'center';
            nameText.x = 90 + 60;
            nameText.y = 200;
            // if (isMvp) {
            //     name.x += 20;
            //     name.y = 215;
            // }
            ctn.addChild(nameText);

            var playerInfoText;
            // var eloScoreText = '新秀';
            // if (p.gameCount() >= 3) {
            //     eloScoreText = p.eloScore();
            // }
            playerInfoText = new createjs.Text(`身高：${PlayerInfo.height(p)} cm  体重：${PlayerInfo.weight(p)} kg`, "18px Arial", nameCol);
            playerInfoText.textAlign = 'center';
            playerInfoText.x = nameText.x;
            playerInfoText.y = 245 + 30;
            ctn.addChild(playerInfoText);

            var cnLength = function (text) {
                var arr = text.match(/[^x00-xff]/ig);
                return text.length + (arr == null ? 0 : arr.length);
            };

            var wrap = (text, num = 12)=> {
                var outText = '';
                for (var i = 0; ; i++) {
                    if (i * num < cnLength(text))
                        outText += text.substr(i * num, (i + 1) * num) + '\n';
                    else
                        break;
                }
                return outText;
            };


            if (p.isBlue)
                $('#ex').append(`<textarea class="PlayerIntro BlueIntro" >${PlayerInfo.intro(p)}</textarea>`);
            else
                $('#ex').append(`<textarea class="PlayerIntro RedIntro"  >${PlayerInfo.intro(p)}</textarea>`);
            // var introText = new createjs.Text(wrap(PlayerInfo.intro(p)), "18px Arial", col);
            // introText.textAlign = 'center';
            // // introText.lineWidth = 230;
            // introText.lineHeight = 22;
            // introText.x = nameText.x;
            // introText.y = 320;
            // ctn.addChild(introText);


            var winpercent: Text = new createjs.Text(`${p.winGameCount()}胜 / ${p.loseGameCount()}负`, "25px Arial", '#f1c236');
            winpercent.textAlign = 'center';
            winpercent.x = nameText.x;
            winpercent.y = 410;
            ctn.addChild(winpercent);
            // var style = new createjs.Bitmap(p.getWinStyleIcon());
            // style.x = 110;
            // style.y = 370;
            // ctn.addChild(style);
            callback(p);
        });
        return ctn;
    }

    fadeOutPlayerInfoCard() {

    }
}