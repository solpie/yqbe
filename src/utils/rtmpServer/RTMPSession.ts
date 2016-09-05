import {
    generateNewClientID,
    SESSION_STATE_NEW,
    createRTMPMessage,
    TIMESTAMP_ROUNDOFF,
    createRTMPType1Message,
    createAMF0Data,
    slice,
    createAMF0CommandMessage,
    createAMF0Object,
    createAudioMessage,
    createVideoMessage,
    createAMF0DataMessage,
    clearQueuedRTMPMessages,
    SESSION_STATE_HANDSHAKE_ONGOING,
    SESSION_STATE_HANDSHAKE_DONE,
    DEBUG_INCOMING_RTMP_PACKETS,
    parseAcknowledgementMessage,
    parseUserControlMessage,
    parseAMF0DataMessage,
    parseAMF0CommandMessage
} from "./rtmpFunc";
var flv = require('./flv');
var logger = require('./logger');
var h264 = require('./h264');
var aac = require('./aac');
var config = require('./config');
var avstreams = require('./avstreams');
var codec_utils = require('./codec_utils');
var crypto = require('./crypto');
var url = require('url');
var rtmp_handshake = require('./rtmp_handshake');
var Sequent = require('sequent');
var Bits = require('./bits');


class RTMPSession {
    listeners = {};
    state = SESSION_STATE_NEW;
    socket;
    chunkSize = 128;
    receiveChunkSize = 128;
    previousChunkMessage = {};
    isPlaying = false;
    clientid = generateNewClientID();
    useEncryption = false;
    receiveTimestamp = null;
    windowAckSize = null;
    lastSentAckBytes = 0;
    receivedBytes = 0;
    stream = null;
    seekedDuringPause = false;
    lastSentTimestamp = null;
    isResuming = false;

    constructor(socket) {
        logger.debug("[rtmp] created a new session");
        this.socket = socket;
    }

    toString() {
        return this.clientid + ": addr=" + this.socket.remoteAddress + " port=" + this.socket.remotePort;
    };

    startPlaying() {
        this.isPlaying = true;
        return this.isResuming = false;
    };

    avcInfo;

    parseVideoMessage(buf) {
        var info, isEOS, nalUnitGlob, nalUnits, pps, sps;
        info = flv.parseVideo(buf);
        nalUnitGlob = null;
        isEOS = false;
        switch (info.videoDataTag.avcPacketType) {
            case flv.AVC_PACKET_TYPE_SEQUENCE_HEADER:
                this.avcInfo = info.avcDecoderConfigurationRecord;
                if (this.avcInfo.numOfSPS > 1) {
                    // logger.warn("warn: flv:parseVideo(): numOfSPS is " + numOfSPS + " > 1 (may not work)");
                }
                if (this.avcInfo.numOfPPS > 1) {
                    // logger.warn("warn: flv:parseVideo(): numOfPPS is " + numOfPPS + " > 1 (may not work)");
                }
                sps = h264.concatWithStartCodePrefix(this.avcInfo.sps);
                pps = h264.concatWithStartCodePrefix(this.avcInfo.pps);
                nalUnitGlob = Buffer.concat([sps, pps]);
                break;
            case flv.AVC_PACKET_TYPE_NALU:
                if (this.avcInfo == null) {
                    throw new Error("[rtmp:publish] malformed video data: avcInfo is missing");
                }
                nalUnits = flv.splitNALUnits(info.nalUnits, this.avcInfo.nalUnitLengthSize);
                nalUnitGlob = h264.concatWithStartCodePrefix(nalUnits);
                break;
            case flv.AVC_PACKET_TYPE_EOS:
                isEOS = true;
                break;
            default:
                throw new Error("unknown AVCPacketType: " + flv.AVC_PACKET_TYPE_SEQUENCE_HEADER);
        }
        return {
            info: info,
            nalUnitGlob: nalUnitGlob,
            isEOS: isEOS
        };
    };

    parseAudioMessage(buf) {
        var adtsFrame, adtsHeader, info, stream;
        info = flv.parseAudio(buf);
        adtsFrame = null;
        stream = this.stream;
        if (stream == null) {
            throw new Error("[rtmp] Stream not set for this session");
        }
        switch (info.audioDataTag.aacPacketType) {
            case flv.AAC_PACKET_TYPE_SEQUENCE_HEADER:
                if (info.audioSpecificConfig != null) {
                    stream.updateConfig({
                        audioSpecificConfig: info.audioSpecificConfig,
                        audioASCInfo: info.ascInfo
                    });
                } else {
                    logger.warn("[rtmp] skipping empty AudioSpecificConfig");
                }
                break;
            case flv.AAC_PACKET_TYPE_RAW:
                if (stream.audioASCInfo == null) {
                    logger.error("[rtmp:publish] malformed audio data: AudioSpecificConfig is missing");
                }
                adtsHeader = new Buffer(aac.createADTSHeader(stream.audioASCInfo, info.rawDataBlock.length));
                adtsFrame = Buffer.concat([adtsHeader, info.rawDataBlock]);
                break;
            default:
                throw new Error("[rtmp:publish] unknown AAC_PACKET_TYPE: " + info.audioDataTag.aacPacketType);
        }
        return {
            info: info,
            adtsFrame: adtsFrame
        };
    };

    timeoutTimer: any;

    clearTimeout() {
        if (this.timeoutTimer != null) {
            clearTimeout(this.timeoutTimer);
            return this.timeoutTimer = null;
        }
    };

    isTearedDown: any;
    lastTimeoutScheduledTime: any;

    scheduleTimeout() {
        if (this.isTearedDown) {
            return;
        }
        this.clearTimeout();
        this.lastTimeoutScheduledTime = Date.now();
        return this.timeoutTimer = setTimeout((function (_this2) {
            return function () {
                if (_this2.isTearedDown) {
                    return;
                }
                if (_this2.timeoutTimer == null) {
                    return;
                }
                if (Date.now() - _this2.lastTimeoutScheduledTime < config.rtmpSessionTimeoutMs) {
                    return;
                }
                logger.info("[rtmp:client=" + _this2.clientid + "] session timeout");
                return _this2.teardown();
            };
        })(this), config.rtmpSessionTimeoutMs);
    };

    lastPingScheduledTime: any;
    pingTimer: any;

    schedulePing() {
        this.lastPingScheduledTime = Date.now();
        if (this.pingTimer != null) {
            clearTimeout(this.pingTimer);
        }
        return this.pingTimer = setTimeout((function (_this2) {
            return function () {
                if (Date.now() - _this2.lastPingScheduledTime < config.rtmpPingTimeoutMs) {
                    logger.debug("[rtmp] ping timeout canceled");
                }
                return _this2.ping();
            };
        })(this), config.rtmpPingTimeoutMs);
    };

    ping() {
        var currentTimestamp, pingRequest;
        currentTimestamp = this.getCurrentTimestamp();
        pingRequest = createRTMPMessage({
            chunkStreamID: 2,
            timestamp: currentTimestamp,
            messageTypeID: 0x04,
            messageStreamID: 0,
            body: new Buffer([0, 6, (currentTimestamp >> 24) & 0xff, (currentTimestamp >> 16) & 0xff, (currentTimestamp >> 8) & 0xff, currentTimestamp & 0xff])
        });
        return this.sendData(pingRequest);
    };

    isWaitingForKeyFrame;

    stopPlaying() {
        this.isPlaying = false;
        return this.isWaitingForKeyFrame = false;
    };

    cipherIn;
    cipherOut;

    teardown() {
        var base, e, error, ref;
        if (this.isTearedDown) {
            logger.debug("[rtmp] already teared down");
            return;
        }
        this.isTearedDown = true;
        this.clearTimeout();
        this.stopPlaying();
        if (((ref = this.stream) != null ? ref.type : void 0) === avstreams.STREAM_TYPE_RECORDED) {
            if (typeof (base = this.stream).teardown === "function") {
                base.teardown();
            }
        }
        if (this.cipherIn != null) {
            this.cipherIn.final();
            this.cipherIn = null;
        }
        if (this.cipherOut != null) {
            this.cipherOut.final();
            this.cipherOut = null;
        }
        try {
            this.socket.end();
        } catch (error) {
            e = error;
            logger.error("[rtmp] socket.end error: " + e);
        }
        return this.emit('teardown');
    };

    playStartDateTime;

    getCurrentTimestamp() {
        return Date.now() - this.playStartDateTime;
    };

