(function() {
    function setupPlayer(box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('[data-video-overlay]');
        var button = box.querySelector('[data-play-button]');
        var src = box.getAttribute('data-src');
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared || !video || !src) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            box._hls = hls;
        }

        function start() {
            prepare();
            if (overlay) {
                overlay.style.display = 'none';
            }
            box.classList.add('is-playing');
            video.controls = true;
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function() {
                    if (overlay) {
                        overlay.style.display = '';
                    }
                    box.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    start();
                }
            });
        }
    }

    document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
