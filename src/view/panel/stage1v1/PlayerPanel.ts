/////////////////////////player panel
import {PlayerInfo} from "../../../model/PlayerInfo";
import {StagePlayerCard} from "../render/PlayerRender";
export class PlayerPanel {
    playerCardArr: StagePlayerCard[];

    constructor(parent: any, is2v2: boolean = false) {
        this.playerCardArr = [];
        var ctn = parent.scorePanel.ctn;
        var playerInfo = new PlayerInfo();
        var px = 25;
        var py = 12;
        var invert = 150;

        for (var i = 0; i < 1; i++) {
            var playerCard = new StagePlayerCard(playerInfo, 1, true, true);
            playerCard.delayShow(i * 600);
            playerCard.x = px + i * invert;
            playerCard.y = py;
            this.playerCardArr.push(playerCard);
            ctn.addChild(playerCard);
            if (is2v2) {
                playerCard.x += 450;
            }
        }
        px = 1249;
        for (var i = 0; i < 1; i++) {
            var playerCard = new StagePlayerCard(playerInfo, 1, false, true);
            playerCard.delayShow((3 - i) * 600);
            playerCard.x = px + i * invert;
            playerCard.y = py;
            this.playerCardArr.push(playerCard);
            ctn.addChild(playerCard);
            // if (is2v2) {
            //     if (i > 0)
            //         playerCard.parent.removeChild(playerCard);
            // }
        }
    }

    setEloScore(idx: number, eloScore: number) {
        this.playerCardArr[idx].setEloScore(eloScore);
    }

    setPlayer(idx: number, playerInfo: PlayerInfo, isKing = false) {
        var playerCard = this.playerCardArr[idx];
        playerCard.setPlayerInfo(playerInfo, 1, playerCard.isBlue);
        if (isKing) {
            this.playerCardArr[idx].setKingLabel();
        }
    }


    init(gameDoc) {
        for (var i = 0; i < gameDoc.playerInfoArr.length; i++) {
            if (gameDoc.playerInfoArr[i]) {
                // var playerInfo:PlayerInfo = new PlayerInfo(gameDoc.playerInfoArr[i]);
                var playerInfo = new PlayerInfo(gameDoc.playerInfoArr[i]);
                this.setPlayer(i, playerInfo);
                if (playerInfo.id() == gameDoc.kingPlayer) {
                    this.playerCardArr[i].setKingLabel();
                }
            }
        }
    }
}