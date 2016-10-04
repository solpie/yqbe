class Linker {
    idx: number;//
    playerId: number;//
    isDead: boolean;//淘汰
    next: Linker;
}
export class LinkerInfo {
    linkerArr: Array<Linker>;
    cursor: Linker;

    constructor(playerIdStateArr) {
        this.linkerArr = [];
        var lastQueObj: Linker;
        for (var i = 0; i < playerIdStateArr.length; i++) {
            var pis = playerIdStateArr[i];
            var playerId = pis.playerId;
            var linker = new Linker();

            linker.isDead = pis.isDead;
            linker.idx = i;
            linker.playerId = playerId;
            if (lastQueObj) {
                lastQueObj.next = linker;
            }
            lastQueObj = linker;
            this.linkerArr.push(linker);
        }
        linker.next = this.linkerArr[0];
        //
        for (var i = 0; i < this.linkerArr.length; i++) {
            var queObj = this.linkerArr[i];
            console.log('linker:', queObj.playerId, "next", queObj.next.playerId);
        }
    }


    setCursorByPlayerId(playerId) {
        var linker = this._getLinkerByPlayerId(playerId);
        if (linker) {
            this.cursor = linker;
        }
        else
            throw "no player in que";
    }

    setPlayerDead(playerId) {
        var linker = this._getLinkerByPlayerId(playerId);
        if (linker) {
            linker.isDead = true;
        }
        else
            throw "no player in que";
    }

    _getLinkerByPlayerId(playerId) {
        for (var i = 0; i < this.linkerArr.length; i++) {
            var linker: Linker = this.linkerArr[i];
            if (linker.playerId == playerId) {
                return linker;
            }
        }
        return null;
    }

    _findNextPlayerId() {
        for (var i = 0; i < this.linkerArr.length; i++) {
            this.cursor = this.cursor.next;
            if (!this.cursor.isDead)
                return this.cursor.playerId;
        }
    }

    getPlayerIdArr(hasDead: boolean) {
        // var cursorQue: Linker = this._getCursor();
        if (this.cursor) {
            var playerIdArr = [];
            var playerId = this._findNextPlayerId();
            playerIdArr.push(playerId);
            if (hasDead)//find two
            {
                playerIdArr.push(this._findNextPlayerId());
            }
            return playerIdArr;

        }
        else {
            this.cursor = this.linkerArr[1];//.isCursor = true;
            return [this.linkerArr[0].playerId, this.linkerArr[1].playerId]
        }
    }

}