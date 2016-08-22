import Container = createjs.Container;
export class BaseScreen {
    ctn:Container;
    parent:any;
    show() {
        this.ctn.alpha = 1;
    }

    hide() {
        this.ctn.alpha = 0;
    }
}