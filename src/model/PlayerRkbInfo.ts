export var HEALTH_BAR_WIDTH = 647;
export class PlayerRkbInfo {
    name: string;
    avatar: string;
    hp: number;
    attack: number = 0;
    combo: number = 0;

    constructor(ad: number) {
        this.attack = ad;
        this.hp = HEALTH_BAR_WIDTH;
    }
}