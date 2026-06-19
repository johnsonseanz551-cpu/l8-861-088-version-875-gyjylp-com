(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function activate(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          activate(current + 1);
        }, 5200);
      }
    }

    var localSearch = document.querySelector("[data-local-search]");
    if (localSearch) {
      var localCards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card"));
      localSearch.addEventListener("input", function () {
        var value = localSearch.value.trim().toLowerCase();
        localCards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          card.hidden = value && text.indexOf(value) === -1;
        });
      });
    }

    var searchInput = document.querySelector("[data-search-input]");
    var searchResults = document.querySelector("[data-search-results]");
    if (searchInput && searchResults) {
      var params = new URLSearchParams(window.location.search);
      var cards = Array.prototype.slice.call(searchResults.querySelectorAll(".movie-card"));
      var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-search-filter]"));
      var activeCategory = "all";
      var query = params.get("q") || "";
      searchInput.value = query;

      function filterCards() {
        var value = searchInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var categoryMatch = activeCategory === "all" || card.getAttribute("data-category") === activeCategory;
          var textMatch = !value || text.indexOf(value) > -1;
          card.hidden = !(categoryMatch && textMatch);
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeCategory = button.getAttribute("data-search-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          filterCards();
        });
      });

      searchInput.addEventListener("input", filterCards);
      filterCards();
    }
  });
})();
