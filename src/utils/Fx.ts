export function delayCall(delay, callback) {
    createjs.Tween.get(this).wait(delay).call(callback);
    // setTimeout(callback, delay/1000);
}

// export function delayFor(start,len,func) {
//     createjs.Tween.get(this).wait(delay, callback);
// }
export function blink(target, time = 80, loop = false) {
    var blink = time;
    createjs.Tween.get(target, {loop: loop})
        .to({alpha: 1}, blink)
        .to({alpha: 0}, blink)
        .to({alpha: 1}, blink)
        .to({alpha: 0}, blink)
        .to({alpha: 1}, blink);
}


export function fadeOutCtn(ctn) {
    console.log(this, "show fade Out WinPanel");
    createjs.Tween.get(ctn).to({alpha: 0}, 200)
        .call(function () {
            ctn.alpha = 1;
            ctn.removeAllChildren();
        });
}