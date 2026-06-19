(() => {
  const video = document.querySelector('[data-movie-player]');
  const trigger = document.querySelector('[data-player-trigger]');

  if (!video || !trigger) {
    return;
  }

  const source = video.getAttribute('data-video') || '';
  let mounted = false;
  let hlsInstance = null;

  const mount = () => {
    if (mounted || !source) {
      return;
    }

    mounted = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
          return;
        }
        hlsInstance.destroy();
        hlsInstance = null;
        video.src = source;
      });
      return;
    }

    video.src = source;
  };

  const play = async () => {
    mount();
    trigger.classList.add('is-hidden');
    video.controls = true;

    try {
      await video.play();
    } catch (error) {
      trigger.classList.remove('is-hidden');
    }
  };

  trigger.addEventListener('click', play);

  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', () => {
    trigger.classList.add('is-hidden');
  });
})();
