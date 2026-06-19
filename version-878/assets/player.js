(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".video-start");
      var stream = box.getAttribute("data-stream") || "";
      var bound = false;
      var hlsInstance = null;

      function bindStream() {
        if (bound || !video || !stream) {
          return;
        }
        bound = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function startVideo() {
        bindStream();
        if (button) {
          button.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      bindStream();

      if (button) {
        button.addEventListener("click", startVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
