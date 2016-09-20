import Container = createjs.Container;
import {GameRkbInfo} from "../../../model/GameRkbInfo";
import {HEALTH_BAR_WIDTH} from "../../../model/PlayerRkbInfo";
import Shape = createjs.Shape;
import Sprite = createjs.Sprite;
import Bitmap = createjs.Bitmap;

class HealthBar extends Container {
    fxCtn: Container;
    easeSp: Shape;
    healthSp: Shape;
    is1p: Boolean;

    constructor(is1p: Boolean) {
        super();
        this.is1p = is1p;

        var bg = new Shape();
        bg.graphics.f('#242424').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.addChild(bg);

        this.fxCtn = new Container();
        this.addChild(this.fxCtn);

        this.easeSp = new Shape();
        this.easeSp.graphics.f('#c1242b').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.fxCtn.addChild(this.easeSp);

        this.healthSp = new Shape();
        this.healthSp.graphics.f('#fAEf59').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.fxCtn.addChild(this.healthSp);

        if (is1p) {
            this.easeSp.x = HEALTH_BAR_WIDTH;
            this.easeSp.scaleX = -1;

            this.healthSp.x = HEALTH_BAR_WIDTH;
            this.healthSp.scaleX = -1;
        }

        var mask = new Shape();
        mask.graphics.f('#000').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.fxCtn.mask = mask;
    }

    setHealth(hp: number) {
        var ofs = HEALTH_BAR_WIDTH - hp;
        if (this.is1p) {
            this.healthSp.x = HEALTH_BAR_WIDTH + ofs;
            createjs.Tween.get(this.easeSp).to({x: HEALTH_BAR_WIDTH + ofs}, 200);
        }
        else {
            this.healthSp.x = -ofs;
            createjs.Tween.get(this.easeSp).to({x: -ofs}, 200);
        }
    }
}
export class HealthPanel {
    ctn: Container;
    hpBar1p: HealthBar;
    hpBar2p: HealthBar;

    constructor(stage: any) {
        this.ctn = new Container();
        stage.addChild(this.ctn);
    }

    init(gameInfo: GameRkbInfo) {
        var bg = new Bitmap('/img/panel/rkb/healthBg.png');
        this.ctn.addChild(bg);
        ///health bar
        this.hpBar1p = new HealthBar(true);
        this.hpBar2p = new HealthBar(false);
        this.hpBar1p.x = 260;
        this.hpBar2p.x = 1015;
        this.hpBar1p.y = this.hpBar2p.y = 65;
        this.ctn.addChild(this.hpBar1p);
        this.ctn.addChild(this.hpBar2p);

    }

    attackHandle(param) {
        var target = param.target;
        if (target == 1) {
            this.hpBar1p.setHealth(param.hp);
        }
        else if (target == 2) {
            this.hpBar2p.setHealth(param.hp);
        }
    }
}