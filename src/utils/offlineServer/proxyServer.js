var net = require('net');

var LOCAL_PORT = 1934;
var REMOTE_PORT = 1935;//remote rtmp server
var REMOTE_ADDR = "127.0.0.1";
var localSocket;
var serviceSocket;// = new net.Socket();

var isConn = false;
var server = net.createServer(function (socket) {
    if(!localSocket)
        localSocket = socket;
     socket.on('data', function (msg) {
        console.log('  ** local msg **');
        console.log('<< From client to proxy ');
        if (!isConn) {
            isConn = true;
            serviceSocket= new net.Socket();
            serviceSocket.on("data", function (data) {
                console.log('<< From remote to proxy');
                if (localSocket)
                    localSocket.write(data);
                console.log('<< From proxy to client');
            });
            serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_ADDR, function () {
                console.log('>> From proxy to remote');
                serviceSocket.write(msg);
            });
        }
        else {
            console.log('>> From proxy to remote');
            serviceSocket.write(msg);
        }
    });
});

server.listen(LOCAL_PORT);
console.log("TCP server accepting connection on port: " + LOCAL_PORT);