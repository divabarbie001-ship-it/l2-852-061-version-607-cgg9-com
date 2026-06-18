(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    show(0);
    play();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var targetSelector = form.getAttribute("data-target") || "#movie-list";
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".filter-card"));
      var input = form.querySelector("[data-filter-input]");
      var region = form.querySelector("[data-filter-region]");
      var year = form.querySelector("[data-filter-year]");
      var category = form.querySelector("[data-filter-category]");
      var empty = document.querySelector("[data-empty-state]");
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var r = region ? region.value : "";
        var y = year ? year.value : "";
        var c = category ? category.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (r && card.getAttribute("data-region") !== r) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          if (c && card.getAttribute("data-category") !== c) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }
      [input, region, year, category].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    if (!video || !source) {
      return;
    }
    var started = false;
    function begin() {
      if (!started) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.load();
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          video._hls = hls;
        } else {
          video.src = source;
          video.load();
          video.play().catch(function () {});
        }
        started = true;
      } else {
        video.play().catch(function () {});
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }
    if (cover) {
      cover.addEventListener("click", begin);
    }
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
