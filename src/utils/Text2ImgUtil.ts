export class Text2ImgUtil {
    stageNotice:any;
    canvas:any;
    constructor() {
        var stageWidth = 8000;
        var stageHeight = 60;
        var canvas = document.createElement("CANVAS");
        // var canvas = document.getElementById("textCanvas");
        canvas.setAttribute("width", stageWidth + "");
        canvas.setAttribute("height", stageHeight + "");
        this.canvas = canvas;
        this.stageNotice  = new createjs.Stage(canvas);
    }

    getNoticeImg(content) {
        this.stageNotice.removeAllChildren();
        var noticeLabel = new createjs.Text(content, "35px Arial", "#fff");
        this.stageNotice.addChild(noticeLabel);
        this.canvas.setAttribute("width", noticeLabel.getBounds().width + "");
        this.stageNotice.cache(0, 0, noticeLabel.getBounds().width, 60);
        this.stageNotice.update();
        var data = this.stageNotice.toDataURL('rgba(0,0,0,0)', "image/png");
        // base64ToPng('img/text.png', data);
        return data;
    }
}
export var text2ImgUtil = new Text2ImgUtil();