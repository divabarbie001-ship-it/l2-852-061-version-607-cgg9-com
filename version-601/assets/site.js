(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));

  searchForms.forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var region = form.querySelector('[data-region-filter]');
    var year = form.querySelector('[data-year-filter]');
    var reset = form.querySelector('[data-reset-filter]');
    var scope = document.querySelector(form.getAttribute('data-search-panel')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    var empty = scope.querySelector('[data-no-result]');

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matched = matchedQuery && matchedRegion && matchedYear;

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (year) {
          year.value = '';
        }
        applyFilter();
      });
    }
  });
}());
