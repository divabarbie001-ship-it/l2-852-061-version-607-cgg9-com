(function () {
  const root = document.body.getAttribute('data-root') || './';
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const searchInput = document.getElementById('global-search-input');
  const searchPanel = document.getElementById('search-panel');

  function withRoot(path) {
    return root + path;
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('active', idx === heroIndex);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('active', idx === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () {
      showSlide(idx);
      if (heroTimer) {
        window.clearInterval(heroTimer);
        startHero();
      }
    });
  });

  showSlide(0);
  startHero();

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearch(query) {
    if (!searchPanel) {
      return;
    }
    const text = normalize(query);
    if (!text) {
      searchPanel.hidden = true;
      searchPanel.innerHTML = '';
      return;
    }
    const source = Array.isArray(window.MOVIES_INDEX) ? window.MOVIES_INDEX : [];
    const results = source.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.year).includes(text);
    }).slice(0, 12);

    if (!results.length) {
      searchPanel.hidden = false;
      searchPanel.innerHTML = '<div class="empty-state" style="display:block">没有找到匹配影片</div>';
      return;
    }

    searchPanel.hidden = false;
    searchPanel.innerHTML = results.map(function (movie) {
      return '<a class="search-item" href="' + withRoot(movie.link) + '">' +
        '<img src="' + withRoot(movie.image) + '" alt="' + escapeHtml(movie.title) + '">' +
        '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
        '<span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</span>' +
        '<span>' + escapeHtml(movie.oneLine) + '</span></span></a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
    searchInput.addEventListener('focus', function () {
      renderSearch(searchInput.value);
    });
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.global-search')) {
        if (searchPanel) {
          searchPanel.hidden = true;
        }
      }
    });
  }

  const pageFilter = document.getElementById('page-filter-input');
  const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
  const filterCards = Array.from(document.querySelectorAll('[data-filter-card]'));
  const emptyState = document.getElementById('empty-state');
  let activeFilter = 'all';

  function applyPageFilter() {
    if (!filterCards.length) {
      return;
    }
    const text = normalize(pageFilter ? pageFilter.value : '');
    let visible = 0;
    filterCards.forEach(function (card) {
      const haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-category'));
      const matchesText = !text || haystack.includes(text);
      const matchesFilter = activeFilter === 'all' || haystack.includes(activeFilter);
      const show = matchesText && matchesFilter;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (pageFilter) {
    pageFilter.addEventListener('input', applyPageFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyPageFilter();
    });
  });

  applyPageFilter();
})();
