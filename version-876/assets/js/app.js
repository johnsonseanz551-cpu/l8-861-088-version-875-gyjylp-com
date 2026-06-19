(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        var posters = Array.prototype.slice.call(document.querySelectorAll(".hero-poster"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = next % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
            posters.forEach(function (poster) {
                poster.classList.toggle("is-active", Number(poster.getAttribute("data-hero-index")) === index);
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var scope = document.querySelector(form.getAttribute("data-filter-form"));
            if (!scope) {
                return;
            }
            var input = form.querySelector("input[type='search']");
            var select = form.querySelector("select");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var year = select ? select.value : "";
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchedYear = !year || (card.getAttribute("data-year") || "").indexOf(year) !== -1;
                    card.style.display = matchedKeyword && matchedYear ? "" : "none";
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
        });
    }

    function initSearchPage() {
        var results = document.getElementById("search-results");
        if (!results || typeof SEARCH_INDEX === "undefined") {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim();
        var input = document.getElementById("search-page-input");
        if (input) {
            input.value = keyword;
        }
        if (!keyword) {
            results.innerHTML = '<div class="empty-state">输入片名、类型、年份或标签，即可浏览相关影片。</div>';
            return;
        }
        var words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = SEARCH_INDEX.filter(function (item) {
            var haystack = [item.title, item.one, item.genre, item.tags, item.year, item.region].join(" ").toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 160);
        if (!matches.length) {
            results.innerHTML = '<div class="empty-state">暂无匹配影片，换个关键词试试。</div>';
            return;
        }
        results.innerHTML = '<div class="movie-grid">' + matches.map(function (item) {
            return [
                '<a class="movie-card" href="' + item.link + '">',
                '<span class="card-poster">',
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="card-duration">' + item.duration + '</span>',
                '<span class="card-category">' + escapeHtml(item.category) + '</span>',
                '</span>',
                '<span class="card-body">',
                '<strong>' + escapeHtml(item.title) + '</strong>',
                '<span class="card-desc">' + escapeHtml(item.one) + '</span>',
                '<span class="card-foot"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.genre) + '</span></span>',
                '</span>',
                '</a>'
            ].join('');
        }).join('') + '</div>';
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    function initPlayer() {
        var video = document.querySelector("video[data-stream]");
        if (!video) {
            return;
        }
        var streamUrl = video.getAttribute("data-stream");
        var cover = document.querySelector(".player-cover");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-target]"));
        var attached = false;
        function attachStream() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            attached = true;
        }
        function startPlayback() {
            attachStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayback();
            });
        });
        if (cover) {
            cover.addEventListener("click", startPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initSearchPage();
        initPlayer();
    });
})();
