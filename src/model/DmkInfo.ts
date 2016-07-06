import {setPropTo} from "./BaseInfo";
export class DmkInfo {
    user:string;
    text:string;
    id:string;

    toJson() {
        var data:any = {};
        setPropTo(this, data);
        return data;
    }
}