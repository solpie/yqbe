import Component from "vue-class-component";
import Vue = require('vue');

@Component({
    template: require('./footerbar.html'),
    props: {
        active: {
            type: String,
            default: ""
        }
    }
})
export class FooterBar extends Vue {
    public active:string
}
