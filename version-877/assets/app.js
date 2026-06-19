(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      panel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;

    const showSlide = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
      setInterval(() => showSlide(active + 1), 5200);
    }
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    const categorySelect = filterPanel.querySelector('[data-filter-category]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const sortSelect = filterPanel.querySelector('[data-filter-sort]');
    const grid = document.querySelector('[data-card-grid]');
    const status = document.querySelector('[data-filter-status]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-movie-card]')) : [];

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const applyFilter = () => {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const category = categorySelect ? categorySelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const text = normalize([
          card.dataset.title,
          card.dataset.category,
          card.dataset.year,
          card.dataset.tags
        ].join(' '));
        const categoryMatched = !category || card.dataset.category === category;
        const yearMatched = !year || card.dataset.year === year;
        const keywordMatched = !keyword || text.includes(keyword);
        const matched = categoryMatched && yearMatched && keywordMatched;
        card.classList.toggle('is-filter-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (sortSelect && grid) {
        const sortValue = sortSelect.value;
        const sorted = cards.slice().sort((a, b) => {
          if (sortValue === 'year') {
            return Number(b.dataset.year) - Number(a.dataset.year);
          }
          if (sortValue === 'score') {
            return getScore(b) - getScore(a);
          }
          if (sortValue === 'views') {
            return getViews(b) - getViews(a);
          }
          return 0;
        });
        sorted.forEach((card) => grid.appendChild(card));
      }

      if (status) {
        const hasActiveFilter = Boolean(keyword || category || year);
        status.textContent = hasActiveFilter ? (visible ? `已匹配 ${visible} 部` : '暂无匹配内容') : '开始浏览';
      }
    };

    const getScore = (card) => {
      const score = card.querySelector('.card-meta span:last-child');
      return score ? Number(score.textContent.replace('分', '')) || 0 : 0;
    };

    const getViews = (card) => {
      const title = card.dataset.title || '';
      let total = 0;
      for (let i = 0; i < title.length; i += 1) {
        total += title.charCodeAt(i) * (i + 3);
      }
      return total;
    };

    [keywordInput, categorySelect, yearSelect, sortSelect].forEach((item) => {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  const searchResults = document.querySelector('[data-search-results]');

  if (searchResults) {
    const input = document.querySelector('[data-search-page-input]');
    const title = document.querySelector('[data-search-title]');
    const status = document.querySelector('[data-search-status]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    const normalize = (value) => String(value || '').trim().toLowerCase();
    const key = normalize(query);

    if (!key) {
      searchResults.innerHTML = '<div class="search-empty">输入关键词即可搜索影片</div>';
      return;
    }

    const data = Array.isArray(window.SearchMovies) ? window.SearchMovies : [];
    const matched = data.filter((movie) => {
      const text = normalize([
        movie.title,
        movie.category,
        movie.year,
        movie.region,
        movie.oneLine,
        movie.summary,
        (movie.tags || []).join(' ')
      ].join(' '));
      return text.includes(key);
    });

    if (title) {
      title.textContent = `“${query}”搜索结果`;
    }

    if (status) {
      status.textContent = matched.length ? `已匹配 ${matched.length} 部` : '暂无匹配内容';
    }

    if (!matched.length) {
      searchResults.innerHTML = '<div class="search-empty">未找到相关影片</div>';
      return;
    }

    searchResults.innerHTML = matched.slice(0, 120).map((movie) => {
      const tags = (movie.tags || []).join(' ');
      return `
        <article class="movie-card" data-movie-card data-title="${escapeHtml(movie.title)}" data-category="${escapeHtml(movie.category)}" data-year="${escapeHtml(movie.year)}" data-tags="${escapeHtml(tags)}">
          <a class="poster-link" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}">
            <img src="${escapeHtml(movie.image)}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="card-duration">${escapeHtml(movie.duration)}</span>
            <span class="card-category">${escapeHtml(movie.category)}</span>
          </a>
          <div class="movie-card-body">
            <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
            <p>${escapeHtml(movie.oneLine || movie.summary)}</p>
            <div class="card-meta">
              <span>${escapeHtml(movie.year)}</span>
              <span>${escapeHtml(movie.region)}</span>
              <span>${escapeHtml(movie.score)}分</span>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
