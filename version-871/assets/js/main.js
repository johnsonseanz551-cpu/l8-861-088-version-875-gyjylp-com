document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initHeroCarousel();
  initGlobalSearch();
  initLocalFilters();
  initPlayers();
});

function initNavigation() {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (!header || !toggle) {
    return;
  }

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function initHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

  if (slides.length === 0) {
    return;
  }

  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });

  show(0);
  start();
}

function initGlobalSearch() {
  var forms = Array.prototype.slice.call(document.querySelectorAll('.global-search'));
  var data = window.MOVIE_SEARCH_DATA || [];

  forms.forEach(function (form) {
    var input = form.querySelector('input[type="search"]');
    var results = form.querySelector('.global-search-results');

    if (!input || !results) {
      return;
    }

    function closeResults() {
      results.hidden = true;
      results.innerHTML = '';
      document.body.classList.remove('search-active');
    }

    function render(query) {
      var keyword = query.trim().toLowerCase();

      if (!keyword) {
        closeResults();
        return;
      }

      var matches = data.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }).slice(0, 12);

      if (matches.length === 0) {
        results.hidden = false;
        results.innerHTML = '<div class="search-result-item"><div></div><div><strong>没有找到匹配影片</strong><small>可进入全部影片页继续筛选</small></div></div>';
        document.body.classList.add('search-active');
        return;
      }

      results.innerHTML = matches.map(function (movie) {
        return '<a class="search-result-item" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
          '<small>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</small></span>' +
          '</a>';
      }).join('');
      results.hidden = false;
      document.body.classList.add('search-active');
    }

    input.addEventListener('input', function () {
      render(input.value);
    });

    input.addEventListener('focus', function () {
      render(input.value);
    });

    form.addEventListener('submit', function (event) {
      var query = input.value.trim();
      if (!query) {
        event.preventDefault();
        return;
      }
      window.location.href = 'all-movies.html?q=' + encodeURIComponent(query);
      event.preventDefault();
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        closeResults();
      }
    });
  });
}

function initLocalFilters() {
  var input = document.querySelector('.local-filter-input');
  var typeSelect = document.querySelector('.local-type-filter');
  var yearSelect = document.querySelector('.local-year-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('.empty-state');

  if (cards.length === 0 || (!input && !typeSelect && !yearSelect)) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  function matchYear(cardYear, selectedYear) {
    if (!selectedYear) {
      return true;
    }
    if (selectedYear === '2021') {
      var numericYear = Number(cardYear.replace(/\D/g, '')) || 0;
      return numericYear <= 2021;
    }
    return cardYear.indexOf(selectedYear) !== -1;
  }

  function applyFilters() {
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var typeValue = typeSelect ? typeSelect.value : '';
    var yearValue = yearSelect ? yearSelect.value : '';
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-category') || ''
      ].join(' ').toLowerCase();
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
      var matchesYear = matchYear(cardYear, yearValue);
      var isVisible = matchesKeyword && matchesType && matchesYear;

      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  [input, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
}

function initPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.video-play-overlay');
    var message = shell.querySelector('.video-message');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;

    if (!video || !button || !stream) {
      return;
    }

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.hidden = false;
      }
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        }
        return Promise.resolve();
      }

      showMessage('当前浏览器暂不支持 HLS 播放，请使用 Chrome、Edge、Safari 或支持 m3u8 的浏览器。');
      return Promise.reject(new Error('HLS is not supported'));
    }

    button.addEventListener('click', function () {
      attachSource().then(function () {
        shell.classList.add('is-playing');
        return video.play();
      }).catch(function () {
        shell.classList.remove('is-playing');
        showMessage('播放启动失败，请检查网络或稍后重试。');
      });
    });
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
