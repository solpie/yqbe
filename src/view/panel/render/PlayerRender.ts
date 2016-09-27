import {loadImg} from "../../../utils/JsFunc";
import {PlayerInfo, PlayerDoc} from "../../../model/PlayerInfo";
import {blink, delayCall} from "../../../utils/Fx";
import {FTInfo} from "../../../model/FTInfo";
import Text = createjs.Text;
import Container = createjs.Container;
import Bitmap = createjs.Bitmap;
export class StagePlayerCard extends Container {
    // _ctn:Container;
    nameText: Text;
    eloScoreText: Text;
    backNumText: Text;
    // _styleCtn: Container;
    isBlue: boolean;
    avatarBmp: Bitmap;
    avatarCtn: Container;
    isDelayShow: boolean;
    _delayShowEnd: boolean = false;
    playerInfo: PlayerInfo;

    constructor(playerInfo: PlayerInfo, scale = 1, isBlue = true, isDelayShow = false) {
        super();
        this.playerInfo = playerInfo;
        this.isDelayShow = isDelayShow;
        this.setPlayerInfo(playerInfo.playerData, scale, isBlue);
    }

    setName(name: string) {
        this.nameText.text = name;
    }

    setEloScore(eloScore: number) {
        this.eloScoreText.text = eloScore.toString();
    }

    setBackNumber(backNumber: string) {
        this.backNumText.text = backNumber;
    }

    setStyle(style: number) {
        // this._styleCtn.removeAllChildren();
        // var styleIcon = new createjs.Bitmap(PlayerInfo.getStyleIcon(style));//694x132
        // this._styleCtn.addChild(styleIcon);
    }

    setKingLabel() {
        var kingLabel: Bitmap;

        if (this.isBlue) {
            kingLabel = new createjs.Bitmap('/img/panel/stage1v1/kingLabelL.png');

            kingLabel.x = -14
        }
        else {
            kingLabel = new createjs.Bitmap('/img/panel/stage1v1/kingLabelR.png');
            kingLabel.x = -10
        }
        kingLabel.y = -6;

        this.addChild(kingLabel);
    }

    setPlayerInfo(playerDoc: PlayerDoc, scale = 1, isBlue = true) {
        this.isBlue = isBlue;
        //width 150
        var ctn = this;
        this.removeAllChildren();
        var ofsX = 20;

        function _isBluePath(p) {
            if (isBlue)
                return p + "Blue.png";
            return p + "Red.png";
        }

        // var avatarFrame = new createjs.Bitmap(_isBluePath('/img/panel/stage1v1/avatarFrame'));//694x132

        var avatarCtn = new createjs.Container();
        this.avatarCtn = avatarCtn;
        if (isBlue) {
            avatarCtn.x = 20 - ofsX;
        }
        else {
            avatarCtn.x = -2 + ofsX;
        }
        var avatarMask = new createjs.Shape();
        var sx = 48;
        var avtHeight = 81;
        var avtWidth = 145;
        if (isBlue) {
            avatarMask.x = 16;
            avatarMask.graphics.beginFill("#000")
                .moveTo(sx, 0)
                .lineTo(0, avtHeight)
                .lineTo(avtWidth - sx, avtHeight)
                .lineTo(avtWidth, 0)
                .lineTo(sx, 0);
        }

        else {
            avatarMask.x = 19;
            avatarMask.graphics.beginFill("#000")
                .moveTo(0, 0)
                .lineTo(sx, avtHeight)
                .lineTo(avtWidth, avtHeight)
                .lineTo(avtWidth - sx, 0)
                .lineTo(0, 0);
        }

        var avatarPath;
        if (isBlue)
            avatarPath = '/img/panel/stage/blue.png';
        else
            avatarPath = '/img/panel/stage/red.png';
        avatarPath = playerDoc.avatar || avatarPath;
        loadImg(avatarPath, ()=> {
            var avatarBmp = new createjs.Bitmap(avatarPath);
            avatarBmp.mask = avatarMask;
            avatarCtn.addChild(avatarMask);
            avatarCtn.addChild(avatarBmp);
            this.avatarBmp = avatarBmp;
            if (this.isDelayShow) {
                if (this._delayShowEnd) {
                    blink(avatarBmp)
                }
                else {
                    avatarBmp.alpha = 0;
                }
            }
            avatarBmp.scaleX = avatarBmp.scaleY = avtHeight / avatarBmp.getBounds().height;
        });
        ctn.addChildAt(avatarCtn, 0);
        var winLoseText = new createjs.Text(`贡献:${playerDoc.ftScore} 胜负:${playerDoc.winGameCount} / ${playerDoc.loseGameCount}`, "bold 16px Arial", "#fff");
        winLoseText.y = -2;
        this.eloScoreText = winLoseText;
        if (isBlue) {
            winLoseText.textAlign = 'right';
            winLoseText.x = 344;
        }
        else {
            winLoseText.x = -142;
        }
        ctn.addChild(winLoseText);


        var nameText = new createjs.Text(playerDoc.name, "bold 24px Arial", "#fff");
        this.nameText = nameText;
        nameText.y = 5;
        if (isBlue) {
            nameText.textAlign = 'right';
            nameText.x = 58 - ofsX;
        }
        else {
            nameText.x = 137 + ofsX;
        }
        ctn.addChild(nameText);

        var ftDoc: FTInfo = playerDoc['ftDoc'];
        console.log('playerDoc', playerDoc);
        var ftName = '所属战团：';
        if (ftDoc)
            ftName += ftDoc.name;
        else
            ftName += '无';

        var ftNameText = new Text(ftName, '16px Arial', '#fff');
        ftNameText.y = 40;
        if (isBlue) {
            ftNameText.textAlign = 'right';
            ftNameText.x = 40 - ofsX;
        }
        else {
            ftNameText.x = 160 + ofsX;
        }
        ctn.addChild(ftNameText);
        return ctn;
    }

    delayShow(delay) {
        console.log('delay show', delay);
        this._delayShowEnd = false;
        // this.avatarCtn.alpha = 0;
        createjs.Tween.get(this.avatarCtn).wait(delay).call(()=> {
            this._delayShowEnd = true;
            if (this.avatarBmp) {
                blink(this.avatarBmp);
                // this.avatarBmp.alpha = 0;
            }
            // if (this._styleCtn) {
            //     blink(this._styleCtn);
            // }
            // this.avatarCtn.alpha = 1;
        });
        delayCall(delay, ()=> {
            this.avatarBmp.alpha = 0;
            // this.avatarCtn.alpha = 1;
        })
    }

    static newScoreText() {
        var sheet = new createjs.SpriteSheet({
            animations: {
                "0": 1,
                "1": 2,
                "2": 3,
                "3": 4,
                "4": 5,
                "5": 6,
                "6": 7,
                "7": 8,
                "8": 9,
                "9": 0
            },
            images: ["/img/panel/stage/scoreNum.png"],
            frames: [[0, 0, 40, 54],
                [41, 0, 40, 54],
                [0, 55, 40, 54],
                [41, 55, 40, 54],
                [82, 0, 40, 54],
                [82, 55, 40, 54],
                [123, 0, 40, 54],
                [123, 55, 40, 54],
                [0, 110, 40, 54],
                [41, 110, 40, 54]]
        });
        return new createjs.BitmapText("0", sheet);
    }
}