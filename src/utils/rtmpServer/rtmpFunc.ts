var logger = require('./logger');
export var SESSION_STATE_NEW = 1;

export var SESSION_STATE_HANDSHAKE_ONGOING = 2;

export var SESSION_STATE_HANDSHAKE_DONE = 3;

export var AVC_PACKET_TYPE_SEQUENCE_HEADER = 0;

export var AVC_PACKET_TYPE_NALU = 1;

export var AVC_PACKET_TYPE_END_OF_SEQUENCE = 2;

export var TIMESTAMP_ROUNDOFF = 4294967296;

export var DEBUG_INCOMING_STREAM_DATA = false;

export var DEBUG_INCOMING_RTMP_PACKETS = true;

export var DEBUG_OUTGOING_RTMP_PACKETS = false;

export var RTMPT_SEND_REQUEST_BUFFER_SIZE = 10;

export var sessionsCount = 0;

export var sessions = {};

export var rtmptSessionsCount = 0;

export var rtmptSessions = {};

export var clientMaxId = 0;

export var queuedRTMPMessages = {};
export var slice = [].slice;
export var generateClientID = function () {
    var clientID, i, j, numPossible, possible;
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    numPossible = possible.length;
    clientID = '';
    for (i = j = 0; j <= 7; i = ++j) {
        clientID += possible.charAt((Math.random() * numPossible) | 0);
    }
    return clientID;
};

export var generateNewClientID = function () {
    var clientID;
    clientID = generateClientID();
    while (sessions[clientID] != null) {
        clientID = generateClientID();
    }
    return clientID;
};
export var createRTMPType1Message = function (params) {
    var body, bodyLength, extendedTimestamp, formatTypeID, header, ordinaryTimestampBytes, useExtendedTimestamp;
    bodyLength = params.body.length;
    formatTypeID = 1;
    if (params.body == null) {
        logger.warn("[rtmp] warning: createRTMPType1Message(): body is not set for RTMP message");
    }
    if (params.chunkStreamID == null) {
        logger.warn("[rtmp] warning: createRTMPType1Message(): chunkStreamID is not set for RTMP message");
    }
    if (params.timestampDelta == null) {
        logger.warn("[rtmp] warning: createRTMPType1Message(): timestampDelta is not set for RTMP message");
    }
    if (params.messageStreamID == null) {
        logger.warn("[rtmp] warning: createRTMPType1Message(): messageStreamID is not set for RTMP message");
    }
    useExtendedTimestamp = false;
    if (params.timestampDelta >= 0xffffff) {
        useExtendedTimestamp = true;
        ordinaryTimestampBytes = [0xff, 0xff, 0xff];
    } else {
        ordinaryTimestampBytes = [(params.timestampDelta >> 16) & 0xff, (params.timestampDelta >> 8) & 0xff, params.timestampDelta & 0xff];
    }
    header = new Buffer([(formatTypeID << 6) | params.chunkStreamID, ordinaryTimestampBytes[0], ordinaryTimestampBytes[1], ordinaryTimestampBytes[2], (bodyLength >> 16) & 0xff, (bodyLength >> 8) & 0xff, bodyLength & 0xff, params.messageTypeID]);
    if (useExtendedTimestamp) {
        extendedTimestamp = new Buffer([(params.timestampDelta >> 24) & 0xff, (params.timestampDelta >> 16) & 0xff, (params.timestampDelta >> 8) & 0xff, params.timestampDelta & 0xff]);
        header = Buffer.concat([header, extendedTimestamp], 12);
    }
    body = params.body;
    return Buffer.concat([header, body], 8 + bodyLength);
};
export var createAMF0Data = function (data) {
    var buf, strBytes, strLen, type;
    type = typeof data;
    buf = null;
    if (type === 'number') {
        buf = new Buffer(9);
        buf[0] = 0x00;
        buf.writeDoubleBE(data, 1);
    } else if (type === 'boolean') {
        buf = new Buffer(2);
        buf[0] = 0x01;
        buf[1] = data ? 0x01 : 0x00;
    } else if (type === 'string') {
        buf = new Buffer(3);
        buf[0] = 0x02;
        strBytes = new Buffer(data, 'utf8');
        strLen = strBytes.length;
        buf[1] = (strLen >> 8) & 0xff;
        buf[2] = strLen & 0xff;
        buf = Buffer.concat([buf, strBytes], 3 + strLen);
    } else if (data === null) {
        buf = new Buffer([0x05]);
    } else if (type === 'undefined') {
        buf = new Buffer([0x06]);
    } else if (data instanceof Date) {
        buf = new Buffer(11);
        buf[0] = 0x0b;
        buf.writeDoubleBE(data.getTime(), 1);
        buf[9] = 0;
        buf[10] = 0;
    } else if (data instanceof Array) {
        buf = new Buffer([0x0a]);
        buf = createAMF0StrictArray(data, buf);
    } else if (type === 'object') {
        buf = createAMF0Object(data);
    } else {
        throw new Error("Unknown data type \"" + type + "\" for data " + data);
    }
    return buf;
};
export var createAMF0StrictArray = function (arr, buf) {
    var arrLen, bufs, i, j, len1, totalLength, value, valueBytes;
    if (buf == null) {
        buf = null;
    }
    bufs = [];
    totalLength = 0;
    if (buf != null) {
        bufs.push(buf);
        totalLength += buf.length;
    }
    arrLen = arr.length;
    bufs.push(new Buffer([(arrLen >>> 24) & 0xff, (arrLen >>> 16) & 0xff, (arrLen >>> 8) & 0xff, arrLen & 0xff]));
    totalLength += 4;
    for (i = j = 0, len1 = arr.length; j < len1; i = ++j) {
        value = arr[i];
        valueBytes = createAMF0Data(value);
        bufs.push(valueBytes);
        totalLength += valueBytes.length;
    }
    return Buffer.concat(bufs, totalLength);
};

