
// Function to get URL parameters
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        v: params.get('videoId'),
        s: params.get('startTime'),
        e: params.get('endTime'),
        l: params.get('loopCount'),
        d: params.get('delay'),
        n: params.get('note')
    };
}

// Set the input values based on query parameters
function setInputValuesFromQuery() {
    const { v, s, e, l, d, n } = getQueryParams();

    if (v) document.getElementById('videoIdInput').value = v;
    if (s) document.getElementById('startTimeInput').value = s;
    if (e) document.getElementById('endTimeInput').value = e;
    if (l) document.getElementById('loopCountInput').value = l;
    if (d) document.getElementById('delayInput').value = d;
    if (n) document.getElementById('noteInput').value = decodeURIComponent(n);
}

// Update the URL based on current input values
function updateUrl() {
    const videoId = document.getElementById('videoIdInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;
    const loopCount = document.getElementById('loopCountInput').value;
    const delay = document.getElementById('delayInput').value;
    const noteValue = document.getElementById('noteInput').value;

    let newUrl = `${window.location.origin}${window.location.pathname}?v=${videoId}&s=${startTime}&e=${endTime}&l=${loopCount}&d=${delay}`;
    if (noteValue) {
        const note = encodeURIComponent(noteValue);
        newUrl += `&n=${note}`;
    }
    window.history.replaceState(null, '', newUrl);
}

// Copy current URL to clipboard
function copyUrl() {
    updateUrl();
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('URL copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy URL: ', err);
    });
}

// Load YouTube IFrame Player API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var loopCount = 0;
var maxLoopCount = 0;
var startTime = 0;
var endTime = 0;
var delayTime = 0;

// Called when the API is ready
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Load the video based on input values
function loadVideo() {
    var videoId = document.getElementById('videoIdInput').value;
    startTime = parseFloat(document.getElementById('startTimeInput').value) || 0;
    endTime = parseFloat(document.getElementById('endTimeInput').value) || 0;
    maxLoopCount = parseInt(document.getElementById('loopCountInput').value) || 0;
    delayTime = parseFloat(document.getElementById('delayInput').value) || 0;

    if (player && videoId && startTime < endTime && maxLoopCount > 0) {
        loopCount = 0;
        player.loadVideoById(videoId, startTime);
    }
    updateUrl();
}

// Called when the player is ready
function onPlayerReady(event) {
    player.seekTo(startTime);
}

// Called when the player state changes
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        setTimeout(checkTime, 100);
    }
}

// Check the current playback time and handle looping
function checkTime() {
    if (player.getCurrentTime() >= endTime) {
        loopCount++;
        if (loopCount < maxLoopCount) {
            player.pauseVideo();
            setTimeout(function () {
                player.seekTo(startTime);
                player.playVideo();
            }, delayTime * 1000);
        } else {
            player.stopVideo();
        }
    } else if (loopCount < maxLoopCount) {
        setTimeout(checkTime, 100);
    }
}

// Save current input values to localStorage
function saveData() {
    const videoId = document.getElementById('videoIdInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;
    const loopCount = document.getElementById('loopCountInput').value;
    const delay = document.getElementById('delayInput').value;
    const note = document.getElementById('noteInput').value;

    const savedData = JSON.parse(localStorage.getItem('savedDataSets') || '[]');
    const newData = { videoId, startTime, endTime, loopCount, delay, note };

    savedData.push(newData);
    localStorage.setItem('savedDataSets', JSON.stringify(savedData));

    updateSavedDataSelect();
}

// Load saved data sets into the select element
function updateSavedDataSelect() {
    const savedData = JSON.parse(localStorage.getItem('savedDataSets') || '[]');
    const select = document.getElementById('savedDataSelect');

    select.innerHTML = '<option value="">Select a saved data set</option>';

    savedData.forEach((data, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Video ID: ${data.videoId}, Start: ${data.startTime}, End: ${data.endTime}`;
        select.appendChild(option);
    });
}

// Load selected saved data into inputs
function loadSavedData() {
    const index = document.getElementById('savedDataSelect').value;
    if (index === '') return;

    const savedData = JSON.parse(localStorage.getItem('savedDataSets') || '[]');
    const data = savedData[index];

    if (data) {
        document.getElementById('videoIdInput').value = data.videoId;
        document.getElementById('startTimeInput').value = data.startTime;
        document.getElementById('endTimeInput').value = data.endTime;
        document.getElementById('loopCountInput').value = data.loopCount;
        document.getElementById('delayInput').value = data.delay;
        document.getElementById('noteInput').value = data.note;
        updateUrl();
    }
}

// Initialize on page load
window.onload = function () {
    setInputValuesFromQuery();
    updateSavedDataSelect();
};

// Add event listener for input changes
document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', updateUrl);
});

// Add event listener for Enter key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('loadVideoButton').click();
    }
});
