(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-video-player'));

    players.forEach(function (video) {
        var source = video.getAttribute('data-src');
        var shell = video.closest('.player-shell');
        var button = shell ? shell.querySelector('.player-start') : null;
        var ready = false;

        var setup = function () {
            if (ready || !source) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        };

        var play = function () {
            setup();
            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        };

        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('playing');
            }
        });

        video.addEventListener('pause', function () {
            if (shell) {
                shell.classList.remove('playing');
            }
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        if (button) {
            button.addEventListener('click', play);
        }

        setup();
    });
})();
