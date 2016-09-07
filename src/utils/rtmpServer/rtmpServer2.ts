var Bits, StreamServer, config, logger, streamServer, url;

url = require('url');

config = require('./config');

StreamServer = require('./stream_server');

Bits = require('./bits');

logger = require('./logger');

Bits.set_warning_fatal(true);

var streamState = require('./streamState');

logger.setLevel(logger.LEVEL_INFO);
class SyncMsg {
    serverTimestamp: number;
    pushTimestamp: number;
}
class SyncInfo {
    streamStart: number;
    streamDuration: number;//current push timestamp
    playStart: number;
    playDuration: number;
    playDelay: number;

    syncMsgArr = [];
    _ts;

    startTimestampString() {
        if (!this._ts && this.streamStart) {
            var date = new Date(this.streamStart);
            this._ts = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        }
        return this._ts
    }
}
export var syncInfo = new SyncInfo();

export var startRtmpServer = ()=> {
    streamServer = new StreamServer;
    streamServer.on('push_video_data', (pushTs)=> {
        if (!syncInfo.streamStart)
            syncInfo.streamStart = new Date().getTime();
        syncInfo.streamDuration = Number(pushTs);
        // console.log('[push_video_data],start', syncInfo.startTimestampString(), 'push timestamp:', pushTs);
    });

    streamState.on('streamPlayDuration', (duration)=> {
        // if (!syncInfo.playStart)
        //     syncInfo.playStart = syncInfo.streamStart + syncInfo.streamDuration;
        // syncInfo.playDuration = duration;

    });

    streamState.on('PlayStart', (duration)=> {
        if (!syncInfo.playStart)
            syncInfo.playStart = syncInfo.streamStart + syncInfo.streamDuration;
        syncInfo.playDuration = duration - syncInfo.streamDuration;
        console.log('playStart duration:', syncInfo.playDuration);
    });

    streamServer.setLivePathConsumer(function (uri, callback) {
        var isAuthorized, pathname;
        pathname = url.parse(uri).pathname.slice(1);
        isAuthorized = true;
        if (isAuthorized) {
            return callback(null);
        } else {
            return callback(new Error('Unauthorized access'));
        }
    });

    if (config.recordedDir != null) {
        streamServer.attachRecordedDir(config.recordedDir);
    }

    process.on('SIGINT', (function () {
        return function () {
            console.log('Got SIGINT');
            return streamServer.stop(function () {
                return process.kill(process.pid, 'SIGTERM');
            });
        };
    })());

    process.on('uncaughtException', function (err) {
        streamServer.stop();
        throw err;
    });

    streamServer.start();
};
