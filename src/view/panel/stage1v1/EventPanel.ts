import {loadImg} from "../../../utils/JsFunc";
import {ViewConst} from "../../../event/Const";
import {PlayerInfo, PlayerState1v1} from "../../../model/PlayerInfo";
import {TeamInfo} from "../../../model/TeamInfo";
import {CreateJsEx} from "../CreateJsEx";
import {PlayerInfoCard} from "./PlayerInfoCard";
import Container = createjs.Container;
import Text = createjs.Text;
import Bitmap = createjs.Bitmap;
import SpriteContainer = createjs.SpriteContainer;
export class EventPanel {
    ctn: Container;
    fireFx: any;
    itemArr: Array<any>;
    playerInfoCard: PlayerInfoCard;
    curPage: number = 0;

    constructor(parent: any) {
        var ctn = new createjs.Container();
        parent.stage.addChild(ctn);
        this.ctn = ctn;
        this.playerInfoCard = new PlayerInfoCard(parent.stage);
    }

    fadeInActPanel(playerDocArr, isOp: boolean, dtPage, eventCallback) {
        this.curPage += dtPage;
        this.itemArr = [];
        this.ctn.removeAllChildren();
        // var modal = new createjs.Shape();
        // modal.graphics.beginFill('#000').drawRect(0, 0, ViewConst.STAGE_WIDTH, ViewConst.STAGE_HEIGHT);
        // modal.alpha = .3;
        this.ctn.addChild(CreateJsEx.newModal());
        //first column
        var actColumn = (playerDocArrC)=> {
            var ctn = new createjs.Container();
            var title = new createjs.Bitmap('/img/panel/stage1v1/actTitle.png');
            ctn.addChild(title);
            ////            test
            // var tmp = [PlayerState1v1.WAITING, PlayerState1v1.FIGHTING, PlayerState1v1.Dead, PlayerState1v1.PIGEON]
            // for (var i = 0; i < playerDocArrC.length; i++) {
            //     playerDocArrC[i].state = tmp[i % 4];
            // }
            ////////////////////
            for (var i = 0; i < 10; i++) {
                var playerDoc = playerDocArrC[i];
                if (playerDoc) {
                    var itemCtn = new createjs.Container();
                    this.itemArr.push(itemCtn);
                    itemCtn.y = i * 95 + 95;
                    if (!playerDoc.state || playerDoc.state == PlayerState1v1.FIGHTING)
                        playerDoc.state = PlayerState1v1.WAITING;
                    // if (playerDoc.state == PlayerState1v1.FIGHTING)
                    //     playerDoc.state = PlayerState1v1.WAITING;
                    var state = playerDoc.state;
                    var stateBg: Bitmap;
                    if (state == PlayerState1v1.FIGHTING) {
                        stateBg = new createjs.Bitmap('/img/panel/stage1v1/fighting.png');
                    }
                    else if (state == PlayerState1v1.WAITING) {
                        stateBg = new createjs.Bitmap('/img/panel/stage1v1/waiting.png');
                    }
                    else if (state == PlayerState1v1.Dead) {
                        stateBg = new createjs.Bitmap('/img/panel/stage1v1/dead.png');
                    }
                    else if (state == PlayerState1v1.PIGEON) {
                        stateBg = new createjs.Bitmap('/img/panel/stage1v1/pigeon.png');
                    }
                    stateBg.name = 'bg';
                    (itemCtn as any).playerDoc = playerDoc;
                    itemCtn.addChild(stateBg);
                    ctn.addChild(itemCtn);

                    var avatar = new createjs.Bitmap(playerDoc.avatar);
                    avatar.x = 10;
                    avatar.y = 10;
                    if (avatar.getBounds()) {
                        var scale = 70 / avatar.getBounds().height;
                        avatar.scaleX = avatar.scaleY = scale;
                    }
                    itemCtn.addChild(avatar);

                    // var backNumBg = new createjs.Bitmap('/img/panel/stage1v1/backNumBg.png');
                    // backNumBg.x = 122;
                    // backNumBg.y = stateBg.y + 7;
                    // ctn.addChild(backNumBg);
                    //
                    // var backNum = new createjs.Text(playerDoc.backNum || 30, "26px Arial", "#fff");
                    // backNum.textAlign = 'center';
                    // backNum.x = backNumBg.x + 27;
                    // backNum.y = backNumBg.y + 35;
                    // ctn.addChild(backNum);


                    var nameText = new createjs.Text(playerDoc.name, "28px Arial", "#fff");
                    nameText.textAlign = 'center';
                    nameText.x = 300;
                    nameText.y = 30;
                    itemCtn.addChild(nameText);

                    var winLoseText = new createjs.Text(playerDoc.winGameCount + '/' + playerDoc.loseGameCount, "32px Arial", "#fff");
                    winLoseText.textAlign = 'center';
                    winLoseText.x = 495;
                    winLoseText.y = nameText.y;
                    itemCtn.addChild(winLoseText);

                    var stateText = new createjs.Text(state, "28px Arial", "#fff");
                    stateText.name = 'stateText';
                    stateText.textAlign = 'left';
                    stateText.x = 675;
                    stateText.y = nameText.y;
                    itemCtn.addChild(stateText);

                    if (isOp) {
                        var idBtn = CreateJsEx.newBtn((e)=> {
                            // var item = e.target.parent.parent;
                            // item.playerDoc.state = PlayerState1v1.FIGHTING;
                            // eventCallback(item.playerDoc);
                        }, playerDoc.id + "");
                        idBtn.x = 180;
                        idBtn.y = 15;
                        itemCtn.addChild(idBtn);

                        var fightingBtn = CreateJsEx.newBtn((e)=> {
                            var item = e.target.parent.parent;
                            item.playerDoc.state = PlayerState1v1.FIGHTING;
                            eventCallback(item.playerDoc);
                        }, '战斗');
                        fightingBtn.x = 420;
                        fightingBtn.y = 15;
                        itemCtn.addChild(fightingBtn);

                        var waitingBtn = CreateJsEx.newBtn((e)=> {
                            var item = e.target.parent.parent;
                            item.playerDoc.state = PlayerState1v1.WAITING;
                            eventCallback(item.playerDoc);
                        }, '等待');
                        waitingBtn.x = 500;
                        waitingBtn.y = 15;
                        itemCtn.addChild(waitingBtn);

                        var deadBtn = CreateJsEx.newBtn((e)=> {
                            var item = e.target.parent.parent;
                            item.playerDoc.state = PlayerState1v1.Dead;
                            eventCallback(item.playerDoc);
                        }, '淘汰');
                        deadBtn.x = 580;
                        deadBtn.y = 15;
                        itemCtn.addChild(deadBtn);


                        var pigeonBtn = CreateJsEx.newBtn((e)=> {
                            var item = e.target.parent.parent;
                            item.playerDoc.state = PlayerState1v1.PIGEON;
                            eventCallback(item.playerDoc);
                        }, '鸽子');
                        pigeonBtn.x = 660;
                        pigeonBtn.y = fightingBtn.y;
                        itemCtn.addChild(pigeonBtn);
                    }
                }
            }
            return ctn;
        };
        var col1 = actColumn(playerDocArr.slice(this.curPage * 10, (this.curPage + 1) * 10));
        col1.x = 120;
        col1.y = 10;
        var col2 = actColumn(playerDocArr.slice((this.curPage + 1) * 10, (this.curPage + 2) * 10));
        col2.x = 1030;
        col2.y = col1.y;
        this.ctn.addChild(col1);
        this.ctn.addChild(col2);
    }

