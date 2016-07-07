import Container = createjs.Container;
import BitmapText = createjs.BitmapText;
import {blink} from "../../../utils/Fx";
import Text = createjs.Text;

class SkillIcon extends Container {
    iconCtn:Container;
    skillCount:BitmapText;
    skillNameText:Text;

    constructor(isLeft:boolean) {
        super();
        this.iconCtn = new createjs.Container();
        this.addChild(this.iconCtn);

        if (isLeft)
            var skillX = new createjs.Bitmap('/img/panel/stage/skill/skillXRed.png');
        else
            var skillX = new createjs.Bitmap('/img/panel/stage/skill/skillX.png');
        skillX.x = 120;
        skillX.y = 50;
        this.addChild(skillX);
        var numPath = '/img/panel/stage/skill/skillNum.png';
        if(isLeft)
            numPath = '/img/panel/stage/skill/skillNumRed.png';
        var sheet = new createjs.SpriteSheet({
            animations: {
                "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
                "5": 5, "6": 6, "7": 7, "8": 8, "9": 9
            },
            images: [numPath],
            frames: [
                [0, 0, 24, 30],
                [25, 0, 24, 30],
                [0, 31, 24, 30],
                [25, 31, 24, 30],
                [50, 0, 24, 30],
                [50, 31, 24, 30],
                [0, 62, 24, 30],
                [25, 62, 24, 30],
                [50, 62, 24, 30],
                [75, 0, 24, 30]]
        });

        var skillCount = new createjs.BitmapText("0", sheet);
        skillCount.x = 152;
        skillCount.y = 42;
        this.addChild(skillCount);
        this.skillCount = skillCount;


        var skillNameText = new createjs.Text("", "25px Arial", "#fff");
        skillNameText.x = 115;
        skillNameText.y = 2;
        this.addChild(skillNameText);
        this.skillNameText = skillNameText;
    }

    setIcon(iconPath:string) {
        this.iconCtn.removeAllChildren();
        var img = new createjs.Bitmap(iconPath);
        this.iconCtn.addChild(img);
        // var img = new createjs.Bitmap('/img/panel/stage/skill/icon_1.png');

        //     loadImg(iconPath, ()=> {
        // });
    }

    setSkillName(skillName:string) {
        this.skillNameText.text = skillName;
    }

    setCount(count:number) {
        var curText = this.skillCount.text;
        if (curText != `${count}`) {
            blink(this.skillCount);
            blink(this.iconCtn);
        }
        this.skillCount.text = count + "";
    }
}
export class Skill extends Container {
    skillIconArr:SkillIcon[] = [];

    constructor(isLeft:boolean) {
        super();
        // var bg = new createjs.Shape();
        // bg.graphics.beginFill('#ff0000').drawRect(0, 0, 500, 100);
        // bg.alpha = .5;
        // this.addChild(bg);
        for (var i = 0; i < 2; i++) {
            var skillIcon = new SkillIcon(isLeft);
            if (isLeft)
                skillIcon.x = i * 254;
            else
                skillIcon.x = (1 - i) * 254;
            this.addChild(skillIcon);
            if (isLeft)
                skillIcon.setIcon(`/img/panel/stage/skill/icon_${i}Red.png`);
            else
                skillIcon.setIcon(`/img/panel/stage/skill/icon_${i}.png`);
            this.skillIconArr.push(skillIcon);
        }
    }

    setSkillNum(idx:number, count:number) {
        this.skillIconArr[idx].setCount(count);
    }


}