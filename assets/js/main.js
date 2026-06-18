(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function syncImages() {
    all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  function mobileMenu() {
    var toggle = one('.mobile-toggle');
    var panel = one('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      panel.setAttribute('aria-hidden', opened ? 'false' : 'true');
    });
  }

  function heroCarousel() {
    var slides = all('[data-hero-slide]');
    var dots = all('[data-hero-target]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-target'), 10) || 0);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });
    timer = setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function searchPage() {
    var input = one('#siteSearchInput');
    var year = one('#yearFilter');
    var cards = all('[data-card]');
    var buttons = all('[data-filter-category]');
    var empty = one('#searchEmpty');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var currentCategory = '';
    var q = params.get('q') || '';
    input.value = q;
    function apply() {
      var value = input.value.trim().toLowerCase();
      var yearValue = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cat = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var ok = (!value || text.indexOf(value) !== -1) && (!currentCategory || cat === currentCategory) && (!yearValue || cardYear === yearValue);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }
    input.addEventListener('input', apply);
    if (year) {
      year.addEventListener('change', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentCategory = button.getAttribute('data-filter-category') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncImages();
    mobileMenu();
    heroCarousel();
    searchPage();
  });
}());
