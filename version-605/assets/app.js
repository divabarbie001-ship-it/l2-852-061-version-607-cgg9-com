(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    if (slides.length > 1) {
        var active = 0;
        var show = function (next) {
            active = next;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === active);
            });
            thumbs.forEach(function (thumb, index) {
                thumb.classList.toggle('is-active', index === active);
            });
        };
        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () {
                show(index);
            });
        });
        setInterval(function () {
            show((active + 1) % slides.length);
        }, 5200);
    }

    var filter = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    if (filter && cards.length) {
        filter.addEventListener('input', function () {
            var query = filter.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
                card.style.display = text.indexOf(query) > -1 ? '' : 'none';
            });
        });
    }

    var searchRoot = document.querySelector('[data-search-results]');
    if (searchRoot && window.SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var q = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-input]');
        if (input) {
            input.value = q;
        }
        var render = function (items) {
            if (!items.length) {
                searchRoot.innerHTML = '<div class="empty-result">未找到相关内容</div>';
                return;
            }
            searchRoot.innerHTML = items.slice(0, 120).map(function (item) {
                return '<article class="movie-card" data-movie-card>' +
                    '<a class="poster" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="play-dot">▶</span>' +
                    '<span class="poster-year">' + escapeHtml(item.year) + '</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<div class="meta-row"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="tag-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        };
        var result = q ? window.SEARCH_INDEX.filter(function (item) {
            var hay = [item.title, item.region, item.type, item.genre, item.tags, item.oneLine, item.category].join(' ').toLowerCase();
            return hay.indexOf(q.toLowerCase()) > -1;
        }) : window.SEARCH_INDEX.slice(0, 48);
        render(result);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
