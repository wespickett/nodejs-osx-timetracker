var socketIO = require('socket.io')(9009);
var childProcess = require('child_process');
var exec = childProcess.exec;
var fs = require('fs');
var im = require('imagemagick');

var TIMEOUT_PERIOD = 10*1000; //30 seconds
var UPDATE_CLIENT_COUNT = 10; //5 mins //update client every TIMEOUT_PERIOD * UPDATE_CLIENT_COUNT
var trackProgressTimeout;
var screencaptureFolder = 'screencaptures/';
var count = 0;
var numConnections = 0;

exec('mkdir screencaptures');

var fileNameSet = {};

fs.watch(screencaptureFolder, function (event, fileName) {

    switch (event) {
        case 'rename':
            if (fileName[fileName.length - 3] !== 'j' ||
                fileName[fileName.length - 2] !== 'p' ||
                fileName[fileName.length - 1] !== 'g') {
                break;
            }

            //Screen capture triggers 'rename' event twice
            //after that ignore all renames to prevent getting
            //stuck in an infinite loop
            if (!fileNameSet[fileName]) {
                fileNameSet[fileName] = 1;
                break; 
            } else if (fileNameSet[fileName] === 2) {
                break;
            } else {
                fileNameSet[fileName] = 2;
            }

            console.log('resize: ' + fileName);
            im.resize({
              srcPath: screencaptureFolder + fileName,
              dstPath: screencaptureFolder + fileName,
              quality: 0.75,
              format: 'jpg',
              width: 1200,
              height: 750
            }, function(err){
                if (err) {
                    console.log(err);
                    return;
                }

                console.log('resized: ' + fileName);         
            });
            break;
    }
});

function trackProgress(socket) {
    var timestamp = Date.now();
    var fileName = screencaptureFolder + timestamp + '.jpg';
    exec('screencapture -xC -T 0 -t jpg ' + fileName);
    console.log('screencapture:' + fileName);

    if (++count === UPDATE_CLIENT_COUNT) updateClientWithProgress(socket);

    trackProgressTimeout = setTimeout(function() {
        trackProgress(socket)
    }, TIMEOUT_PERIOD); 
}

function updateClientWithProgress(socket) {
    count = 0;

    var screenShotFileNames = fs.readdirSync(screencaptureFolder);

    console.log('=-=-=-=-=-=-=-=- SEND TO CLIENT -=-=-=-=-=-=-=-=');
    socket.emit('timeupdate', {
        screenShots: screenShotFileNames
    });
}

socketIO.on('connection', function(socket) {
    console.log('user connected to socket.');
    numConnections++;

    if (numConnections === 1) {
        updateClientWithProgress(socket);
        trackProgress(socket);
    } else {
        socket.emit('alreadyConnected');
        socket.disconnect();
    }

    socket.on('disconnect', function(socket) {
        console.log('user disconnected from socket.');
        numConnections--;

        clearTimeout(trackProgressTimeout);
    });
});

