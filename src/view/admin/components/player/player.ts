import Component from "vue-class-component";
import {storageKey} from "../../constants";
import {Search} from "./search";
import {Profile} from "./profile";
import {VueEx} from "../../../VueEx";
import {ViewEvent} from "../../../../event/Const";
@Component({
    template: require('./player.html'),
    components: {Search, Profile},
    route: {
        data(transition:vuejs.Transition<any, any, any, any, any>) {
            const date = new Date();
            const messages:any[] = JSON.parse(localStorage.getItem(storageKey)) || []
            transition.next({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                date: date.getDate(),
                messages: messages
            })
        }
    }
})
export class Player extends VueEx {
    year:number;
    month:number;
    date:number;
    message:string;
    messages:{ date:string; text:string }[];
    playerArr:{}[];

    pickPlayerIdArr:number[] = [];
    pickPlayerIdArrArr:Array<number[]> = [];
    countPage:number[];
    isOpen:boolean;

    data():any {
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

    ready() {
        // ($('#modal1')as any).leanModal({
        //         dismissible: true, // Modaler can be dismissed by clicking outside of the modal
        //         opacity: .5, // Opacity of modal background
        //         in_duration: 300, // Transition in duration
        //         out_duration: 200, // Transition out duration
        //         ready: function () {
        //             alert('Ready');
        //         }, // Callback for Modaler open
        //         complete: function () {
        //             alert('Closed');
        //         } // Callback for Modaler close
        //     }
        // );
        console.log('player Ready!!');
        this.$http.post('/db/player', {all: true}).then((res)=> {
            console.log(JSON.stringify(res));
            // var a:Array<any> = [];
            var pageCount = 16;
            var count = 0;
            this.countPage = [1];
            for (var playerId in res.data.PlayerMap) {
                count++;
                if (count === pageCount) {
                    this.countPage.push(this.countPage.length + 1)
                }
                this.playerArr.push(res.data.PlayerMap[playerId]);
            }
        });
    }

    onPickPlayer(playerId) {
        this.pickPlayerIdArr.push(playerId);
        if (this.pickPlayerIdArr.length == 4) {
            console.log('pick team');
            this.pickPlayerIdArrArr.push(this.pickPlayerIdArr);
            this.pickPlayerIdArr=[];
        }
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
    }

    onEdit(playerId, event):any {
        event.stopPropagation();
        console.log("onEdit", playerId);
        ($('#modal-player') as any).openModal();
        this.message = "编辑球员";
        this.$broadcast(ViewEvent.PLAYER_EDIT, playerId);
    }


    get today():string {
        return `${this.year}/${this.month}/${this.date}`;
    }

    get isToday():boolean {
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

    remove(item:{ date:string, text:string }) {
        this.messages.$remove(item);
        this.store();
    }
}
