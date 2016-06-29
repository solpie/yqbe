import {VueEx} from "../../../VueEx";
import Component from "vue-class-component";
import {mapToSortArray, ascendingProp} from "../../../../utils/JsFunc";
var _this_:ExternalData;
@Component({
    template: require('./external-data.html'),
    route: {}
})
export class ExternalData extends VueEx {
    playerId:number;
    playerDocArr:any;
    pageArr:any;
    pageNumArr:any;
    playerArr:any;
    pagePlayerCount;

    data():any {
        return {
            playerArr: [],
            pageNumArr: [],
            pageArr: [1, 1, 1, 1],
        };
    }

    ready() {
        this.pagePlayerCount = 70;
        _this_ = this;
        var curPage;
        if (this.$route.params.page) {
            curPage = (Number(this.$route.params.page)) - 1;
        }
        else {
            curPage = 0;
        }
        // this.importDataFromHT();
        console.log('page', this.$route.params.page, curPage);
        this.post('/db/external/player', (param)=> {
            var playerInfoMap = param.playerInfoMap;
            this.playerDocArr = mapToSortArray(playerInfoMap, 'eloScore', ascendingProp);
            console.log('playerInfo map', this.playerDocArr.length);
            var countPage = Math.ceil(this.playerDocArr.length / 70);
            for (var i = 1; i < countPage; i++) {
                this.pageNumArr.push(i);
            }
            this.pageArr = this.playerDocArr.slice(curPage * this.pagePlayerCount,
                curPage * this.pagePlayerCount + this.pagePlayerCount - 1);
            console.log(this.pageArr[0]);
        });
        // this.pageArr1 = [1, 1, 1, 1, 1, 1];
    }

    onClkPageNum(pageNum) {
        console.log('pageNum', pageNum);
        var curPage = Number(pageNum) - 1;
        this.pageArr = this.playerDocArr.slice(curPage * this.pagePlayerCount,
            curPage * this.pagePlayerCount + this.pagePlayerCount - 1);

    }

    onList() {
    }

    importDataFromHT() {
        this.post('/db/external', (res)=> {
            console.log(res);
        })
    }
}