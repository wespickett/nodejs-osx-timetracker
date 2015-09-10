(function(){
    console.log('io', io);
    var socket = io.connect('http://localhost:9009');
    var screenShots = [];
    var imgList;
    var currentImageIndex = 0;
    var currentImageIndexEl;
    var rangeSlider;
    var screenShotsContainer;

    function updateScreenShotAlbum() { 
        screenShotsContainer.innerHTML = '';

        var imgsFrag = document.createDocumentFragment();
        for (var i = 0; i < screenShots.length; i++) {
            if (screenShots[i][screenShots[i].length - 3] !== 'j' ||
                screenShots[i][screenShots[i].length - 2] !== 'p' ||
                screenShots[i][screenShots[i].length - 1] !== 'g') {
                console.error('not a jpg', screenShots[i]);
                continue;
            }

            var newImg = document.createElement('img');
            newImg.src = 'file:///Users/wespickett/projects/timetracker-server/screencaptures/' + screenShots[i];
            newImg.setAttribute('width', '800px');
            newImg.classList.add('screenshot');
            imgsFrag.appendChild(newImg);
        }
        screenShotsContainer.appendChild(imgsFrag);
        imgList = screenShotsContainer.getElementsByTagName('img');
        imgList[0].classList.add('current-screenshot');
        document.getElementById('imageCount').innerHTML = imgList.length - 1;
        rangeSlider.setAttribute('max', imgList.length - 1);

        currentImageIndex = 0;
        currentImageIndexEl.innerHTML = currentImageIndex;
        rangeSlider.value = currentImageIndex;

        alert('Time update.')
    }

    function nextScreenShot() {
        imgList[currentImageIndex].classList.remove('current-screenshot');
        currentImageIndex = ++currentImageIndex % imgList.length;
        imgList[currentImageIndex].classList.add('current-screenshot');
        currentImageIndexEl.innerHTML = currentImageIndex;
        rangeSlider.value = currentImageIndex;
    }

    function slideToImage(event) {
        imgList[currentImageIndex].classList.remove('current-screenshot');
        currentImageIndex = this.value;
        imgList[currentImageIndex].classList.add('current-screenshot');
        currentImageIndexEl.innerHTML = currentImageIndex;
    }

    function previousScreenShot() {
        imgList[currentImageIndex].classList.remove('current-screenshot');
        currentImageIndex = (currentImageIndex === 0) ? imgList.length : currentImageIndex; 
        imgList[--currentImageIndex].classList.add('current-screenshot');
        currentImageIndexEl.innerHTML = currentImageIndex;
        rangeSlider.value = currentImageIndex;
    }

    socket.on('connect', function() {
        console.log('socket connected.');
    });

    socket.on('timeupdate', function(data) {
        console.log('timeupdate', data);
        screenShots = data.screenShots;
        updateScreenShotAlbum();
    });

    function keyPressed(event) {
        var code = (event.keyCode ? event.keyCode : event.which);
        if (code === 39) nextScreenShot();
        if (code === 37) previousScreenShot();
        event.stopPropagation();
    }

    document.addEventListener('DOMContentLoaded', function() {
        screenShotsContainer = document.getElementById('screenShots');
        currentImageIndexEl = document.getElementById('currentImageIndex');
        rangeSlider = document.getElementById('currentImageIndexSlider');
        rangeSlider.addEventListener('input', slideToImage);
        document.getElementById('nextScreenShot').addEventListener('click', nextScreenShot);
        document.getElementById('previousScreenShot').addEventListener('click', previousScreenShot);
        document.addEventListener('keydown', keyPressed);
    });

})();