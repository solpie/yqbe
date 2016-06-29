import {VueEx, Component} from "../../../VueEx";
import Stage = createjs.Stage;
/**
 * Activity
 */
var _this_:Activity;
declare var PDFJS;
@Component({
    template: require('./activity.html'),
    props: {
        playerId: {
            type: Number
        },
        teamArr: {
            type: Array
        }
    },
    watch: {
        playerId: (val)=> {
            console.log('playerId:', val);
            _this_.post('/db/player/' + val, function (param) {
                if (param.playerDoc) {

                }
            })
        }
    }
})
export class Activity extends VueEx {
    playerId:number;
    teamArr:any;
    stage:Stage;
    pdfData64:any;

    ready() {
        _this_ = this;
        console.log('Activity');
        this.teamArr = [];
        
        this.post('/admin/act/19', (res)=> {
            console.log(res);
            this.teamArr = res.gameDataArr;
        });
        
        PDFJS.getDocument('/img/gameSheet.pdf').then(function (pdf) {
            // Fetch the page.
            pdf.getPage(1).then(function (page) {
                var scale;
                scale = 1.48;
                scale = 2;
                var viewport = page.getViewport(scale);
                var canvas:any = document.getElementById('the-canvas');
                var context = canvas.getContext('2d');
                //A4 794×1123
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                // Render PDF page into canvas context.
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                //render take some sec
                page.render(renderContext);
            });

        });
    }

    onQueryPlayer(e) {
        console.log(e.target.value);
    }

    onPrintTeam(idx) {
        var gameData = this.teamArr[idx];
        console.log('print team', idx, gameData.playerDocArr);
        this.genPrint(gameData.playerDocArr, gameData.teamNum[0], gameData.teamNum[1]);
    }

    genPrint(playerDocArr, teamBlueNum, teamRedNum) {
        var nameBlueY = 515;
        var nameRedY = 560;
        var styleBlueY = 515;
        var styleRedY = 555;
        //
        // var py = 515;
        // var py2 = 560;
        // var py3 = 515;
        // var py4 = 555;
        if (!this.stage) {
            var canvas = document.getElementById('the-canvas');
            this.stage = new createjs.Stage(canvas);
            this.pdfData64 = this.stage.toDataURL('rgba(0,0,0,0)', "image/png")
        }
        var pdfData64 = this.pdfData64;
        var stage:Stage = this.stage;
        console.log("genPrint", playerDocArr);
        stage.removeAllChildren();
        var sheet = new createjs.Bitmap(pdfData64);
        stage.addChild(sheet);
        var map = {}
        map[1] = "风"
        map[2] = "林"
        map[3] = "火"
        map[4] = "山"
        function addName(start, posY, styleY) {
            // console.log("preview setting:", vue.nameSize, vue.nameX, vue.nameY);
//            var gameIdLabel = new createjs.Text(vue.selGameId, "30px Arial", "#000");
//            gameIdLabel.textAlign = 'center';
//            gameIdLabel.x = 220;
//            gameIdLabel.y = 500;
//            stage.addChild(gameIdLabel)

            var blueNum = new createjs.Text(`#：${teamBlueNum}`, "24px Arial", "#000");
            blueNum.x = 80;
            blueNum.y = 463;
            stage.addChild(blueNum);

            var redNum = new createjs.Text(`#：${teamRedNum}`, "24px Arial", "#000");
            redNum.x = blueNum.x;
            redNum.y = 821;
            stage.addChild(redNum);

            var invertY = 80;
            var styleInvertY = 80;
            for (var i = start; i < start + 4; i++) {
                var player = playerDocArr[i];

                var playerName = new createjs.Text(player.name, "30px Arial", "#000");
                playerName.textAlign = 'center';
                playerName.x = 220;
                playerName.y = posY + i * invertY;
                stage.addChild(playerName);

                var playerRealName = new createjs.Text(player.realName, "30px Arial", "#000");
                playerRealName.textAlign = 'center';
                playerRealName.x = 420;
                playerRealName.y = posY + i * invertY;
                stage.addChild(playerRealName);

//                var playerId = new createjs.Text(player.id + "", "20px Arial", "#000");
//                playerId.textAlign = 'right';
//                playerId.x = 670;
//                playerId.y = posY + i * (80 ) + invertY;
//                stage.addChild(playerId)

                var style = new createjs.Text("/" + map[player.style], "38px Arial", "#000");
                style.x = 670;
                style.y = styleY + i * invertY;
                stage.addChild(style)

                var style = new createjs.Text(`${player.size}`, "14px Arial", "#000");
                style.x = 600;
                style.y = styleY + i * styleInvertY + 45;
                stage.addChild(style)
            }
        }

        addName(0, nameBlueY, styleBlueY)
        addName(4, nameRedY, styleRedY)
        stage.update();
    }
}