var net = require('net');

var LOCAL_PORT = 1935;
var REMOTE_PORT = 1936;//remote rtmp server
var REMOTE_ADDR = "127.0.0.1";
var localSocket;
var serviceSocket;// = new net.Socket();

var isConn = false;
var clientCount = 0;
var server = net.createServer(function (socket) {
    if (!localSocket)
        localSocket = socket;
    console.log('new socket');
    clientCount++;
    socket.on('data', function (msg) {
        console.log('  ** client msg ** count',clientCount);
        console.log('<< From client to proxy ');
        if (!isConn) {
            serviceSocket = new net.Socket();
            serviceSocket.on("data", function (data) {
                console.log('<< From remote to proxy');
                if (localSocket)
                    localSocket.write(data);
                console.log('<< From proxy to client');
            });
            serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_ADDR, function () {
                // console.log('>> From proxy to remote');
                // serviceSocket.write(msg);
                isConn = true;
                packMsgSend(msg);
            });
        }
        else {
            // console.log('>> From proxy to remote');
            // serviceSocket.write(msg);
            packMsgSend(msg);
        }
    });
});
var bufferQue = [];
var isLock = false;
function packMsgSend(msg) {
    if (!isLock) {
        isLock = true;
        var bufMsg;
        if (bufferQue.length) {
            bufMsg = bufferQue.shift();
        }
        else {
            bufMsg = msg;
        }
        var head = new Buffer([0x0F, 0x2F, 0x3e]);
        serviceSocket.write(Buffer.concat([head, bufMsg]));
        console.log('>> From proxy to remote');
        isLock = false;
    }
    else {
        console.log('>> From proxy to remote buffer:', bufferQue.length);
        bufferQue.push(msg);
    }

    // serviceSocket.write(msg);
}
server.listen(LOCAL_PORT);
console.log("TCP server accepting connection on port: " + LOCAL_PORT);