var Bits, StreamServer, config, logger, streamServer, url;

url = require('url');

config = require('./config');

StreamServer = require('./stream_server');

Bits = require('./bits');

logger = require('./logger');

Bits.set_warning_fatal(true);

logger.setLevel(logger.LEVEL_INFO);

export var startRtmpServer = ()=> {
    streamServer = new StreamServer;

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
}