    playStartTimestamp;

    getScaledTimestamp(timestamp) {
        var ts;
        ts = timestamp - this.playStartTimestamp;
        if (ts < 0) {
            ts = 0;
        }
        return ts;
    };

    createVideoMessage(params) {
        params.chunkStreamID = 4;
        params.messageTypeID = 0x09;
        params.messageStreamID = 1;
        return this.createAVMessage(params);
    };

    createAudioMessage(params) {
        params.chunkStreamID = 4;
        params.messageTypeID = 0x08;
        params.messageStreamID = 1;
        return this.createAVMessage(params);
    };

    lastAVTimestamp;

    createAVMessage(params) {
        var msg, thisTimestamp;
        thisTimestamp = this.getScaledTimestamp(params.timestamp);
        if ((this.lastAVTimestamp != null) && params.body.length <= this.chunkSize) {
            params.timestampDelta = (thisTimestamp - this.lastAVTimestamp) % TIMESTAMP_ROUNDOFF;
            msg = createRTMPType1Message(params);
        } else {
            msg = createRTMPMessage(params, this.chunkSize);
        }
        this.lastAVTimestamp = thisTimestamp;
        return msg;
    };

    concatenate(arr) {
        var i, item, j, len, len1;
        if (Buffer.isBuffer(arr)) {
            return arr;
        }
        if (!(arr instanceof Array)) {
            return;
        }
        len = 0;
        for (i = j = 0, len1 = arr.length; j < len1; i = ++j) {
            item = arr[i];
            if (item != null) {
                len += item.length;
            } else {
                arr[i] = new Buffer(0);
            }
        }
        return Buffer.concat(arr, len);
    };

    emit() {
        var args, event, j, len1, listener, ref;
        event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        if (this.listeners[event] == null) {
            return;
        }
        ref = this.listeners[event];
        for (j = 0, len1 = ref.length; j < len1; j++) {
            listener = ref[j];
            listener.apply(null, args);
        }
    };

    on(event, listener) {
        if (this.listeners[event] == null) {
            this.listeners[event] = [listener];
        } else {
            this.listeners[event].push(listener);
        }
    };

    removeListener(event, listener) {
        var _listener, actualIndex, i, j, len1, listeners, ref, removedCount;
        listeners = this.listeners[event];
        if (listeners == null) {
            return;
        }
        removedCount = 0;
        for (i = j = 0, len1 = listeners.length; j < len1; i = ++j) {
            _listener = listeners[i];
            if (_listener === listener) {
                logger.debug("[rtmp] removed listener for " + event);
                actualIndex = i - removedCount;
                [].splice.apply(listeners, [actualIndex, actualIndex - actualIndex + 1].concat(ref = [])), ref;
                removedCount++;
            }
        }
    };

    sendData(arr) {
        var buf, item, j, len, len1;
        if (arr == null) {
            return;
        }
        if (Buffer.isBuffer(arr)) {
            buf = arr;
        } else {
            len = 0;
            for (j = 0, len1 = arr.length; j < len1; j++) {
                item = arr[j];
                len += item.length;
            }
            buf = Buffer.concat(arr, len);
        }
        if (this.useEncryption) {
            buf = this.encrypt(buf);
        }
        return this.emit('data', buf);
    };