export var createAMF0Object = function (obj) {
    var buf;
    buf = new Buffer([0x03]);
    return createAMF0PropertyList(obj, buf);
};
export var createAMF0PropertyList = function (obj, buf) {
    var bufs, dataBytes, name, nameBytes, nameLen, nameLenBytes, totalLength, value;
    if (buf == null) {
        buf = null;
    }
    bufs = [];
    totalLength = 0;
    if (buf != null) {
        bufs.push(buf);
        totalLength += buf.length;
    }
    for (name in obj) {
        value = obj[name];
        nameBytes = new Buffer(name, 'utf8');
        nameLen = nameBytes.length;
        nameLenBytes = new Buffer(2);
        nameLenBytes[0] = (nameLen >> 8) & 0xff;
        nameLenBytes[1] = nameLen & 0xff;
        dataBytes = createAMF0Data(value);
        bufs.push(nameLenBytes, nameBytes, dataBytes);
        totalLength += 2 + nameLen + dataBytes.length;
    }
    bufs.push(new Buffer([0x00, 0x00, 0x09]));
    totalLength += 3;
    return Buffer.concat(bufs, totalLength);
};
export var createAMF0CommandMessage = function (params, chunkSize = null) {
    return createRTMPMessage(createAMF0CommandMessageParams(params), chunkSize);
};

export var createAMF0DataMessage = function (params, chunkSize) {
    return createRTMPMessage(createAMF0DataMessageParams(params), chunkSize);
};

export var createAMF0DataMessageParams = function (params) {
    var amf0Bytes, j, len, len1, obj, ref;
    len = 0;
    ref = params.objects;
    for (j = 0, len1 = ref.length; j < len1; j++) {
        obj = ref[j];
        len += obj.length;
    }
    amf0Bytes = Buffer.concat(params.objects, len);
    return {
        chunkStreamID: params.chunkStreamID,
        timestamp: params.timestamp,
        messageTypeID: 0x12,
        messageStreamID: params.messageStreamID,
        body: amf0Bytes
    };
};

