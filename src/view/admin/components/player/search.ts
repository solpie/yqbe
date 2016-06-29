import {VueEx, Component} from "../../../VueEx";

@Component({
    template: require('./search.html'),

    watch: {
        searchVal: ()=> {
            
        }
    }
})
export class Search extends VueEx {
    searchVal:string;

    data():any {
        return {
            searchVal: ''
        };
    }
}
