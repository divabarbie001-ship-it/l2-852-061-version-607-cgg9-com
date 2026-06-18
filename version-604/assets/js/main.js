document.addEventListener("DOMContentLoaded", function () {
  initMobileNavigation();
  initHeroCarousel();
  initMovieFilters();
  initPlayer();
});

function initMobileNavigation() {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function initHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length === 0) {
    return;
  }

  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      window.clearInterval(timer);
      showSlide(index);
      start();
    });
  });

  showSlide(0);
  start();
}

function initMovieFilters() {
  var panel = document.querySelector("[data-filter-panel]");

  if (!panel) {
    return;
  }

  var searchInput = panel.querySelector("[data-search-input]");
  var regionSelect = panel.querySelector("[data-region-select]");
  var yearSelect = panel.querySelector("[data-year-select]");
  var typeSelect = panel.querySelector("[data-type-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var count = document.querySelector("[data-result-count]");
  var empty = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCards() {
    var query = normalize(searchInput && searchInput.value);
    var region = normalize(regionSelect && regionSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));

      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesRegion = !region || normalize(card.dataset.region).indexOf(region) !== -1;
      var matchesYear = !year || normalize(card.dataset.year) === year;
      var matchesType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
      var isVisible = matchesQuery && matchesRegion && matchesYear && matchesType;

      card.style.display = isVisible ? "" : "none";

      if (isVisible) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = "当前显示 " + visible + " 部影片";
    }

    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });

  filterCards();
}

function initPlayer() {
  var shell = document.querySelector("[data-player]");

  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var overlay = shell.querySelector("[data-player-overlay]");
  var playButton = shell.querySelector("[data-play-button]");
  var source = video ? video.getAttribute("data-src") : "";
  var initialized = false;

  function startVideo() {
    if (!video || !source) {
      return;
    }

    if (!initialized) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }

      initialized = true;
    }

    if (overlay) {
      overlay.classList.add("hidden");
    }

    video.play().catch(function () {
      video.setAttribute("controls", "controls");
    });
  }

  if (playButton) {
    playButton.addEventListener("click", function (event) {
      event.stopPropagation();
      startVideo();
    });
  }

  shell.addEventListener("click", startVideo);
}
