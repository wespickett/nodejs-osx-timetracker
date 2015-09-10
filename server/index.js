var socketIO = require('socket.io')(9009);
var exec = require('child_process').exec;
var fs = require('fs');

//var TIMEOUT_PERIOD = 60*60*1000; //1 hr
var TIMEOUT_PERIOD = 30*1000; //30 seconds
var UPDATE_CLIENT_COUNT = 10; //update client every TIMEOUT_PERIOD * UPDATE_CLIENT_COUNT
var trackProgressTimeout;
var screencaptureFolder = 'screencaptures/';
var count = 0;

function trackProgress() {
    var timestamp = Date.now();
    var fileName = screencaptureFolder + timestamp + '.jpg';
    exec('mkdir screencaptures');
    exec('screencapture -x ' + fileName);
    console.log('screencapture:' + fileName);

    if (++count === UPDATE_CLIENT_COUNT) updateClientWithProgress();

    trackProgressTimeout = setTimeout(trackProgress, TIMEOUT_PERIOD);
}

function updateClientWithProgress() {
    count = 0;

    var screenShotFileNames = fs.readdirSync(screencaptureFolder);

    console.log('=-=-=-=-=-=-=-=- SEND TO CLIENT -=-=-=-=-=-=-=-=');
    socketIO.emit('timeupdate', {
        screenShots: screenShotFileNames
    });
}

socketIO.on('connection', function(socket) {
    console.log('user connected to socket.');

    updateClientWithProgress();
    trackProgress();
});

socketIO.on('disconnect', function(socket) {
    console.log('user disconnected from socket.');

    clearTimeout(trackProgressTimeout);
});
