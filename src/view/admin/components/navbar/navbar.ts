import Component from "vue-class-component";
import Vue = require('vue');

@Component({
    template: require('./navbar.html'),
    props: {
        active: {
            type: String,
            default: ""
        }
    }
})
export class Navbar extends Vue {
    public active:string
}
