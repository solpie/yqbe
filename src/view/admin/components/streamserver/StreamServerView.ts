import {Component, VueEx} from "../../../VueEx";
@Component({
    template: require('./streamserver.html'),
    props: {
        streamStart: {},
        streamDuration: {},
        playDuration: {},
    }
})
export class StreamServerView extends VueEx {
    streamStart: string;
    streamDuration: string;
    playDuration: string;
    delay:any;
    ready() {
        setInterval(()=> {
            this.$http.get('/admin/stream/state', (data)=> {
                console.log('state:', data);
                var date = new Date(data.streamStart);
                this.streamStart = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                this.streamDuration = data.duration / 1000 + "";
                this.playDuration = data.playDuration / 1000 + "";
            })
        }, 1);
    }

}