export var createVideoMessage = function (params) {
    var videoMessage;
    return videoMessage = createRTMPMessage({
        chunkStreamID: 4,
        timestamp: params.timestamp,
        messageTypeID: 0x09,
        messageStreamID: 1,
        body: params.body
    }, params.chunkSize);
};
export var createAudioMessage = function (params) {
    var audioMessage;
    return audioMessage = createRTMPMessage({
        chunkStreamID: 4,
        timestamp: params.timestamp,
        messageTypeID: 0x08,
        messageStreamID: 1,
        body: params.body
    }, params.chunkSize);
};
export var clearQueuedRTMPMessages = function (stream) {
    if (queuedRTMPMessages[stream.id] != null) {
        return queuedRTMPMessages[stream.id] = [];
    }
};
export var parseAcknowledgementMessage = function (buf) {
    var sequenceNumber;
    sequenceNumber = (buf[0] * Math.pow(256, 3)) + (buf[1] << 16) + (buf[2] << 8) + buf[3];
    return {
        sequenceNumber: sequenceNumber
    };
};
export var parseUserControlMessage = function (buf) {
    var eventData, eventType, message;
    eventType = (buf[0] << 8) + buf[1];
    eventData = buf.slice(2);
    message = {
        eventType: eventType,
        eventData: eventData
    };
    if (eventType === 3) {
        message.streamID = (eventData[0] << 24) + (eventData[1] << 16) + (eventData[2] << 8) + eventData[3];
        message.bufferLength = (eventData[4] << 24) + (eventData[5] << 16) + (eventData[6] << 8) + eventData[7];
    }
    return message;
};
export var parseAMF0Object = function (buf, maxItems?) {
    var bufLen, items, name, nameLen, obj, readLen, result;
    if (maxItems == null) {
        maxItems = null;
    }
    obj = {};
    bufLen = buf.length;
    readLen = 0;
    items = 0;
    if ((maxItems == null) || (maxItems > 0)) {
        while (readLen < bufLen) {
            nameLen = (buf[readLen++] << 8) + buf[readLen++];
            if (nameLen > 0) {
                name = buf.toString('utf8', readLen, readLen + nameLen);
                readLen += nameLen;
            } else {
                name = null;
            }
            result = parseAMF0Data(buf.slice(readLen));
            readLen += result.readLen;
            if (result.type === 'object-end-marker') {
                break;
            } else {
                items++;
                if ((maxItems != null) && (items > maxItems)) {
                    logger.warn("warn: illegal AMF0 data: force break because items (" + items + ") > maxItems (" + maxItems + ")");
                    break;
                }
            }
            if (name != null) {
                obj[name] = result.value;
            } else {
                logger.warn("warn: illegal AMF0 data: object key for value " + result.value + " is zero length");
            }
        }
    }
    return {
        value: obj,
        readLen: readLen
    };
};

export var parseAMF0StrictArray = function (buf) {
    var arr, len, readLen, result;
    arr = [];
    len = (buf[0] << 24) + (buf[1] << 16) + (buf[2] << 8) + buf[3];
    readLen = 4;
    while (--len >= 0) {
        result = parseAMF0Data(buf.slice(readLen));
        arr.push(result.value);
        readLen += result.readLen;
    }
    return {
        value: arr,
        readLen: readLen
    };
};

