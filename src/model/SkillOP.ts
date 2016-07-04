export class SkillOP {
    static ADD:string = '++';
    static MIN:string = '--';
    idx:number;
    op:string;

    toJson() {
        return {idx: this.idx, op: this.op};
    }
}


export class SkillInfo {
    idx:number = 0;
    name:string;
    count:number = 0;
    used:number = 0;

    constructor(name:string) {
        this.name = name;
    }
}