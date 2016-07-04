import Container = createjs.Container;
export class Skill extends Container {
    iconCtn:Container;
    constructor() {
        super();
        this.iconCtn = new createjs.Container();
        this.addChild(this.iconCtn);

        var skillX = new createjs.Bitmap('/img/panel/stage/skillX.png');

    }
}