import {ViewConst} from "../../event/Const";
export class CreateJsEx {
    static newBtn(func, text?) {
        var ctn = new createjs.Container();
        var btn = new createjs.Shape();
        var btnWidth = 75 * 1, btnHeight = 30 * 1;
        btn.graphics
            .beginFill("#3c3c3c")
            .drawRect(0, 0, btnWidth, btnHeight);
        btn.addEventListener("click", func);
        // btn.addEventListener("mousedown", func);
        ctn.addChild(btn);
        if (text) {
            var txt = new createjs.Text(text, "18px Arial", "#e2e2e2");
            txt.x = (btnWidth - txt.getMeasuredWidth()) * .3;
            txt.y = (btnHeight - txt.getMeasuredHeight()) * .3 - 5;
            txt.mouseEnabled = false;
            ctn.addChild(txt);
        }
        return ctn;
    }

    static newModal(alpha=0.3){
        var modal = new createjs.Shape();
        modal.graphics.beginFill('#000').drawRect(0, 0, ViewConst.STAGE_WIDTH, ViewConst.STAGE_HEIGHT);
        modal.alpha = alpha;
        return modal;
    }
}