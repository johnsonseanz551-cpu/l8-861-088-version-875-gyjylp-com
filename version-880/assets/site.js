(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMenu() {
    var toggle = qs('[data-nav-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        play();
      });
    });
    play();
  }

  function initCardFilters() {
    var list = qs('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = qsa('[data-card]', list);
    var textInput = qs('[data-card-filter]');
    var yearInput = qs('[data-year-filter]');
    var sortInput = qs('[data-sort-filter]');
    var empty = qs('[data-empty-state]');
    var url = new URL(window.location.href);
    var query = url.searchParams.get('q');

    if (query && textInput) {
      textInput.value = query;
    }

    cards.forEach(function (card, position) {
      card.setAttribute('data-position', position);
    });

    function apply() {
      var keyword = normalize(textInput ? textInput.value : '');
      var year = yearInput ? yearInput.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-keywords')
        ].join(' '));
        var matchText = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var show = matchText && matchYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    function sortCards() {
      if (!sortInput) {
        return;
      }
      var mode = sortInput.value;
      var sorted = cards.slice();
      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
        });
      } else if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      } else {
        sorted.sort(function (a, b) {
          return parseInt(a.getAttribute('data-position'), 10) - parseInt(b.getAttribute('data-position'), 10);
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (textInput) {
      textInput.addEventListener('input', apply);
    }
    if (yearInput) {
      yearInput.addEventListener('change', apply);
    }
    if (sortInput) {
      sortInput.addEventListener('change', function () {
        sortCards();
        apply();
      });
    }
    sortCards();
    apply();
  }

  function initPlayer() {
    var video = qs('[data-player-video]');
    var configNode = qs('#player-config');
    if (!video || !configNode) {
      return;
    }
    var config;
    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      config = {};
    }
    var streamUrl = config.url;
    if (!streamUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    var overlay = qs('[data-player-overlay]');
    function startPlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', startPlay);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initCardFilters();
    initPlayer();
  });
})();