    app;//fixme:??? this.app what?
    rejectConnect(commandMessage, callback) {
        var _error, close, streamBegin0;
        streamBegin0 = createRTMPMessage({
            chunkStreamID: 2,
            timestamp: 0,
            messageTypeID: 0x04,
            messageStreamID: 0,
            body: new Buffer([0, 0, 0, 0, 0, 0])
        });
        _error = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: '_error',
            transactionID: 1,
            objects: [
                createAMF0Data(null), createAMF0Object({
                    level: 'error',
                    code: 'NetConnection.Connect.Rejected',
                    description: "[ Server.Reject ] : (_defaultRoot_, ) : Invalid application name(/" + this.app + ")."
                })
            ]
        });
        close = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: 'close',
            transactionID: 0,
            objects: [createAMF0Data(null)]
        });
        return callback(null, this.concatenate([streamBegin0, _error, close]));
    };

    respondConnect = function (commandMessage, callback) {
        var app, connectResult, onBWDone, ref, setPeerBandwidth, streamBegin0, windowAck;
        app = commandMessage.objects[0].value.app;
        app = app.replace(/\/$/, '');
        this.app = app;
        if ((app !== config.liveApplicationName) && (app !== config.recordedApplicationName)) {
            logger.warn("[rtmp:client=" + this.clientid + "] requested invalid app name: " + app);
            this.rejectConnect(commandMessage, callback);
            return;
        }
        windowAck = createRTMPMessage({
            chunkStreamID: 2,
            timestamp: 0,
            messageTypeID: 0x05,
            messageStreamID: 0,
            body: new Buffer([0, 0x26, 0x25, 0xa0])
        });
        setPeerBandwidth = createRTMPMessage({
            chunkStreamID: 2,
            timestamp: 0,
            messageTypeID: 0x06,
            messageStreamID: 0,
            body: new Buffer([0, 0x26, 0x25, 0xa0, 0x02])
        });
        streamBegin0 = createRTMPMessage({
            chunkStreamID: 2,
            timestamp: 0,
            messageTypeID: 0x04,
            messageStreamID: 0,
            body: new Buffer([0, 0, 0, 0, 0, 0])
        });
        connectResult = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: '_result',
            transactionID: 1,
            objects: [
                createAMF0Object({
                    fmsVer: 'FMS/3,0,4,423',
                    capabilities: 31
                }), createAMF0Object({
                    level: 'status',
                    code: 'NetConnection.Connect.Success',
                    description: 'Connection succeeded.',
                    objectEncoding: (ref = this.objectEncoding) != null ? ref : 0
                })
            ]
        });
        onBWDone = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: 'onBWDone',
            transactionID: 0,
            objects: [createAMF0Data(null)]
        });
        return callback(null, this.concatenate([windowAck, setPeerBandwidth, streamBegin0, connectResult, onBWDone]));
    };

    encrypt = function (data) {
        var isSingleByte, result;
        isSingleByte = typeof data === 'number';
        if (isSingleByte) {
            data = new Buffer([data]);
        }
        result = this.cipherIn.update(data);
        if (isSingleByte) {
            return result[0];
        } else {
            return result;
        }
    };

    decrypt = function (data) {
        var isSingleByte, result;
        isSingleByte = typeof data === 'number';
        if (isSingleByte) {
            data = new Buffer([data]);
        }
        result = this.cipherOut.update(data);
        if (isSingleByte) {
            return result[0];
        } else {
            return result;
        }
    };
    clientPublicKey;
    dh;
    sharedSecret;
    keyOut;
    keyIn;

    respondHandshake(c0c1, callback) {
        return rtmp_handshake.generateS0S1S2(c0c1, (function (_this2) {
            return function (err, s0s1s2, keys) {
                var type, zeroBytes;
                type = s0s1s2[0];
                if (type === 6) {
                    _this2.useEncryption = true;
                    logger.info("[rtmp:client=" + _this2.clientid + "] enabled encryption");
                    _this2.clientPublicKey = keys.clientPublicKey;
                    _this2.dh = keys.dh;
                    _this2.sharedSecret = _this2.dh.computeSecret(_this2.clientPublicKey);
                    _this2.keyOut = codec_utils.calcHmac(_this2.dh.getPublicKey(), _this2.sharedSecret).slice(0, 16);
                    _this2.keyIn = codec_utils.calcHmac(_this2.clientPublicKey, _this2.sharedSecret).slice(0, 16);
                    _this2.cipherOut = crypto.createCipheriv('rc4', _this2.keyOut, '');
                    _this2.cipherIn = crypto.createCipheriv('rc4', _this2.keyIn, '');
                    zeroBytes = new Buffer(1536);
                    zeroBytes.fill(0);
                    _this2.encrypt(zeroBytes);
                    _this2.decrypt(zeroBytes);
                }
                return callback(null, s0s1s2);
            };
        })(this));
    };

    parseRTMPMessages(rtmpMessage) {
        var chunkBasicHeader, chunkBody, chunkMessageHeader, chunkPayloadSize, consumedLen, headerLen, message, messages, previousChunk, remainingMessageLen;
        messages = [];
        consumedLen = 0;
        while (rtmpMessage.length > 1) {
            headerLen = 0;
            message = {};
            chunkBasicHeader = rtmpMessage[0];
            message.formatType = chunkBasicHeader >> 6;
            message.chunkStreamID = chunkBasicHeader & 0x3f;
            if (message.chunkStreamID === 0) {
                if (rtmpMessage.length < 2) {
                    break;
                }
                message.chunkStreamID = rtmpMessage[1] + 64;
                chunkMessageHeader = rtmpMessage.slice(2);
                headerLen += 2;
            } else if (message.chunkStreamID === 1) {
                if (rtmpMessage.length < 3) {
                    break;
                }
                message.chunkStreamID = (rtmpMessage[1] << 8) + rtmpMessage[2] + 64;
                chunkMessageHeader = rtmpMessage.slice(3);
                headerLen += 3;
            } else {
                chunkMessageHeader = rtmpMessage.slice(1);
                headerLen += 1;
            }
            if (message.formatType === 0) {
                if (chunkMessageHeader.length < 11) {
                    break;
                }
                message.timestamp = (chunkMessageHeader[0] << 16) + (chunkMessageHeader[1] << 8) + chunkMessageHeader[2];
                message.timestampDelta = 0;
                message.messageLength = (chunkMessageHeader[3] << 16) + (chunkMessageHeader[4] << 8) + chunkMessageHeader[5];
                message.messageTypeID = chunkMessageHeader[6];
                message.messageStreamID = chunkMessageHeader.readInt32LE(7);
                chunkBody = chunkMessageHeader.slice(11);
                headerLen += 11;
            } else if (message.formatType === 1) {
                if (chunkMessageHeader.length < 7) {
                    break;
                }
                message.timestampDelta = (chunkMessageHeader[0] << 16) + (chunkMessageHeader[1] << 8) + chunkMessageHeader[2];
                message.messageLength = (chunkMessageHeader[3] << 16) + (chunkMessageHeader[4] << 8) + chunkMessageHeader[5];
                message.messageTypeID = chunkMessageHeader[6];
                previousChunk = this.previousChunkMessage[message.chunkStreamID];
                if (previousChunk != null) {
                    message.timestamp = previousChunk.timestamp;
                    message.messageStreamID = previousChunk.messageStreamID;
                } else {
                    throw new Error(this.clientid + ": Chunk reference error for type 1: previous chunk for id " + message.chunkStreamID + " is not found (possibly a bug)");
                }
                chunkBody = chunkMessageHeader.slice(7);
                headerLen += 7;
            } else if (message.formatType === 2) {
                if (chunkMessageHeader.length < 3) {
                    break;
                }
                message.timestampDelta = (chunkMessageHeader[0] << 16) + (chunkMessageHeader[1] << 8) + chunkMessageHeader[2];
                previousChunk = this.previousChunkMessage[message.chunkStreamID];
                if (previousChunk != null) {
                    message.timestamp = previousChunk.timestamp;
                    message.messageStreamID = previousChunk.messageStreamID;
                    message.messageLength = previousChunk.messageLength;
                    message.messageTypeID = previousChunk.messageTypeID;
                } else {
                    throw new Error(this.clientid + ": Chunk reference error for type 2: previous chunk for id " + message.chunkStreamID + " is not found (possibly a bug)");
                }
                chunkBody = chunkMessageHeader.slice(3);
                headerLen += 3;
            } else if (message.formatType === 3) {
                previousChunk = this.previousChunkMessage[message.chunkStreamID];
                if (previousChunk != null) {
                    message.timestamp = previousChunk.timestamp;
                    message.messageStreamID = previousChunk.messageStreamID;
                    message.messageLength = previousChunk.messageLength;
                    message.timestampDelta = previousChunk.timestampDelta;
                    message.messageTypeID = previousChunk.messageTypeID;
                } else {
                    throw new Error(this.clientid + ": Chunk reference error for type 3: previous chunk for id " + message.chunkStreamID + " is not found (possibly a bug)");
                }
                chunkBody = chunkMessageHeader;
            } else {
                throw new Error("Unknown format type: ");
                //fixme: what formatType
                // throw new Error("Unknown format type: " + formatType);
            }
            if (message.formatType === 0) {
                if (message.timestamp === 0xffffff) {
                    if (chunkBody.length < 4) {
                        break;
                    }
                    message.timestamp = (chunkBody[0] * Math.pow(256, 3)) + (chunkBody[1] << 16) + (chunkBody[2] << 8) + chunkBody[3];
                    chunkBody = chunkBody.slice(4);
                    headerLen += 4;
                }
            } else if (message.timestampDelta === 0xffffff) {
                if (chunkBody.length < 4) {
                    break;
                }
                message.timestampDelta = (chunkBody[0] * Math.pow(256, 3)) + (chunkBody[1] << 16) + (chunkBody[2] << 8) + chunkBody[3];
                chunkBody = chunkBody.slice(4);
                headerLen += 4;
            }
            previousChunk = this.previousChunkMessage[message.chunkStreamID];
            if ((previousChunk != null) && previousChunk.isIncomplete) {
                remainingMessageLen = message.messageLength - previousChunk.body.length;
            } else {
                remainingMessageLen = message.messageLength;
            }
            chunkPayloadSize = Math.min(this.receiveChunkSize, remainingMessageLen);
            if (chunkBody.length < chunkPayloadSize) {
                break;
            }
            rtmpMessage = chunkBody.slice(chunkPayloadSize);
            chunkBody = chunkBody.slice(0, chunkPayloadSize);
            consumedLen += headerLen + chunkPayloadSize;
            if ((previousChunk != null) && previousChunk.isIncomplete) {
                message.body = Buffer.concat([previousChunk.body, chunkBody]);
            } else {
                message.body = chunkBody;
                if (message.timestampDelta != null) {
                    if (message.timestamp == null) {
                        throw new Error("timestamp delta is given, but base timestamp is not known");
                    }
                    message.timestamp += message.timestampDelta;
                }
            }
            if (message.body.length >= message.messageLength) {
                if (message.body.length !== message.messageLength) {
                    logger.warn("[rtmp] warning: message lengths don't match: " + ("got=" + message.body.length + " expected=" + message.messageLength));
                }
                messages.push(message);
            } else {
                message.isIncomplete = true;
            }
            this.previousChunkMessage[message.chunkStreamID] = message;
            if (messages.length === 1) {
                break;
            }
        }
        return {
            consumedLen: consumedLen,
            rtmpMessages: messages
        };
    };

    respondReleaseStream(requestCommand, callback) {
        var _result, ref, streamName;
        streamName = (ref = requestCommand.objects[1]) != null ? ref.value : void 0;
        logger.debug("[rtmp] releaseStream: " + this.app + "/" + streamName);
        _result = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: '_result',
            transactionID: requestCommand.transactionID,
            objects: [createAMF0Data(null), createAMF0Data(null)]
        });
        return callback(null, _result);
    };

    receiveSetDataFrame(requestData) {
        if (requestData.objects[1].value === 'onMetaData') {
            return logger.debug("[rtmp:receive] received @setDataFrame onMetaData");
        } else {
            throw new Error("Unknown @setDataFrame: " + requestData.objects[1].value);
        }
    };

    respondFCUnpublish(requestCommand, callback) {
        var _result, ref, streamName, unpublishSuccess;
        streamName = (ref = requestCommand.objects[1]) != null ? ref.value : void 0;
        logger.info("[rtmp] FCUnpublish: " + streamName);
        _result = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: '_result',
            transactionID: requestCommand.transactionID,
            objects: [createAMF0Data(null), createAMF0Data(null)]
        });
        unpublishSuccess = createAMF0CommandMessage({
            chunkStreamID: 4,
            timestamp: 0,
            messageStreamID: 1,
            command: 'onStatus',
            transactionID: requestCommand.transactionID,
            objects: [
                createAMF0Data(null), createAMF0Object({
                    level: 'status',
                    code: 'NetStream.Unpublish.Success',
                    description: '',
                    details: streamName,
                    clientid: this.clientid
                })
            ]
        }, this.chunkSize);
        return callback(null, this.concatenate([_result, unpublishSuccess]));
    };

    streamId;
    isFirstVideoReceived;
    isFirstAudioReceived;

    respondPublish(requestCommand, callback) {
        var j, kv, len1, match, pair, pairs, params, publishStart, publishingName, publishingType, ref, ref1, stream, streamName, urlInfo;
        this.receiveTimestamp = null;
        publishingName = (ref = requestCommand.objects[1]) != null ? ref.value : void 0;
        urlInfo = url.parse(publishingName);
        if (urlInfo.query != null) {
            pairs = urlInfo.query.split('&');
            params = {};
            for (j = 0, len1 = pairs.length; j < len1; j++) {
                pair = pairs[j];
                kv = pair.split('=');
                params[kv[0]] = kv[1];
            }
            logger.info(JSON.stringify(params));
        }
        publishingName = this.app + '/' + urlInfo.pathname;
        this.streamId = publishingName;
        stream = avstreams.get(this.streamId);
        if (stream != null) {
            stream.reset();
        } else {
            stream = avstreams.create(this.streamId);
            stream.type = avstreams.STREAM_TYPE_LIVE;
        }
        this.stream = stream;
        publishingType = (ref1 = requestCommand.objects[2]) != null ? ref1.value : void 0;
        if (publishingType !== 'live') {
            logger.warn("[rtmp] warn: publishing type other than 'live' is not supported: " + publishingType + "; using 'live'");
        }
        logger.info("[rtmp] publish: stream=" + publishingName + " publishingType=" + publishingType);
        if ((match = /^(.*?)\?/.exec(publishingName)) != null) {
            streamName = match[1];
        } else {
            streamName = publishingName;
        }
        this.isFirstVideoReceived = false;
        this.isFirstAudioReceived = false;
        publishStart = createAMF0CommandMessage({
            chunkStreamID: 4,
            timestamp: 0,
            messageStreamID: 1,
            command: 'onStatus',
            transactionID: requestCommand.transactionID,
            objects: [
                createAMF0Data(null), createAMF0Object({
                    level: 'status',
                    code: 'NetStream.Publish.Start',
                    description: '',
                    details: streamName,
                    clientid: this.clientid
                })
            ]
        }, this.chunkSize);
        return callback(null, publishStart);
    };

    respondWithError(requestCommand, callback) {
        var _error;
        _error = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: '_error',
            transactionID: requestCommand.transactionID,
            objects: [
                createAMF0Data(null), createAMF0Object({
                    level: 'error',
                    code: '',
                    description: 'Request failed.',
                    details: this.app,
                    clientid: this.clientid
                })
            ]
        });
        return callback(null, _error);
    };

    respondFCPublish(requestCommand, callback) {
        var _result, ref, streamName;
        streamName = (ref = requestCommand.objects[1]) != null ? ref.value : void 0;
        logger.debug("[rtmp] FCPublish: " + this.app + "/" + streamName);
        _result = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: '_result',
            transactionID: requestCommand.transactionID,
            objects: [createAMF0Data(null), createAMF0Data(null)]
        });
        return callback(null, _result);
    };

    respondCreateStream(requestCommand, callback) {
        var _result;
        _result = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: '_result',
            transactionID: requestCommand.transactionID,
            objects: [createAMF0Data(null), createAMF0Data(1)]
        });
        return callback(null, _result);
    };

    respondPlay(commandMessage, callback, streamId?) {
        var _error, close, codecConfigs, dataStart, messages, metadata, onMetaData, playReset, playStart, ref, rtmpSampleAccess, setChunkSize, stream, streamBegin1, streamIsRecorded;
        if (streamId == null) {
            streamId = null;
        }
        if (streamId == null) {
            streamId = this.app + '/' + ((ref = commandMessage.objects[1]) != null ? ref.value : void 0);
        }
        logger.info("[rtmp:client=" + this.clientid + "] requested stream " + streamId);
        this.chunkSize = config.rtmpPlayChunkSize;
        this.stream = avstreams.get(streamId);
        if (this.stream == null) {
            logger.error("[rtmp:client=" + this.clientid + "] error: stream not found: " + streamId);
            _error = createAMF0CommandMessage({
                chunkStreamID: 3,
                timestamp: 0,
                messageStreamID: 0,
                command: '_error',
                transactionID: commandMessage.transactionID,
                objects: [
                    createAMF0Data(null), createAMF0Object({
                        level: 'error',
                        code: 'NetStream.Play.StreamNotFound',
                        description: '',
                        details: streamId,
                        clientid: this.clientid
                    })
                ]
            });
            close = createAMF0CommandMessage({
                chunkStreamID: 3,
                timestamp: 0,
                messageStreamID: 0,
                command: 'close',
                transactionID: 0,
                objects: [createAMF0Data(null)]
            });
            callback(null, this.concatenate([_error, close]));
            return;
        }
        setChunkSize = createRTMPMessage({
            chunkStreamID: 2,
            timestamp: 0,
            messageTypeID: 0x01,
            messageStreamID: 0,
            body: new Buffer([(this.chunkSize >>> 24) & 0x7f, (this.chunkSize >>> 16) & 0xff, (this.chunkSize >>> 8) & 0xff, this.chunkSize & 0xff])
        });
        logger.debug("[rtmp:client=" + this.clientid + "] stream type: " + this.stream.type);
        if (this.stream.isRecorded()) {
            streamIsRecorded = createRTMPMessage({
                chunkStreamID: 2,
                timestamp: 0,
                messageTypeID: 0x04,
                messageStreamID: 0,
                body: new Buffer([0, 4, 0, 0, 0, 1])
            }, this.chunkSize);
        }
        streamBegin1 = createRTMPMessage({
            chunkStreamID: 2,
            timestamp: 0,
            messageTypeID: 0x04,
            messageStreamID: 0,
            body: new Buffer([0, 0, 0, 0, 0, 1])
        }, this.chunkSize);
        playReset = createAMF0CommandMessage({
            chunkStreamID: 4,
            timestamp: 0,
            messageStreamID: 1,
            command: 'onStatus',
            transactionID: 0,
            objects: [
                createAMF0Data(null), createAMF0Object({
                    level: 'status',
                    code: 'NetStream.Play.Reset',
                    description: "Playing and resetting " + streamId + ".",
                    details: streamId,
                    clientid: this.clientid
                })
            ]
        }, this.chunkSize);
        playStart = createAMF0CommandMessage({
            chunkStreamID: 4,
            timestamp: 0,
            messageStreamID: 1,
            command: 'onStatus',
            transactionID: 0,
            objects: [
                createAMF0Data(null), createAMF0Object({
                    level: 'status',
                    code: 'NetStream.Play.Start',
                    description: "Started playing " + streamId + ".",
                    details: streamId,
                    clientid: this.clientid
                })
            ]
        }, this.chunkSize);
        rtmpSampleAccess = createAMF0DataMessage({
            chunkStreamID: 4,
            timestamp: 0,
            messageStreamID: 1,
            objects: [createAMF0Data('|RtmpSampleAccess'), createAMF0Data(false), createAMF0Data(false)]
        }, this.chunkSize);
        dataStart = createAMF0DataMessage({
            chunkStreamID: 4,
            timestamp: 0,
            messageStreamID: 1,
            objects: [
                createAMF0Data('onStatus'), createAMF0Object({
                    code: 'NetStream.Data.Start'
                })
            ]
        }, this.chunkSize);
        metadata = {
            canSeekToEnd: false,
            cuePoints: [],
            hasMetadata: true,
            hasCuePoints: false
        };
        if (this.stream != null) {
            stream = this.stream;
            if (stream != null) {
                if (stream.isVideoStarted) {
                    metadata.hasVideo = true;
                    metadata.framerate = stream.videoFrameRate;
                    metadata.height = stream.videoHeight;
                    metadata.videocodecid = config.flv.videocodecid;
                    metadata.videodatarate = config.videoBitrateKbps;
                    metadata.width = stream.videoWidth;
                    metadata.avclevel = stream.videoAVCLevel;
                    metadata.avcprofile = stream.videoAVCProfile;
                }
                if (stream.isAudioStarted) {
                    metadata.hasAudio = true;
                    metadata.audiocodecid = config.flv.audiocodecid;
                    metadata.audiodatarate = config.audioBitrateKbps;
                    metadata.audiodelay = 0;
                    metadata.audiosamplerate = stream.audioSampleRate;
                    metadata.stereo = stream.audioChannels > 1;
                    metadata.audiochannels = stream.audioChannels;
                    metadata.aacaot = stream.audioObjectType;
                }
                if (stream.isRecorded()) {
                    metadata.duration = stream.durationSeconds;
                    metadata.lasttimestamp = stream.lastTagTimestamp;
                }
            } else {
                logger.error("[rtmp] error: respondPlay: no such stream: " + stream.id);
            }
        } else {
            logger.error("[rtmp] error: respondPlay: stream not set for this session");
        }
        logger.debug("[rtmp] metadata:");
        logger.debug(metadata);
        onMetaData = createAMF0DataMessage({
            chunkStreamID: 4,
            timestamp: 0,
            messageStreamID: 1,
            objects: [createAMF0Data('onMetaData'), createAMF0Data(metadata)]
        }, this.chunkSize);
        codecConfigs = this.getCodecConfigs(0);
        messages = [setChunkSize];
        if (this.stream.isRecorded()) {
            messages.push(streamIsRecorded);
        }
        messages.push(streamBegin1, playReset, playStart, rtmpSampleAccess, dataStart, onMetaData, codecConfigs);
        callback(null, this.concatenate(messages));
        if (this.stream.isRecorded()) {
            this.stream.play();
        }
        this.isWaitingForKeyFrame = true;
        this.seekedDuringPause = false;
        if (config.rtmpWaitForKeyFrame) {
            return logger.info("[rtmp:client=" + this.clientid + "] waiting for keyframe");
        }
    };

    getCodecConfigs(timestamp) {
        var ascInfo, audioConfigMessage, buf, configMessages, ppsLen, spsLen, stream, videoConfigMessage;
        if (timestamp == null) {
            timestamp = 0;
        }
        configMessages = [];
        stream = this.stream;
        if (stream == null) {
            logger.error("[rtmp] error: getCodecConfigs: stream not set for this session");
            return new Buffer([]);
        }
        if (stream.isVideoStarted) {
            if ((stream.spsNALUnit == null) || (stream.ppsNALUnit == null)) {
                logger.error("[rtmp] error: getCodecConfigs: SPS or PPS is not present");
                return new Buffer([]);
            }
            spsLen = stream.spsNALUnit.length;
            ppsLen = stream.ppsNALUnit.length;
            buf = new Buffer([(1 << 4) | config.flv.videocodecid, 0x00, 0x00, 0x00, 0x00, 0x01].concat(slice.call(stream.spsNALUnit.slice(1, 4)), [0xff], [0xe1], [(spsLen >> 8) & 0xff], [spsLen & 0xff], slice.call(stream.spsNALUnit), [0x01], [(ppsLen >> 8) & 0xff], [ppsLen & 0xff], slice.call(stream.ppsNALUnit)));
            videoConfigMessage = createVideoMessage({
                body: buf,
                timestamp: timestamp,
                chunkSize: this.chunkSize
            });
            configMessages.push(videoConfigMessage);
        }
        if (stream.isAudioStarted) {
            buf = flv.createAACAudioDataTag({
                aacPacketType: flv.AAC_PACKET_TYPE_SEQUENCE_HEADER
            });
            ascInfo = stream.audioASCInfo;
            if (ascInfo != null) {
                if (ascInfo.explicitHierarchicalSBR && config.rtmpDisableHierarchicalSBR) {
                    logger.debug("[rtmp] converting hierarchical signaling of SBR" + (" (AudioSpecificConfig=0x" + (stream.audioSpecificConfig.toString('hex')) + ")") + " to backward compatible signaling");
                    buf = buf.concat(aac.createAudioSpecificConfig(ascInfo));
                    buf = new Buffer(buf);
                } else {
                    buf = Buffer.concat([new Buffer(buf), stream.audioSpecificConfig]);
                }
                logger.debug("[rtmp] sending AudioSpecificConfig: 0x" + (buf.toString('hex')));
            } else {
                buf = buf.concat(aac.createAudioSpecificConfig({
                    audioObjectType: stream.audioObjectType,
                    samplingFrequency: stream.audioSampleRate,
                    channels: stream.audioChannels,
                    frameLength: 1024
                }));
                buf = new Buffer(buf);
            }
            audioConfigMessage = createAudioMessage({
                body: buf,
                timestamp: timestamp,
                chunkSize: this.chunkSize
            });
            configMessages.push(audioConfigMessage);
        }
        return this.concatenate(configMessages);
    };

    respondSeek(requestCommand, callback) {
        var _isPaused, _isPlaying, msec, ref;
        msec = requestCommand.objects[1].value;
        logger.info("[rtmp:client=" + this.clientid + "] seek to " + (msec / 1000) + " sec");
        msec = Math.floor(msec);
        this.lastSentTimestamp = null;
        if (((ref = this.stream) != null ? ref.type : void 0) === avstreams.STREAM_TYPE_RECORDED) {
            clearQueuedRTMPMessages(this.stream);
            _isPlaying = this.isPlaying;
            this.isPlaying = false;
            _isPaused = this.stream.isPaused();
            if (!_isPaused) {
                this.stream.pause();
            }
            return this.stream.seek(msec / 1000, (function (_this) {
                return function (err, actualStartTime) {
                    var seq;
                    if (err) {
                        logger.error("seek failed: " + err);
                        return;
                    }
                    _this.isPlaying = _isPlaying;
                    seq = new Sequent(null);
                    if (!_isPaused) {
                        _this.stream.sendVideoPacketsSinceLastKeyFrame(msec / 1000, function () {
                            _this.stream.resume();
                            _this.seekedDuringPause = false;
                            return seq.done();
                        });
                    } else {
                        _this.seekedDuringPause = true;
                        seq.done();
                    }
                    return seq.wait(1, function () {
                        var codecConfigs, dataStart, metadata, onMetaData, playStart, rtmpSampleAccess, seekNotify, setChunkSize, stream, streamBegin1, streamEOF1, streamIsRecorded;
                        streamEOF1 = createRTMPMessage({
                            chunkStreamID: 2,
                            timestamp: 0,
                            messageTypeID: 0x04,
                            messageStreamID: 0,
                            body: new Buffer([0, 1, 0, 0, 0, 1])
                        });
                        setChunkSize = createRTMPMessage({
                            chunkStreamID: 2,
                            timestamp: 0,
                            messageTypeID: 0x01,
                            messageStreamID: 0,
                            body: new Buffer([(_this.chunkSize >>> 24) & 0x7f, (_this.chunkSize >>> 16) & 0xff, (_this.chunkSize >>> 8) & 0xff, _this.chunkSize & 0xff])
                        });
                        streamIsRecorded = createRTMPMessage({
                            chunkStreamID: 2,
                            timestamp: 0,
                            messageTypeID: 0x04,
                            messageStreamID: 0,
                            body: new Buffer([0, 4, 0, 0, 0, 1])
                        }, _this.chunkSize);
                        streamBegin1 = createRTMPMessage({
                            chunkStreamID: 2,
                            timestamp: 0,
                            messageTypeID: 0x04,
                            messageStreamID: 0,
                            body: new Buffer([0, 0, 0, 0, 0, 1])
                        }, _this.chunkSize);
                        seekNotify = createAMF0CommandMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            command: 'onStatus',
                            transactionID: requestCommand.transactionID,
                            objects: [
                                createAMF0Data(null), createAMF0Object({
                                    level: 'status',
                                    code: 'NetStream.Seek.Notify',
                                    description: "Seeking " + msec + " (stream ID: 1).",
                                    details: _this.stream.id,
                                    clientid: _this.clientid
                                })
                            ]
                        }, _this.chunkSize);
                        playStart = createAMF0CommandMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            command: 'onStatus',
                            transactionID: 0,
                            objects: [
                                createAMF0Data(null), createAMF0Object({
                                    level: 'status',
                                    code: 'NetStream.Play.Start',
                                    description: "Started playing " + _this.stream.id + ".",
                                    details: _this.stream.id,
                                    clientid: _this.clientid
                                })
                            ]
                        }, _this.chunkSize);
                        rtmpSampleAccess = createAMF0DataMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            objects: [createAMF0Data('|RtmpSampleAccess'), createAMF0Data(false), createAMF0Data(false)]
                        }, _this.chunkSize);
                        dataStart = createAMF0DataMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            objects: [
                                createAMF0Data('onStatus'), createAMF0Object({
                                    code: 'NetStream.Data.Start'
                                })
                            ]
                        }, _this.chunkSize);
                        metadata = {
                            canSeekToEnd: false,
                            cuePoints: [],
                            hasMetadata: true,
                            hasCuePoints: false
                        };
                        stream = _this.stream;
                        if (stream.isVideoStarted) {
                            metadata.hasVideo = true;
                            metadata.framerate = stream.videoFrameRate;
                            metadata.height = stream.videoHeight;
                            metadata.videocodecid = config.flv.videocodecid;
                            metadata.videodatarate = config.videoBitrateKbps;
                            metadata.width = stream.videoWidth;
                            metadata.avclevel = stream.videoAVCLevel;
                            metadata.avcprofile = stream.videoAVCProfile;
                        }
                        if (stream.isAudioStarted) {
                            metadata.hasAudio = true;
                            metadata.audiocodecid = config.flv.audiocodecid;
                            metadata.audiodatarate = config.audioBitrateKbps;
                            metadata.audiodelay = 0;
                            metadata.audiosamplerate = stream.audioSampleRate;
                            metadata.stereo = stream.audioChannels > 1;
                            metadata.audiochannels = stream.audioChannels;
                            metadata.aacaot = stream.audioObjectType;
                        }
                        metadata.duration = stream.durationSeconds;
                        metadata.lasttimestamp = stream.lastTagTimestamp;
                        logger.debug("[rtmp] metadata:");
                        logger.debug(metadata);
                        onMetaData = createAMF0DataMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            objects: [createAMF0Data('onMetaData'), createAMF0Data(metadata)]
                        }, _this.chunkSize);
                        codecConfigs = _this.getCodecConfigs(msec);
                        return callback(null, _this.concatenate([streamEOF1, setChunkSize, streamIsRecorded, streamBegin1, seekNotify, playStart, rtmpSampleAccess, dataStart, onMetaData, codecConfigs]));
                    });
                };
            })(this));
        } else {
            return this.respondPlay(requestCommand, callback);
        }
    };

    respondPause(requestCommand, callback) {
        var base, doPause, msec, pauseNotify, ref, ref1, ref2, seekMsec, streamEOF1;
        doPause = requestCommand.objects[1].value === true;
        msec = requestCommand.objects[2].value;
        if (doPause) {
            this.isPlaying = false;
            this.isWaitingForKeyFrame = false;
            if (((ref = this.stream) != null ? ref.type : void 0) === avstreams.STREAM_TYPE_RECORDED) {
                if (typeof (base = this.stream).pause === "function") {
                    base.pause();
                }
                logger.info("[rtmp:client=" + this.clientid + "] stream " + this.stream.id + " paused at " + (msec / 1000) + " sec (client player time)");
                streamEOF1 = createRTMPMessage({
                    chunkStreamID: 2,
                    timestamp: 0,
                    messageTypeID: 0x04,
                    messageStreamID: 0,
                    body: new Buffer([0, 1, 0, 0, 0, 1])
                });
                pauseNotify = createAMF0CommandMessage({
                    chunkStreamID: 4,
                    timestamp: msec,
                    messageStreamID: 1,
                    command: 'onStatus',
                    transactionID: requestCommand.transactionID,
                    objects: [
                        createAMF0Data(null), createAMF0Object({
                            level: 'status',
                            code: 'NetStream.Pause.Notify',
                            description: "Pausing " + this.stream.id + ".",
                            details: this.stream.id,
                            clientid: this.clientid
                        })
                    ]
                }, this.chunkSize);
                return callback(null, this.concatenate([streamEOF1, pauseNotify]));
            } else {
                return callback(null);
            }
        } else {
            if (((ref1 = this.stream) != null ? ref1.type : void 0) === avstreams.STREAM_TYPE_RECORDED) {
                clearQueuedRTMPMessages(this.stream);
                if (msec === 0) {
                    seekMsec = 0;
                } else {
                    seekMsec = msec + 1;
                }
                return this.stream.seek(seekMsec / 1000, (function (_this2: RTMPSession) {
                    return function (err, actualStartTime) {
                        var codecConfigs, dataStart, metadata, onMetaData, playStart, rtmpSampleAccess, seq, setChunkSize, stream, streamBegin1, streamIsRecorded, unpauseNotify;
                        if (err) {
                            logger.error("[rtmp] seek failed: " + err);
                            return;
                        }
                        setChunkSize = createRTMPMessage({
                            chunkStreamID: 2,
                            timestamp: 0,
                            messageTypeID: 0x01,
                            messageStreamID: 0,
                            body: new Buffer([(_this2.chunkSize >>> 24) & 0x7f, (_this2.chunkSize >>> 16) & 0xff, (_this2.chunkSize >>> 8) & 0xff, _this2.chunkSize & 0xff])
                        });
                        if (_this2.stream.isRecorded()) {
                            streamIsRecorded = createRTMPMessage({
                                chunkStreamID: 2,
                                timestamp: 0,
                                messageTypeID: 0x04,
                                messageStreamID: 0,
                                body: new Buffer([0, 4, 0, 0, 0, 1])
                            }, _this2.chunkSize);
                        }
                        streamBegin1 = createRTMPMessage({
                            chunkStreamID: 2,
                            timestamp: 0,
                            messageTypeID: 0x04,
                            messageStreamID: 0,
                            body: new Buffer([0, 0, 0, 0, 0, 1])
                        }, _this2.chunkSize);
                        unpauseNotify = createAMF0CommandMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            command: 'onStatus',
                            transactionID: requestCommand.transactionID,
                            objects: [
                                createAMF0Data(null), createAMF0Object({
                                    level: 'status',
                                    code: 'NetStream.Unpause.Notify',
                                    description: "Unpausing " + _this2.stream.id + ".",
                                    details: _this2.stream.id,
                                    clientid: _this2.clientid
                                })
                            ]
                        }, _this2.chunkSize);
                        playStart = createAMF0CommandMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            command: 'onStatus',
                            transactionID: 0,
                            objects: [
                                createAMF0Data(null), createAMF0Object({
                                    level: 'status',
                                    code: 'NetStream.Play.Start',
                                    description: "Started playing " + _this2.stream.id + ".",
                                    details: _this2.stream.id,
                                    clientid: _this2.clientid
                                })
                            ]
                        }, _this2.chunkSize);
                        rtmpSampleAccess = createAMF0DataMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            objects: [createAMF0Data('|RtmpSampleAccess'), createAMF0Data(false), createAMF0Data(false)]
                        }, _this2.chunkSize);
                        dataStart = createAMF0DataMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            objects: [
                                createAMF0Data('onStatus'), createAMF0Object({
                                    code: 'NetStream.Data.Start'
                                })
                            ]
                        }, _this2.chunkSize);
                        metadata = {
                            canSeekToEnd: false,
                            cuePoints: [],
                            hasMetadata: true,
                            hasCuePoints: false
                        };
                        stream = _this2.stream;
                        if (stream.isVideoStarted) {
                            metadata.hasVideo = true;
                            metadata.framerate = stream.videoFrameRate;
                            metadata.height = stream.videoHeight;
                            metadata.videocodecid = config.flv.videocodecid;
                            metadata.videodatarate = config.videoBitrateKbps;
                            metadata.width = stream.videoWidth;
                            metadata.avclevel = stream.videoAVCLevel;
                            metadata.avcprofile = stream.videoAVCProfile;
                        }
                        if (stream.isAudioStarted) {
                            metadata.hasAudio = true;
                            metadata.audiocodecid = config.flv.audiocodecid;
                            metadata.audiodatarate = config.audioBitrateKbps;
                            metadata.audiodelay = 0;
                            metadata.audiosamplerate = stream.audioSampleRate;
                            metadata.stereo = stream.audioChannels > 1;
                            metadata.audiochannels = stream.audioChannels;
                            metadata.aacaot = stream.audioObjectType;
                        }
                        metadata.duration = stream.durationSeconds;
                        metadata.lasttimestamp = stream.lastTagTimestamp;
                        logger.debug("[rtmp] metadata:");
                        logger.debug(metadata);
                        onMetaData = createAMF0DataMessage({
                            chunkStreamID: 4,
                            timestamp: msec,
                            messageStreamID: 1,
                            objects: [createAMF0Data('onMetaData'), createAMF0Data(metadata)]
                        }, _this2.chunkSize);
                        codecConfigs = _this2.getCodecConfigs(msec);
                        callback(null, _this2.concatenate([setChunkSize, streamIsRecorded, streamBegin1, unpauseNotify, playStart, rtmpSampleAccess, dataStart, onMetaData, codecConfigs]));
                        seq = new Sequent(null);
                        _this2.startPlaying();
                        if (_this2.seekedDuringPause) {
                            _this2.stream.sendVideoPacketsSinceLastKeyFrame(seekMsec / 1000, function () {
                                return seq.done();
                            });
                        } else {
                            _this2.isResuming = true;
                            seq.done();
                        }
                        return seq.wait(1, function () {
                            var isResumed;
                            isResumed = _this2.stream.resume();
                            _this2.seekedDuringPause = false;
                            if (!isResumed) {
                                return logger.debug("[rtmp:client=" + _this2.clientid + "] cannot resume (EOF reached)");
                            } else {
                                return logger.info("[rtmp:client=" + _this2.clientid + "] resumed at " + (msec / 1000) + " sec (client player time)");
                            }
                        });
                    };
                })(this));
            } else {
                this.startPlaying();
                return this.respondPlay(requestCommand, callback, (ref2 = this.stream) != null ? ref2.id : void 0);
            }
        }
    };

    closeStream(callback) {
        this.isPlaying = false;
        this.isWaitingForKeyFrame = false;
        return callback(null);
    };

    deleteStream(requestCommand, callback) {
        var _result;
        this.isPlaying = false;
        this.isWaitingForKeyFrame = false;
        _result = createAMF0CommandMessage({
            chunkStreamID: 3,
            timestamp: 0,
            messageStreamID: 0,
            command: '_result',
            transactionID: requestCommand.transactionID,
            objects: [createAMF0Data(null), createAMF0Data(null)]
        });
        return callback(null, _result);
    };

    handleAMFDataMessage(dataMessage, callback) {
        callback(null);
        if (dataMessage.objects.length === 0) {
            logger.warn("[rtmp:receive] empty AMF data");
        }
        switch (dataMessage.objects[0].value) {
            case '@setDataFrame':
                this.receiveSetDataFrame(dataMessage);
                break;
            default:
                logger.warn("[rtmp:receive] unknown (not implemented) AMF data: " + dataMessage.objects[0].value);
                logger.debug(dataMessage);
        }
    };

    objectEncoding;

    handleAMFCommandMessage(commandMessage, callback) {
        var ref, ref1, ref2, streamId;
        switch (commandMessage.command) {
            case 'connect':
                this.objectEncoding = (ref = commandMessage.objects[0]) != null ? (ref1 = ref.value) != null ? ref1.objectEncoding : void 0 : void 0;
                return this.respondConnect(commandMessage, callback);
            case 'createStream':
                return this.respondCreateStream(commandMessage, callback);
            case 'play':
                streamId = (ref2 = commandMessage.objects[1]) != null ? ref2.value : void 0;
                return this.respondPlay(commandMessage, callback);
            case 'closeStream':
                return this.closeStream(callback);
            case 'deleteStream':
                return this.deleteStream(commandMessage, callback);
            case 'pause':
                return this.respondPause(commandMessage, callback);
            case 'pauseRaw':
                logger.debug("[rtmp] ignoring pauseRaw");
                return callback(null);
            case 'seek':
                return this.respondSeek(commandMessage, callback);
            case 'releaseStream':
                return this.respondReleaseStream(commandMessage, callback);
            case 'FCPublish':
                return this.respondFCPublish(commandMessage, callback);
            case 'publish':
                return this.respondPublish(commandMessage, callback);
            case 'FCUnpublish':
                return this.respondFCUnpublish(commandMessage, callback);
            default:
                logger.warn("[rtmp:receive] unknown (not implemented) AMF command: " + commandMessage.command);
                logger.debug(commandMessage);
                return callback(null);
        }
    };

    createAck() {
        return createRTMPMessage({
            chunkStreamID: 2,
            timestamp: 0,
            messageTypeID: 3,
            messageStreamID: 0,
            body: new Buffer([(this.receivedBytes >>> 24) & 0xff, (this.receivedBytes >>> 16) & 0xff, (this.receivedBytes >>> 8) & 0xff, this.receivedBytes & 0xff])
        });
    };

    tmpBuf;

    handleData(buf, callback) {
        var consumeNextRTMPMessage, onConsumeAllPackets, outputs, seq;
        this.scheduleTimeout();
        outputs = [];
        seq = new Sequent(null);
        if (this.windowAckSize != null) {
            this.receivedBytes += buf.length;
            if (this.receivedBytes - this.lastSentAckBytes > this.windowAckSize / 2) {
                outputs.push(this.createAck());
                this.lastSentAckBytes = this.receivedBytes;
            }
        }
        if (this.state === SESSION_STATE_NEW) {
            if (this.tmpBuf != null) {
                buf = Buffer.concat([this.tmpBuf, buf], this.tmpBuf.length + buf.length);
                this.tmpBuf = null;
            }
            if (buf.length < 1537) {
                logger.debug("[rtmp] waiting for C0+C1");
                this.tmpBuf = buf;
                return;
            }
            this.tmpBuf = null;
            this.state = SESSION_STATE_HANDSHAKE_ONGOING;
            this.respondHandshake(buf, callback);
            return;
        } else if (this.state === SESSION_STATE_HANDSHAKE_ONGOING) {
            if (this.tmpBuf != null) {
                buf = Buffer.concat([this.tmpBuf, buf], this.tmpBuf.length + buf.length);
                this.tmpBuf = null;
            }
            if (buf.length < 1536) {
                logger.debug("[rtmp] waiting for C2");
                this.tmpBuf = buf;
                return;
            }
            this.tmpBuf = null;
            this.state = SESSION_STATE_HANDSHAKE_DONE;
            logger.debug("[rtmp] handshake success");
            if (buf.length <= 1536) {
                callback(null);
                return;
            }
            buf = buf.slice(1536);
        }
        if (this.state !== SESSION_STATE_HANDSHAKE_DONE) {
            logger.error("[rtmp:receive] unknown session state: " + this.state);
            return callback(new Error("Unknown session state"));
        } else {
            if (this.useEncryption) {
                buf = this.decrypt(buf);
            }
            if (this.tmpBuf != null) {
                buf = Buffer.concat([this.tmpBuf, buf], this.tmpBuf.length + buf.length);
                this.tmpBuf = null;
            }
            onConsumeAllPackets = (function (_this) {
                return function () {
                    var outbuf;
                    outbuf = _this.concatenate(outputs);
                    if (_this.useEncryption) {
                        outbuf = _this.encrypt(outbuf);
                    }
                    return callback(null, outbuf);
                };
            })(this);
            consumeNextRTMPMessage = (function (_this) {
                return function () {
                    var acknowledgementMessage, audioData, bufferLength, commandMessage, dataMessage, debugMsg, dts, e, error, error1, j, len1, msec, newChunkSize, parseResult, pts, ref, results, rtmpMessage, stream, streamID, timestamp, userControlMessage, videoData;
                    if (buf == null) {
                        onConsumeAllPackets();
                        return;
                    }
                    parseResult = _this.parseRTMPMessages(buf);
                    if (parseResult.consumedLen === 0) {
                        _this.tmpBuf = buf;
                        onConsumeAllPackets();
                        return;
                    } else if (parseResult.consumedLen < buf.length) {
                        buf = buf.slice(parseResult.consumedLen);
                    } else {
                        buf = null;
                    }
                    seq.reset();
                    seq.wait(parseResult.rtmpMessages.length, function (err, output) {
                        if (err != null) {
                            logger.error("[rtmp:receive] ignoring invalid packet (" + err + ")");
                        }
                        if (output != null) {
                            outputs.push(output);
                        }
                        return consumeNextRTMPMessage();
                    });
                    ref = parseResult.rtmpMessages;
                    results = [];
                    for (j = 0, len1 = ref.length; j < len1; j++) {
                        rtmpMessage = ref[j];
                        switch (rtmpMessage.messageTypeID) {
                            case 1:
                                newChunkSize = rtmpMessage.body[0] * Math.pow(256, 3) + (rtmpMessage.body[1] << 16) + (rtmpMessage.body[2] << 8) + rtmpMessage.body[3];
                                if (DEBUG_INCOMING_RTMP_PACKETS) {
                                    logger.info("[rtmp:receive] Set Chunk Size: " + newChunkSize);
                                }
                                _this.receiveChunkSize = newChunkSize;
                                results.push(seq.done());
                                break;
                            case 3:
                                acknowledgementMessage = parseAcknowledgementMessage(rtmpMessage.body);
                                if (DEBUG_INCOMING_RTMP_PACKETS) {
                                    logger.info("[rtmp:receive] Ack: " + acknowledgementMessage.sequenceNumber);
                                }
                                results.push(seq.done());
                                break;
                            case 4:
                                userControlMessage = parseUserControlMessage(rtmpMessage.body);
                                if (userControlMessage.eventType === 3) {
                                    streamID = (userControlMessage.eventData[0] << 24) + (userControlMessage.eventData[1] << 16) + (userControlMessage.eventData[2] << 8) + userControlMessage.eventData[3];
                                    bufferLength = (userControlMessage.eventData[4] << 24) + (userControlMessage.eventData[5] << 16) + (userControlMessage.eventData[6] << 8) + userControlMessage.eventData[7];
                                    if (DEBUG_INCOMING_RTMP_PACKETS) {
                                        logger.info("[rtmp:receive] SetBufferLength: streamID=" + streamID + " bufferLength=" + bufferLength);
                                    }
                                } else if (userControlMessage.eventType === 7) {
                                    timestamp = (userControlMessage.eventData[0] << 24) + (userControlMessage.eventData[1] << 16) + (userControlMessage.eventData[2] << 8) + userControlMessage.eventData[3];
                                    if (DEBUG_INCOMING_RTMP_PACKETS) {
                                        logger.info("[rtmp:receive] PingResponse: timestamp=" + timestamp);
                                    }
                                } else {
                                    if (DEBUG_INCOMING_RTMP_PACKETS) {
                                        logger.info("[rtmp:receive] User Control Message");
                                        logger.info(userControlMessage);
                                    }
                                }
                                results.push(seq.done());
                                break;
                            case 5:
                                _this.windowAckSize = (rtmpMessage.body[0] << 24) + (rtmpMessage.body[1] << 16) + (rtmpMessage.body[2] << 8) + rtmpMessage.body[3];
                                if (DEBUG_INCOMING_RTMP_PACKETS) {
                                    logger.info("[rtmp:receive] WindowAck: " + _this.windowAckSize);
                                }
                                results.push(seq.done());
                                break;
                            case 8:
                                if (DEBUG_INCOMING_RTMP_PACKETS) {
                                    logger.info("[rtmp:receive] Audio Message");
                                }
                                audioData = _this.parseAudioMessage(rtmpMessage.body);
                                if (audioData.adtsFrame != null) {
                                    if (!_this.isFirstAudioReceived) {
                                        _this.emit('audio_start', _this.stream.id);
                                        _this.isFirstAudioReceived = true;
                                    }
                                    pts = dts = flv.convertMsToPTS(rtmpMessage.timestamp);
                                    _this.emit('audio_data', _this.stream.id, pts, dts, audioData.adtsFrame);
                                }
                                results.push(seq.done());
                                break;
                            case 9:
                                videoData = _this.parseVideoMessage(rtmpMessage.body);
                                if (videoData.nalUnitGlob != null) {
                                    if (!_this.isFirstVideoReceived) {
                                        _this.emit('video_start', _this.stream.id);
                                        _this.isFirstVideoReceived = true;
                                    }
                                    dts = rtmpMessage.timestamp;
                                    pts = dts + videoData.info.videoDataTag.compositionTime;
                                    pts = flv.convertMsToPTS(pts);
                                    dts = flv.convertMsToPTS(dts);
                                    if (DEBUG_INCOMING_RTMP_PACKETS) {
                                        logger.info("[rtmp:receive] Video Message push timestamp(ms):" + rtmpMessage.timestamp);
                                    }
                                    _this.emit('video_data', _this.stream.id, pts, dts, videoData.nalUnitGlob);
                                }
                                if (videoData.isEOS) {
                                    logger.info("[rtmp:client=" + _this.clientid + "] received EOS for stream: " + _this.stream.id);
                                    stream = avstreams.get(_this.stream.id);
                                    if (stream == null) {
                                        logger.error("[rtmp:client=" + _this.clientid + "] error: unknown stream: " + _this.stream.id);
                                    }
                                    stream.emit('end');
                                }
                                results.push(seq.done());
                                break;
                            case 15:
                                try {
                                    dataMessage = parseAMF0DataMessage(rtmpMessage.body.slice(1));
                                } catch (error) {
                                    e = error;
                                    logger.error("[rtmp] error: failed to parse AMF0 data message: " + e.stack);
                                    logger.error("messageTypeID=" + rtmpMessage.messageTypeID + " body:");
                                    Bits.hexdump(rtmpMessage.body);
                                    seq.done(e);
                                }
                                if (dataMessage != null) {
                                    if (DEBUG_INCOMING_RTMP_PACKETS) {
                                        logger.info("[rtmp:receive] AMF3 data:");
                                        logger.info(dataMessage);
                                    }
                                    results.push(_this.handleAMFDataMessage(dataMessage, function (err, output) {
                                        if (err != null) {
                                            logger.error("[rtmp:receive] packet error: " + err);
                                        }
                                        if (output != null) {
                                            outputs.push(output);
                                        }
                                        return seq.done();
                                    }));
                                } else {
                                    results.push(void 0);
                                }
                                break;
                            case 17:
                                commandMessage = parseAMF0CommandMessage(rtmpMessage.body.slice(1));
                                if (DEBUG_INCOMING_RTMP_PACKETS) {
                                    debugMsg = "[rtmp:receive] AMF3 command: " + commandMessage.command;
                                    if (commandMessage.command === 'pause') {
                                        msec = commandMessage.objects[2].value;
                                        if (commandMessage.objects[1].value === true) {
                                            debugMsg += " (doPause=true msec=" + msec + ")";
                                        } else {
                                            debugMsg += " (doPause=false msec=" + msec + ")";
                                        }
                                    } else if (commandMessage.command === 'seek') {
                                        msec = commandMessage.objects[1].value;
                                        debugMsg += " (msec=" + msec + ")";
                                    }
                                    logger.debug(debugMsg);
                                }
                                results.push(_this.handleAMFCommandMessage(commandMessage, function (err, output) {
                                    if (err != null) {
                                        logger.error("[rtmp:receive] packet error: " + err);
                                    }
                                    if (output != null) {
                                        outputs.push(output);
                                    }
                                    return seq.done();
                                }));
                                break;
                            case 18:
                                try {
                                    dataMessage = parseAMF0DataMessage(rtmpMessage.body);
                                } catch (error1) {
                                    e = error1;
                                    logger.error("[rtmp] error: failed to parse AMF0 data message: " + e.stack);
                                    logger.error("messageTypeID=" + rtmpMessage.messageTypeID + " body:");
                                    Bits.hexdump(rtmpMessage.body);
                                    seq.done(e);
                                }
                                if (dataMessage != null) {
                                    if (DEBUG_INCOMING_RTMP_PACKETS) {
                                        logger.info("[rtmp:receive] AMF0 data:");
                                        logger.info(dataMessage);
                                    }
                                    results.push(_this.handleAMFDataMessage(dataMessage, function (err, output) {
                                        if (err != null) {
                                            logger.error("[rtmp:receive] packet error: " + err);
                                        }
                                        if (output != null) {
                                            outputs.push(output);
                                        }
                                        return seq.done();
                                    }));
                                } else {
                                    results.push(void 0);
                                }
                                break;
                            case 20:
                                commandMessage = parseAMF0CommandMessage(rtmpMessage.body);
                                if (DEBUG_INCOMING_RTMP_PACKETS) {
                                    logger.info("[rtmp:receive] AMF0 command: " + commandMessage.command);
                                }
                                results.push(_this.handleAMFCommandMessage(commandMessage, function (err, output) {
                                    if (err != null) {
                                        logger.error("[rtmp:receive] packet error: " + err);
                                    }
                                    if (output != null) {
                                        outputs.push(output);
                                    }
                                    return seq.done();
                                }));
                                break;
                            default:
                                logger.error("----- BUG -----");
                                logger.error("[rtmp:receive] received unknown (not implemented) message type ID: " + rtmpMessage.messageTypeID);
                                logger.error(rtmpMessage);
                                logger.error("server version: 0.4.0");
                                logger.error("Please report this bug along with the video file or relevant part of");
                                logger.error("pcap file, and the full (uncut) output of node-rtsp-rtsp-server. Thanks.");
                                logger.error("https://github.com/iizukanao/node-rtsp-rtmp-server/issues");
                                logger.error("---------------");
                                results.push(seq.done());
                        }
                    }
                    return results;
                };
            })(this);
            return consumeNextRTMPMessage();
        }
    };
}