(function () {
    var video = document.querySelector('[data-video-player]');
    var cover = document.querySelector('[data-player-cover]');
    var url = window.__videoUrl;
    if (!video || !url) {
        return;
    }

    var started = false;
    var hls = null;

    function attachSource() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }
        video.src = url;
    }

    function startPlay() {
        if (!started) {
            started = true;
            attachSource();
        }
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlay);
    }
    video.addEventListener('click', function () {
        if (!started) {
            startPlay();
        }
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
