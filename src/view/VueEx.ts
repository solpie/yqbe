import Vue = require('vue');
import Component from "vue-class-component";
import HttpOptions = vuejs.HttpOptions;
export declare function Data(): PropertyDecorator
export {Component}
export class VueEx extends Vue {
    $parentMethods:any;

    ready() {
        this.$parentMethods = (this.$parent.$options as any).methods;
    }

    getAttr(e, propName) {
        var str:string = e.target.attributes[propName];
        var a = str.split('=');
        if (a.length === 2) {
            return a[1];
        }
        return null;
    }

    post(url:string, data?:any, option?:HttpOptions) {
        if (data)
            this.$http.post(url, data, option);
        else
            this.$http.post(url, option)
    }
    

    getElem(val:string):any {
        var _0 = val[0];
        if (_0 == "#") {
            return document.getElementById(val.substr(1));
        }
    }

}