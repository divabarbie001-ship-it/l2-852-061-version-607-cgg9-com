
function selectAll(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function setStatus(player, message) {
  var status = player.querySelector('[data-player-status]');

  if (status) {
    status.textContent = message;
  }
}

async function loadHlsModule() {
  var module = await import('./hls.js');
  return module.H;
}

async function attachHls(video, sourceUrl, player) {
  if (!sourceUrl) {
    setStatus(player, '当前影片没有可用播放源。');
    return false;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
    setStatus(player, '已绑定原生 HLS 播放源。');
    return true;
  }

  try {
    var Hls = await loadHlsModule();

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus(player, 'HLS 播放源加载完成。');
      });
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus(player, '网络异常，正在重新加载播放源。');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus(player, '媒体异常，正在尝试恢复。');
          hls.recoverMediaError();
          return;
        }

        setStatus(player, '播放器遇到不可恢复错误。');
        hls.destroy();
      });
      player.__hlsInstance = hls;
      return true;
    }
  } catch (error) {
    console.error('HLS 初始化失败：', error);
  }

  setStatus(player, '当前浏览器不支持 HLS 播放。');
  return false;
}

async function setupPlayer(player) {
  var video = player.querySelector('video');
  var button = player.querySelector('[data-player-start]');
  var sourceUrl = player.getAttribute('data-video-url');
  var isAttached = false;

  if (!video || !button) {
    return;
  }

  button.addEventListener('click', async function () {
    button.disabled = true;
    setStatus(player, '正在初始化播放器...');

    if (!isAttached) {
      isAttached = await attachHls(video, sourceUrl, player);
    }

    if (isAttached) {
      button.classList.add('is-hidden');
      try {
        await video.play();
      } catch (error) {
        setStatus(player, '播放已准备好，请再次点击视频播放。');
      }
    }

    button.disabled = false;
  });
}

selectAll('[data-player]').forEach(setupPlayer);
