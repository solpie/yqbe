import Component from "vue-class-component";
import {storageKey} from "../../constants";
import {Search} from "./search";
import {Profile} from "./profile";
import {VueEx} from "../../../VueEx";
import {ViewEvent} from "../../../../event/Const";
import {CommandId} from "../../../../event/Command";
@Component({
    template: require('./player.html'),
    components: {Search, Profile},
    route: {
        data(transition: vuejs.Transition<any, any, any, any, any>) {
            const date = new Date();
            const messages: any[] = JSON.parse(localStorage.getItem(storageKey)) || []
            transition.next({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                date: date.getDate(),
                messages: messages
            })
        }
    },
    props: {
        total: {},
        ftId: {},
        ftOptionArr: {
            type: Array,
            required: true,
            default: [{text: 'ft1', value: 1}]
        }
    }
})
export class Player extends VueEx {
    year: number;
    month: number;
    date: number;
    message: string;
    messages: { date: string; text: string }[];
    playerArr: {}[];

    pickPlayerIdArr: number[] = [];
    pickPlayerIdArrArr: Array<number[]> = [];
    countPage: number[];
    ftId;
    ftOptionArr;
    isOpen: boolean;
    total: number;

    playerMap: any;

    data(): any {
        return {
            year: 2015,
            month: 12,
            date: 4,
            message: "",
            messages: [],
            playerArr: [],
            pickPlayerIdArr: [],
            pickPlayerIdArrArr: [],
            countPage: [1],
            isOpen: false
        };
    }

    onClearActPlayerGameRec() {
        this.post(`/panel/stage1v1/${CommandId.cs_clearActPlayerGameRec}`)
    }

    ready() {
        console.log('player Ready!!');
        this.$http.post('/db/player', {all: true}).then((res)=> {
            console.log(JSON.stringify(res));
            // var a:Array<any> = [];
            var pageCount = 16;
            var count = 0;
            this.countPage = [1];
            this.playerMap = res.data.PlayerMap;
            for (var playerId in res.data.PlayerMap) {
                count++;
                if (count === pageCount) {
                    this.countPage.push(this.countPage.length + 1)
                }
                this.playerArr.push(res.data.PlayerMap[playerId]);
            }
        });

        this.$http.get('/db/ft', (res)=> {
            var ftArr = res.ftArr;
            this.ftOptionArr = [];
            for (var i = 0; i < ftArr.length; i++) {
                var ft = ftArr[i];
                this.ftOptionArr.push({text: ft.name, value: ft.id});
            }
            console.log('ft res:', res, this.ftOptionArr);
        });
    }

    onSaveToTotalScore() {
        this.post(`/panel/stage1v1/${CommandId.cs_saveToTotalScore}`)
    }

    onPickPlayer(playerId) {
        this.pickPlayerIdArr.push(playerId);
        if (this.pickPlayerIdArr.length == 4) {
            console.log('pick team');
            this.pickPlayerIdArrArr.push(this.pickPlayerIdArr);
            this.pickPlayerIdArr = [];
        }

        this.total = this.pickPlayerIdArrArr.length * 4 + this.pickPlayerIdArr.length;
    }

    showFile(files) {

    }

    onSubmit(msg) {
        console.log('onSubmit', msg)
    }

    onAddPlayer() {
        ($('#modal-player') as any).openModal();
        this.message = "添加球员";
        this.isOpen = true;
        this.$broadcast(ViewEvent.PLAYER_ADD, {ftOptionArr: this.ftOptionArr.concat()});
    }

    onAddPlayerList() {
        var a = [];
        for (var i = 0; i < this.pickPlayerIdArrArr.length; i++) {
            var playerIdArr = this.pickPlayerIdArrArr[i];
            a = a.concat(playerIdArr);
        }
        a = a.concat(this.pickPlayerIdArr);
        console.log('playerList', a);
        this.post(`/panel/stage1v1/${CommandId.cs_setActPlayer}`, {playerIdArr: a});
    }

    onEdit(playerId, event): any {
        event.stopPropagation();
        console.log("onEdit", playerId);
        ($('#modal-player') as any).openModal();
        this.message = "编辑球员";
        this.$broadcast(ViewEvent.PLAYER_EDIT, {playerId: playerId, ftOptionArr: this.ftOptionArr.concat()});
    }

    onFtSelected() {
        this.playerArr = [];
        for (var playerId in this.playerMap) {
            var playerDoc = this.playerMap[playerId];
            if (playerDoc.ftId == this.ftId)
                this.playerArr.push(playerDoc);
        }
    }


    get today(): string {
        return `${this.year}/${this.month}/${this.date}`;
    }

    get isToday(): boolean {
        return this.month === 12 && this.date === 4;
    }


    open() {
        this.message = "";
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    save() {
        const date = new Date();
        this.messages.push({
            date: `${date.getHours()}時${date.getMinutes()}分${date.getSeconds()}秒`,
            text: this.message
        });
        this.store();
        this.close();
    }

    store() {
        setTimeout(() => {
            localStorage.setItem(storageKey, JSON.stringify(this.messages));
        }, 0);
    }

    remove(item: { date: string, text: string }) {
        this.messages.$remove(item);
        this.store();
    }
}
