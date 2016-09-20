import Container = createjs.Container;
import {GameRkbInfo} from "../../../model/GameRkbInfo";
import {HEALTH_BAR_WIDTH} from "../../../model/PlayerRkbInfo";
import Shape = createjs.Shape;
import Sprite = createjs.Sprite;
export class HealthBar {
    ctn: Container;
    healthBarEase1p: Shape;
    healthBar1p: Shape;
    healthCtn1p: Container;
    healthBarEase2p: Shape;
    healthBar2p: Shape;
    healthCtn2p: Container;

    constructor(stage: any) {
        this.ctn = new Container();
        stage.addChild(this.ctn);
    }

    init(gameInfo: GameRkbInfo) {
        this.healthCtn1p = new Container();
        this.ctn.addChild(this.healthCtn1p);

        var bg = new Shape();
        bg.graphics.f('#242424').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.healthCtn1p.addChild(bg);

        this.healthBarEase1p = new Shape();
        this.healthBarEase1p.x = HEALTH_BAR_WIDTH;
        this.healthBarEase1p.scaleX = -1;
        this.healthBarEase1p.graphics.f('#c1242b').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.healthCtn1p.addChild(this.healthBarEase1p);

        this.healthBar1p = new Shape();
        this.healthBar1p.x = HEALTH_BAR_WIDTH;
        this.healthBar1p.scaleX = -1;
        this.healthBar1p.graphics.f('#fAEf59').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.healthCtn1p.addChild(this.healthBar1p);

        var mask1p = new Shape();
        mask1p.graphics.f('#000').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.healthCtn1p.mask = mask1p;
        ///2p
        var bg = new Shape();
        bg.graphics.f('#242424').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.healthCtn2p.addChild(bg);

        this.healthCtn2p = new Container();
        this.ctn.addChild(this.healthCtn2p);
        this.healthCtn2p.x = 800;

        this.healthBarEase2p = new Shape();
        this.healthBarEase2p.graphics.f('#c1242b').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.healthCtn2p.addChild(this.healthBarEase2p);

        this.healthBar2p = new Shape();
        this.healthBar2p.graphics.f('#fAEf59').dr(0, 0, HEALTH_BAR_WIDTH, 45);
        this.healthCtn2p.addChild(this.healthBar2p);

        var mask2p = new Shape();
        mask2p.x = 800;
        mask2p.graphics.f('#000').drawRect(0, 0, HEALTH_BAR_WIDTH, 45);
        this.healthCtn2p.mask = mask2p;
    }

    attackHandle(param) {
        var target = param.target;
        if (target == 1) {
            this.setLeftHealth(param.hp);
        }
        else if (target == 2) {
            this.setRightHealth(param.hp);
        }
    }

    setLeftHealth(hp: number) {
        var ofs = HEALTH_BAR_WIDTH - hp;
        this.healthBar1p.x = HEALTH_BAR_WIDTH + ofs;
        createjs.Tween.get(this.healthBarEase1p).to({x: HEALTH_BAR_WIDTH + ofs}, 200);
    }

    setRightHealth(hp: number) {
        var ofs = HEALTH_BAR_WIDTH - hp;
        this.healthBar2p.x = -ofs;
        createjs.Tween.get(this.healthBarEase2p).to({x: -ofs}, 200);

    }
}