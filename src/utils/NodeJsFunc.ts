import {_path, ServerConf} from "../Env";
export function base64ToPng(imgPath2, base64Data, callback?) {
    var base64Data = base64Data.replace(/^data:image\/png;base64,/, "");
    var writePath = imgPath2;
    if (!ServerConf.isDev)
        writePath = _path(imgPath2);
    var fs = require('fs');
    fs.writeFile(writePath, base64Data, 'base64', (err)=> {
        if (!err) {
            if (callback)
                callback('/' + imgPath2);
        }
        else throw err;
    });
}

export function getIPAddress() {
    // var interfaces = require('os').networkInterfaces({all: true});
    // for (var devName in interfaces) {
    //     console.log("interfaces:", devName);
    //     var iface = interfaces[devName];
    //     for (var i = 0; i < iface.length; i++) {
    //         var alias = iface[i];
    //         // console.log("ip:", JSON.stringify(alias));
    //         if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
    //             return alias.address;
    //         }
    //     }
    // }

    var os = require('os');
    var child_proc = require('child_process');
    var ls:any;
    var matches:Array<any> = [];
    var pmHosts:Array<any> = [];
    var filterRE:RegExp;
    var pingResult = "";
    var pmHost:Array<any>;

    if ('win32' == os.platform()) {
        ls = child_proc.spawn("ipconfig", {});
        // only get the IPv4 address
        filterRE = /\b(IPv4|IP\s)[^:\r\r\n]+:\s+([^\s]+)/g;
    }
    else {
        // TODO: we need try to get the local IP for other os, such as unix/mac
        return false;
    }

    ls.stdout.on('data', (data:any) => {
        // get ping result.
        pingResult = pingResult + data.toString();
        // console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data:any) => {
        pingResult = pingResult + data.toString();
        // console.log(`stderr: ${data}`);
    });

    ls.on('close', (code:any) => {
        matches = pingResult.match(filterRE) || [];
        for (var i = 0; i < matches.length; i++) {
            var host = matches[i].split(':')[1];
            console.log("host:", host);
            // trim the spaces in the string's start/end position.
            host = host.replace(/(^[\s]*)|([\s]*$)/g, "");
            pmHosts.push(host);
        }

        if (pmHosts.length > 0)
            pmHost = pmHosts[0];
    });

    ls.on('exit', function (code:any, signal:any) {
        matches = pingResult.match(filterRE) || [];
        for (var i = 0; i < matches.length; i++) {
            var host = matches[i].split(':')[1];

            // trim the spaces in the string's start/end position.
            host = host.replace(/(^[\s]*)|([\s]*$)/g, "");
            pmHosts.push(host);
        }

        if (pmHosts.length > 0)
            pmHost = pmHosts[0];

        // do other things
        console.log(pmHost);

    });
    //
    // ls.stdout.on('data', function (data) {
    //     // get ping result.
    //     pingResult = pingResult + data.toString();
    // });
}