import Component from "vue-class-component";

export interface OpLinks extends vuejs.Vue {
}
@Component({
    template: require('./home.html')
})
export class OpLinks {
    links:{ title:string; url:string }[];

    ready() {
        
    }

    data():any {
        return {
            links: [
                {title: "stage op", url: "/panel/#!/stage/op"},
                {title: "stage ob", url: "/panel/#!/stage/ob"},
                {title: "stage op mobile", url: "/m/#!/panel/stage/op"}
            ]
        };
    }
}
