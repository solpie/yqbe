import Container = createjs.Container;
import Shape = createjs.Shape;
import {loadImg} from "../../../utils/JsFunc";
import {Skill} from "./Skill";
import {PlayerInfo} from "../../../model/PlayerInfo";
import {SkillInfo} from "../../../model/SkillOP";
import Text = createjs.Text;
import BitmapText = createjs.BitmapText;
class Avatar extends Container {
    avatarCtn:Container;
    avatarMask:Shape;

    constructor(isBlue:boolean) {
        super();

        var avatarCtn = new createjs.Container();
        avatarCtn.x = 83;
        avatarCtn.y = 83;
        this.addChild(avatarCtn);
        this.avatarCtn = avatarCtn;

        var avatarMask = new createjs.Shape();
        avatarMask.graphics.beginFill('#000').drawCircle(0, 0, 82);
        this.avatarMask = avatarMask;
        if (isBlue)
            var frame = new createjs.Bitmap('/img/panel/stage/frameBlue.png');
        else
            var frame = new createjs.Bitmap('/img/panel/stage/frameRed.png');
        this.addChild(frame);
    }

    setAvatar(imgPath:string) {
        this.avatarCtn.removeAllChildren();
        loadImg(imgPath, ()=> {
            var img = new createjs.Bitmap(imgPath);
            var scale = 165 / img.getBounds().height;
            img.mask = this.avatarMask;
            img.x = -this.avatarCtn.x;
            img.y = -this.avatarCtn.y;
            img.scaleX = img.scaleY = scale;
            this.avatarCtn.addChild(img);
        });

    }
}
export class StagePanel extends Container {
    parent:any;
    avatarArr:Avatar[];
    playerNameArr:Text[] = [];
    leftBallText:Text;
    rightBallText:Text;
    skillArr:Skill[] = [];
    // leftNameText:Text;
    // rightNameText:Text;
    leftScoreText:BitmapText;
    rightScoreText:BitmapText;

    constructor(parent:any) {
        super();
        parent.addChild(this);

        var bg = new createjs.Bitmap('/img/panel/stage/bg.png');
        this.addChild(bg);

        this.avatarArr = [];
        var leftAvatar = new Avatar(false);
        leftAvatar.x = 85;
        leftAvatar.y = 812;
        this.addChild(leftAvatar);
        this.avatarArr.push(leftAvatar);

        var rightAvatar = new Avatar(true);
        rightAvatar.x = 1685;
        rightAvatar.y = leftAvatar.y;
        this.addChild(rightAvatar);
        this.avatarArr.push(rightAvatar);

        this.setAvatar(['/img/player/1001.png', '/img/player/1001.png']);


        var leftBallText = new createjs.Text("剩余球数：" + "", "32px Arial", "#fff");
        leftBallText.x = 255;
        leftBallText.y = 846;
        this.addChild(leftBallText);
        this.leftBallText = leftBallText;

        var rightBallText = new createjs.Text("剩余球数：" + "", "32px Arial", "#fff");
        rightBallText.x = 1450;
        rightBallText.y = leftBallText.y;
        this.addChild(rightBallText);
        this.rightBallText = rightBallText;

        var leftNameText = new createjs.Text("昵称：" + "", "40px Arial", "#fff");
        leftNameText.textAlign = 'center';
        leftNameText.x = 160;
        leftNameText.y = 980;
        this.addChild(leftNameText);
        this.playerNameArr.push(leftNameText);
        // this.leftNameText = leftNameText;

        var rightNameText = new createjs.Text("昵称：" + "", "40px Arial", "#fff");
        rightNameText.textAlign = 'center';
        rightNameText.x = 1765;
        rightNameText.y = leftNameText.y;
        this.addChild(rightNameText);
        this.playerNameArr.push(rightNameText);
        // this.rightNameText = rightNameText;

        var leftScoreText = this.newScoreNum();
        // new createjs.Text("9", "45px Roboto bold", "#ffe21f");
        // var leftScoreText = new createjs.Text("9", "45px Roboto bold", "#ffe21f");
        // leftScoreText = 'center';
        leftScoreText.x = 872;
        leftScoreText.y = 875;
        this.addChild(leftScoreText);
        this.leftScoreText = leftScoreText;

        var sScoreText = new createjs.Text(":", "45px Roboto bold", "#ffe21f");
        sScoreText.x = 955;
        sScoreText.y = 873;
        // this.addChild(sScoreText);

        var rightScoreText = this.newScoreNum();
        // rightScoreText.textAlign = 'center';
        rightScoreText.x = 1005;
        rightScoreText.y = leftScoreText.y;
        this.addChild(rightScoreText);
        this.rightScoreText = rightScoreText;


        var leftSkill = new Skill(true);
        leftSkill.x = 327;
        leftSkill.y = 905;
        this.skillArr.push(leftSkill);
        this.addChild(leftSkill);

        var rightSkill = new Skill(false);
        rightSkill.x = 1178;
        rightSkill.y = leftSkill.y;
        this.skillArr.push(rightSkill);
        this.addChild(rightSkill);
    }


    newScoreNum() {
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

    setPlayerInfo(idx:number, playerInfo:PlayerInfo) {
        this.avatarArr[idx].setAvatar(playerInfo.avatar());
        this.playerNameArr[idx].text = playerInfo.name();
    }

    setAvatar(imgPathArr:string[]) {
        for (var i = 0; i < imgPathArr.length; i++) {
            var imgPath = imgPathArr[i];
            this.avatarArr[i].setAvatar(imgPath);
        }
    }

    setLeftScore(score:number) {
        this.leftScoreText.text = `${score}`;
    }

    setRightScore(score:number) {
        this.rightScoreText.text = `${score}`;
    }


    setLeftBall(score:number) {
        this.leftBallText.text = `剩余球数：${score}`;
    }

    setRightBall(score:number) {
        this.rightBallText.text = `剩余球数：${score}`;
    }

    setLeftSkillInfoArr(skillInfoArr:any) {
        for (var i = 0; i < skillInfoArr.length; i++) {
            var skillInfo:SkillInfo = skillInfoArr[i];
            this.skillArr[0].setSkillNum(i, skillInfo.count);
            this.skillArr[0].skillIconArr[i].setSkillName(skillInfo.name);
        }
    }

    setRightSkillInfoArr(skillInfoArr:any) {
        for (var i = 0; i < skillInfoArr.length; i++) {
            var skillInfo:SkillInfo = skillInfoArr[i];
            this.skillArr[1].setSkillNum(i, skillInfo.count);
            this.skillArr[1].skillIconArr[i].setSkillName(skillInfo.name);
        }
    }
}