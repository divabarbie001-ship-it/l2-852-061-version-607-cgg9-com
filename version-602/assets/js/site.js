
(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function normalise(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var cardList = document.querySelector('[data-card-list]');
    var result = document.querySelector('[data-filter-result]');

    if (!input || !cardList) {
      return;
    }

    var cards = selectAll('[data-movie-card]', cardList);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
      input.value = initialQuery;
    }

    function filterCards() {
      var query = normalise(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].map(normalise).join(' ');
        var match = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) {
          visible += 1;
        }
      });

      var empty = cardList.querySelector('[data-empty-result]');
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'no-results';
        empty.setAttribute('data-empty-result', 'true');
        empty.textContent = '没有找到匹配影片，请尝试更换关键词。';
        cardList.appendChild(empty);
      }
      empty.style.display = visible === 0 ? 'block' : 'none';

      if (result) {
        result.textContent = query ? '当前筛选结果：' + visible + ' 部影片' : '当前显示：' + cards.length + ' 部影片';
      }
    }

    input.addEventListener('input', filterCards);
    filterCards();
  }

  function setupImageFallback() {
    selectAll('img[data-fallback]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
        image.alt = image.alt || '影片封面';
      }, { once: true });
    });
  }

  function setupPlayerScroll() {
    var button = document.querySelector('[data-scroll-player]');
    var player = document.querySelector('[data-player]');

    if (!button || !player) {
      return;
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      player.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupImageFallback();
    setupPlayerScroll();
  });
})();
