(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startSlider() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    showSlide(0);
    startSlider();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startSlider();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startSlider();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startSlider();
    });
  });

  var localFilter = document.querySelector('[data-local-filter]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

  if (localFilter && filterCards.length) {
    localFilter.addEventListener('input', function () {
      var keyword = localFilter.value.trim().toLowerCase();

      filterCards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
      });
    });
  }

  function initializePlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-button]');
    var streamUrl = player.getAttribute('data-stream');
    var ready = false;

    function bindStream() {
      if (!video || !streamUrl || ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      bindStream();

      if (overlay) {
        overlay.classList.add('hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    player.addEventListener('click', function (event) {
      if (event.target === player) {
        playVideo();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);

  var movies = window.SITE_MOVIES || [];
  var searchInput = document.querySelector('[data-search-input]');
  var searchRegion = document.querySelector('[data-search-region]');
  var searchType = document.querySelector('[data-search-type]');
  var searchYear = document.querySelector('[data-search-year]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchStatus = document.querySelector('[data-search-status]');

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[item];
    });
  }

  function movieCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="rating-badge">' + escapeHtml(movie.rating) + '</span>',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="poster-gradient"></span>',
      '</a>',
      '<div class="movie-info">',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function renderSearch() {
    if (!searchResults) {
      return;
    }

    var keyword = (searchInput ? searchInput.value : '').trim().toLowerCase();
    var region = searchRegion ? searchRegion.value : '';
    var type = searchType ? searchType.value : '';
    var year = searchYear ? searchYear.value : '';

    var matched = movies.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
      var keywordOk = !keyword || text.indexOf(keyword) !== -1;
      var regionOk = !region || movie.region === region;
      var typeOk = !type || movie.type === type;
      var yearOk = !year || String(movie.year) === String(year);
      return keywordOk && regionOk && typeOk && yearOk;
    }).slice(0, 120);

    searchResults.innerHTML = matched.map(movieCard).join('');

    if (searchStatus) {
      searchStatus.textContent = matched.length ? '匹配影片' : '暂无匹配影片';
    }
  }

  [searchInput, searchRegion, searchType, searchYear].forEach(function (control) {
    if (control) {
      control.addEventListener('input', renderSearch);
      control.addEventListener('change', renderSearch);
    }
  });

  if (searchResults) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    renderSearch();
  }
})();