    updatePlayerState(newPlayerDoc: any) {
        console.log('updatePlayerState', newPlayerDoc);
        for (var i = 0; i < this.itemArr.length; i++) {
            var itemCtn = this.itemArr[i];
            if (itemCtn.playerDoc.id == newPlayerDoc.id) {
                itemCtn.playerDoc.state = newPlayerDoc.state;
                if (newPlayerDoc.state == PlayerState1v1.Dead) {
                    itemCtn.getChildByName('bg').image.src = '/img/panel/stage1v1/dead.png';
                    itemCtn.getChildByName('stateText').text = itemCtn.playerDoc.state;
                }
                else if (newPlayerDoc.state == PlayerState1v1.PIGEON) {
                    itemCtn.getChildByName('bg').image.src = '/img/panel/stage1v1/pigeon.png';
                    itemCtn.getChildByName('stateText').text = itemCtn.playerDoc.state;
                }
                else if (newPlayerDoc.state == PlayerState1v1.WAITING) {
                    itemCtn.getChildByName('bg').image.src = '/img/panel/stage1v1/waiting.png';
                    itemCtn.getChildByName('stateText').text = itemCtn.playerDoc.state;
                }
                else if (newPlayerDoc.state == PlayerState1v1.FIGHTING) {
                    itemCtn.getChildByName('bg').image.src = '/img/panel/stage1v1/fighting.png';
                    itemCtn.getChildByName('stateText').text = itemCtn.playerDoc.state;
                }
                break;
            }
        }
    }

    fadeInWinPanel(teamInfo: TeamInfo, mvpIdx, mpvId) {
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

            var winpercent: Text = new createjs.Text("胜率" + p.getWinPercent(), "18px Arial", col);
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