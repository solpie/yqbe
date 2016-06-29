const {app, BrowserWindow, ipcMain} = require('electron');
var win:any;
function onReady() {
    openWin();
}
const spawn = require('child_process').spawn;
var watchView;
var watchServer;
var isWatch = false;
var sender;
function devWatch() {
    if (isWatch) {
        // watchServer.kill();
        // watchView.kill();
        return;
    }
    isWatch = true;
    function sendServer(data) {
        sender.send('logServer', data);
    }

    function sendView(data) {
        sender.send('logView', data);
    }

    watchView = spawn('npm.cmd', ['run', 'view'], {
        detached: false,
        stdio: ['ignore']
    });

    watchView.stdout.on('data', sendView);

    watchView.stderr.on('data', sendView);

    watchView.on('close', sendView);

    watchServer = spawn('npm.cmd', ['run', 'server'], {
        detached: false
    });

    watchServer.stdout.on('data', sendServer);

    watchServer.stderr.on('data', sendServer);

    watchServer.on('close', sendServer);
}
function killWatch() {
    // if (isWatch) {
    if (watchView) {
        // watchView.stdin.pause();
        watchView.kill('SIGKILL');
    }
    if (watchServer) {
        // watchServer.stdin.pause();
        watchServer.kill('SIGKILL');
    }
    // }
}
// var process:any= require("process");
var isDev = /[\\/]electron-prebuilt[\\/]/.test(process.execPath);

function openWin(serverConf?:any) {
    ipcMain.on('open-devtool', (event:any, status:any) => {
        win.toggleDevTools({mode: 'detach'});
    });

    ipcMain.on('devWatch', (event:any, arg:any) => {
        sender = event.sender;
        devWatch();
    });

    win = new BrowserWindow({
        width: 950, height: 540,
        // width: 500, height: 540,
        resizable: false,
        frame: true,
        autoHideMenuBar: false,
        webaudio: false
    });
    // win.setMenu(null);
    win.setMenuBarVisibility(false);
    // win.loadURL('http://127.0.0.1');
    if (isDev)
        win.loadURL(`file://${__dirname}app/reload.html`);
    else
        win.loadURL(`file:///resources/app/reload.html`);
    // win.loadURL(`file:///app/reload.html`);
    win.on('closed', function () {
        win = null;
    });

    
    //todo print
    // http://electron.atom.io/docs/api/web-contents/
}


app.on('ready', onReady);
app.on('window-all-closed', ()=> {
    console.log('window-all-closed');
    killWatch();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    if (win === null) {
        // onReady();
    }
});