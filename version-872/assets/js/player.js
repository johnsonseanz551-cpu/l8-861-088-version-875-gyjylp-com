function initMoviePlayer(source) {
  var video = document.querySelector("[data-player-video]");
  var cover = document.querySelector("[data-player-cover]");
  var started = false;
  var hls = null;

  function attach() {
    if (!video || started) {
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    video.controls = true;
  }

  function play() {
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  if (!video) {
    return;
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (!started) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (!started) {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