export var parseAMF0ECMAArray = function (buf) {
    var count, result;
    count = (buf[0] << 24) + (buf[1] << 16) + (buf[2] << 8) + buf[3];
    result = parseAMF0Object(buf.slice(4), count);
    result.readLen += 4;
    return result;
};
export var parseAMF0Data = function (buf) {
    var date, i, result, strLen, time, type, value;
    i = 0;
    type = buf[i++];
    if (type === 0x00) {
        value = buf.readDoubleBE(i);
        return {
            type: 'number',
            value: value,
            readLen: i + 8
        };
    } else if (type === 0x01) {
        value = buf[i] === 0x00 ? false : true;
        return {
            type: 'boolean',
            value: value,
            readLen: i + 1
        };
    } else if (type === 0x02) {
        strLen = (buf[i++] << 8) + buf[i++];
        value = buf.toString('utf8', i, i + strLen);
        return {
            type: 'string',
            value: value,
            readLen: i + strLen
        };
    } else if (type === 0x03) {
        result = parseAMF0Object(buf.slice(i));
        return {
            type: 'object',
            value: result.value,
            readLen: i + result.readLen
        };
    } else if (type === 0x05) {
        return {
            type: 'null',
            value: null,
            readLen: i
        };
    } else if (type === 0x06) {
        return {
            type: 'undefined',
            value: void 0,
            readLen: i
        };
    } else if (type === 0x08) {
        result = parseAMF0ECMAArray(buf.slice(i));
        return {
            type: 'array',
            value: result.value,
            readLen: i + result.readLen
        };
    } else if (type === 0x09) {
        return {
            type: 'object-end-marker',
            readLen: i
        };
    } else if (type === 0x0a) {
        result = parseAMF0StrictArray(buf.slice(i));
        return {
            type: 'strict-array',
            value: result.value,
            readLen: i + result.readLen
        };
    } else if (type === 0x0b) {
        time = buf.readDoubleBE(i);
        date = new Date(time);
        return {
            type: 'date',
            value: date,
            readLen: i + 10
        };
    } else {
        throw new Error("Unknown AMF0 data type: " + type);
    }
};
export var parseAMF0CommandMessage = function (buf) {
    var amf0Packets, e, error, remainingLen, result;
    amf0Packets = [];
    remainingLen = buf.length;
    while (remainingLen > 0) {
        try {
            result = parseAMF0Data(buf);
        } catch (error) {
            e = error;
            logger.error("[rtmp] error parsing AMF0 command (maybe a bug); buf:");
            logger.error(buf);
            throw e;
        }
        amf0Packets.push(result);
        remainingLen -= result.readLen;
        buf = buf.slice(result.readLen);
    }
    return {
        command: amf0Packets[0].value,
        transactionID: amf0Packets[1].value,
        objects: amf0Packets.slice(2)
    };
};
export var parseAMF0DataMessage = function (buf) {
    var amf0Packets, remainingLen, result;
    amf0Packets = [];
    remainingLen = buf.length;
    while (remainingLen > 0) {
        result = parseAMF0Data(buf);
        amf0Packets.push(result);
        remainingLen -= result.readLen;
        buf = buf.slice(result.readLen);
    }
    return {
        objects: amf0Packets
    };
};
export var createAMF0CommandMessageParams = function (params) {
    var amf0Bytes, commandBuf, j, len, len1, obj, ref, transactionIDBuf;
    commandBuf = createAMF0Data(params.command);
    transactionIDBuf = createAMF0Data(params.transactionID);
    len = commandBuf.length + transactionIDBuf.length;
    ref = params.objects;
    for (j = 0, len1 = ref.length; j < len1; j++) {
        obj = ref[j];
        len += obj.length;
    }
    amf0Bytes = Buffer.concat([commandBuf, transactionIDBuf].concat(slice.call(params.objects)), len);
    return {
        chunkStreamID: params.chunkStreamID,
        timestamp: params.timestamp,
        messageTypeID: 0x14,
        messageStreamID: params.messageStreamID,
        body: amf0Bytes
    };
};
export var createRTMPMessage = function (params, chunkSize = null) {
    var body, bodyChunk, bodyChunkLen, bodyLength, bufs, formatTypeID, timestamp, totalLength, type3Header, useExtendedTimestamp;
    if (chunkSize == null) {
        chunkSize = 128;
    }
    bodyLength = params.body.length;
    formatTypeID = 0;
    if (params.body == null) {
        logger.warn("[rtmp] warning: createRTMPMessage(): body is not set for RTMP message");
    }
    if (params.chunkStreamID == null) {
        logger.warn("[rtmp] warning: createRTMPMessage(): chunkStreamID is not set for RTMP message");
    }
    if (params.timestamp == null) {
        logger.warn("[rtmp] warning: createRTMPMessage(): timestamp is not set for RTMP message");
    }
    if (params.messageStreamID == null) {
        logger.warn("[rtmp] warning: createRTMPMessage(): messageStreamID is not set for RTMP message");
    }
    useExtendedTimestamp = false;
    if (params.timestamp >= 0xffffff) {
        useExtendedTimestamp = true;
        timestamp = [0xff, 0xff, 0xff];
    } else {
        timestamp = [(params.timestamp >> 16) & 0xff, (params.timestamp >> 8) & 0xff, params.timestamp & 0xff];
    }
    bufs = [new Buffer([(formatTypeID << 6) | params.chunkStreamID, timestamp[0], timestamp[1], timestamp[2], (bodyLength >> 16) & 0xff, (bodyLength >> 8) & 0xff, bodyLength & 0xff, params.messageTypeID, params.messageStreamID & 0xff, (params.messageStreamID >>> 8) & 0xff, (params.messageStreamID >>> 16) & 0xff, (params.messageStreamID >>> 24) & 0xff])];
    totalLength = 12;
    if (useExtendedTimestamp) {
        bufs.push(new Buffer([(params.timestamp >> 24) & 0xff, (params.timestamp >> 16) & 0xff, (params.timestamp >> 8) & 0xff, params.timestamp & 0xff]));
        totalLength += 4;
    }
    body = params.body;
    if (bodyLength > chunkSize) {
        bufs.push(body.slice(0, chunkSize));
        totalLength += chunkSize;
        body = body.slice(chunkSize);
        bodyLength -= chunkSize;
        type3Header = new Buffer([(3 << 6) | params.chunkStreamID]);
        while (true) {
            bodyChunk = body.slice(0, chunkSize);
            bodyChunkLen = bodyChunk.length;
            bufs.push(type3Header, bodyChunk);
            totalLength += 1 + bodyChunkLen;
            body = body.slice(bodyChunkLen);
            bodyLength -= bodyChunkLen;
            if (bodyLength === 0) {
                break;
            }
        }
    } else {
        bufs.push(body);
        totalLength += bodyLength;
    }
    return Buffer.concat(bufs, totalLength);
};