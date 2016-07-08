declare var Materialize;
export class Notice {
    isShowDmk:boolean = true;

    constructor() {

    }

    fadeInSkill(user, count, playerName, skillName) {
        // if (this.isShow) {
        var $toastContent = $(`<span style="opacity: 0.6"><span style="color: #22b559">${user}</span>:为<span>${playerName}</span>送出<span style="color: #22b559">${count}</span>个<span style="color: #22b559;">${skillName}</span></span>`);
        Materialize.toast($toastContent, 10000, 'rounded');
        // }
    }

    toggleDmkShow(isShow) {
        if (isShow)
            $('#toast-container').show();
        else
            $('#toast-container').hide();
    }

    fadeInDmk(user, text) {
        // if (this.isShowDmk) {
        var $toastContent = $(`<span style="opacity: 0.6"><span style="color: #00a0ff">${user}</span>:${text}</span>`);
        Materialize.toast($toastContent, 5000, 'rounded dmkStyle');
        // }
    }
}