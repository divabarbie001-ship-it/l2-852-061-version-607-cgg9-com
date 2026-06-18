(function () {
  function initVideo(video) {
    var stream = video.getAttribute('data-stream');
    if (!stream || video.getAttribute('data-ready') === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = stream;
    }
    video.setAttribute('data-ready', '1');
  }

  function startPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    if (!video) {
      return;
    }
    initVideo(video);
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
      var overlay = box.querySelector('.player-overlay');
      var video = box.querySelector('video');
      if (overlay) {
        overlay.addEventListener('click', function () {
          startPlayer(box);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.getAttribute('data-ready') !== '1') {
            startPlayer(box);
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
      }
    });
  });
}());
