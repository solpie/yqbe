declare var Materialize;
export class Notice {
    isShow:boolean = true;

    constructor() {

    }

    fadeInSkill(user, count, playerName, skillName) {
        if (this.isShow) {
            var $toastContent = $(`<span><span style="color: #22b559">${user}</span>:为<span>${playerName}</span>送出<span style="color: #22b559">${count}</span>个<span style="color: #22b559;">${skillName}</span></span>`);
            Materialize.toast($toastContent, 10000, 'rounded');
        }
    }

    fadeInDmk(user, text) {
        if (this.isShow) {
            var $toastContent = $(`<span><span style="color: #00a0ff">${user}</span>:${text}</span>`);
            Materialize.toast($toastContent, 5000, 'rounded');
        }
    }
}