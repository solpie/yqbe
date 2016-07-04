import Container = createjs.Container;
import Shape = createjs.Shape;
import {loadImg} from "../../../utils/JsFunc";
import {Skill} from "./Skill";
import {PlayerInfo} from "../../../model/PlayerInfo";
import Text = createjs.Text;
class Avatar extends Container {
    avatarCtn:Container;
    avatarMask:Shape;

    constructor() {
        super();

        var avatarCtn = new createjs.Container();
        avatarCtn.x = 83;
        avatarCtn.y = 83;
        this.addChild(avatarCtn);
        this.avatarCtn = avatarCtn;

        var avatarMask = new createjs.Shape();
        avatarMask.graphics.beginFill('#000').drawCircle(0, 0, 82);
        this.avatarMask = avatarMask;

        var frame = new createjs.Bitmap('/img/panel/stage/frame.png');
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
    leftScoreText:Text;
    rightScoreText:Text;

    constructor(parent:any) {
        super();
        parent.addChild(this);

        var bg = new createjs.Bitmap('/img/panel/stage/bg.png');
        this.addChild(bg);

        this.avatarArr = [];
        var leftAvatar = new Avatar();
        leftAvatar.x = 85;
        leftAvatar.y = 812;
        this.addChild(leftAvatar);
        this.avatarArr.push(leftAvatar);

        var rightAvatar = new Avatar();
        rightAvatar.x = 1685;
        rightAvatar.y = leftAvatar.y;
        this.addChild(rightAvatar);
        this.avatarArr.push(rightAvatar);

        this.setAvatar(['/img/player/1001.png', '/img/player/1001.png']);


        var leftBallText = new createjs.Text("剩余球数：" + "", "35px Arial", "#fff");
        leftBallText.x = 255;
        leftBallText.y = 846;
        this.addChild(leftBallText);
        this.leftBallText = leftBallText;

        var rightBallText = new createjs.Text("剩余球数：" + "", "35px Arial", "#fff");
        rightBallText.x = 1450;
        rightBallText.y = leftBallText.y;
        this.addChild(rightBallText);
        this.rightBallText = rightBallText;

        var leftNameText = new createjs.Text("昵称：" + "", "18px Arial", "#fff");
        leftNameText.x = 80;
        leftNameText.y = 985;
        this.addChild(leftNameText);
        this.playerNameArr.push(leftNameText);
        // this.leftNameText = leftNameText;

        var rightNameText = new createjs.Text("昵称：" + "", "18px Arial", "#fff");
        rightNameText.x = 1685;
        rightNameText.y = leftNameText.y;
        this.addChild(rightNameText);
        this.playerNameArr.push(rightNameText);
        // this.rightNameText = rightNameText;

        var leftScoreText = new createjs.Text("9", "45px Roboto bold", "#ffe21f");
        leftScoreText.textAlign = 'center';
        leftScoreText.x = 897;
        leftScoreText.y = 875;
        this.addChild(leftScoreText);
        this.leftScoreText = leftScoreText;

        var sScoreText = new createjs.Text(":", "45px Roboto bold", "#ffe21f");
        sScoreText.x = 960;
        sScoreText.y = 873;
        this.addChild(sScoreText);

        var rightScoreText = new createjs.Text("6", "45px Roboto bold", "#ffe21f");
        rightScoreText.textAlign = 'center';
        rightScoreText.x = 1025;
        rightScoreText.y = sScoreText.y;
        this.addChild(rightScoreText);
        this.rightScoreText = rightScoreText;


        var leftSkill = new Skill(true);
        leftSkill.x = 400;
        leftSkill.y = 905;
        this.skillArr.push(leftSkill);
        this.addChild(leftSkill);

        var rightSkill = new Skill(false);
        rightSkill.x = 1178;
        rightSkill.y = leftSkill.y;
        this.skillArr.push(rightSkill);
        this.addChild(rightSkill);
    }

    setPlayerInfo(idx:number, playerInfo:PlayerInfo) {
        this.avatarArr[idx].setAvatar(playerInfo.avatar());
        this.playerNameArr[idx].text = '昵称：' + playerInfo.name();
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

}