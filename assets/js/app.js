(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var sections = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        sections.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var empty = scope.querySelector("[data-no-results]");
            if (!cards.length) {
                return;
            }

            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply(value) {
                var query = String(value || "").trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var target = card.getAttribute("data-search") || "";
                    var matched = !query || target.toLowerCase().indexOf(query) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", function () {
                    apply(input.value);
                });
                apply(input.value);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    var value = chip.getAttribute("data-filter-value") || "";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    if (input) {
                        input.value = value;
                    }
                    apply(value);
                });
            });
        });
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var overlay = shell.querySelector("[data-play-overlay]");
        var button = shell.querySelector("[data-play-button]");
        if (!video) {
            return;
        }
        var url = video.getAttribute("data-video-url");
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !url) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
            video.setAttribute("controls", "controls");
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.setAttribute("controls", "controls");
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
