(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-header-search]').forEach(function(form) {
        form.addEventListener('submit', function(event) {
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (!query) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            window.location.href = './search.html?q=' + encodeURIComponent(query);
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                setSlide(index);
            });
        });

        setInterval(function() {
            setSlide(current + 1);
        }, 5200);

        setSlide(0);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var resultCount = document.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
        ].join(' '));
    }

    function applySearch(query) {
        var q = normalize(query).trim();
        var visible = 0;
        cards.forEach(function(card) {
            var show = !q || cardText(card).indexOf(q) !== -1;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
        if (resultCount) {
            resultCount.textContent = String(visible);
        }
    }

    if (searchInput) {
        searchInput.value = queryFromUrl;
        searchInput.addEventListener('input', function() {
            applySearch(searchInput.value);
        });
        applySearch(queryFromUrl);
    }

    document.querySelectorAll('[data-filter-bar]').forEach(function(bar) {
        var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        bar.querySelectorAll('[data-filter-value]').forEach(function(button) {
            button.addEventListener('click', function() {
                var value = button.getAttribute('data-filter-value') || 'all';
                bar.querySelectorAll('[data-filter-value]').forEach(function(item) {
                    item.classList.toggle('active', item === button);
                });
                var terms = value.split(/\s+/).filter(Boolean).map(normalize);
                var visible = 0;
                filterCards.forEach(function(card) {
                    var content = cardText(card);
                    var show = value === 'all' || terms.some(function(term) {
                        return content.indexOf(term) !== -1;
                    });
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });
                var localEmpty = document.querySelector('[data-empty-state]');
                if (localEmpty) {
                    localEmpty.classList.toggle('show', visible === 0);
                }
            });
        });
    });
})();
