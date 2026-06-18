(function () {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('#mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function uniqueValues(cards, name) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(name);
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select || select.dataset.ready === 'true') {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
        select.dataset.ready = 'true';
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var cards = queryAll('.filter-card');
        var input = document.querySelector('[data-filter-input]');
        var region = document.querySelector('[data-filter-region]');
        var type = document.querySelector('[data-filter-type]');
        var year = document.querySelector('[data-filter-year]');
        fillSelect(region, uniqueValues(cards, 'data-region'));
        fillSelect(type, uniqueValues(cards, 'data-type'));
        fillSelect(year, uniqueValues(cards, 'data-year'));
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }
        function apply() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
                    ok = false;
                }
                if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
                    ok = false;
                }
                if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                    ok = false;
                }
                card.classList.toggle('is-filtered-out', !ok);
            });
        }
        [input, region, type, year].forEach(function (item) {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });
        queryAll('[data-filter-chip]').forEach(function (chip) {
            chip.addEventListener('click', function () {
                if (input) {
                    input.value = chip.getAttribute('data-filter-chip') || '';
                    input.focus();
                    apply();
                }
            });
        });
        apply();
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = queryAll('[data-hero-slide]', root);
        var dots = queryAll('[data-hero-dot]', root);
        var background = root.querySelector('[data-hero-background]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
            if (background) {
                var image = slides[index].getAttribute('data-image');
                if (image) {
                    background.style.backgroundImage = "url('" + image + "')";
                }
            }
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 6500);
    }

    function setupPlayers() {
        queryAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            if (!video) {
                return;
            }
            function loadVideo() {
                if (video.dataset.loaded === 'true') {
                    return;
                }
                var stream = video.getAttribute('data-stream');
                if (!stream) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video.hlsInstance = hls;
                } else {
                    video.src = stream;
                }
                video.dataset.loaded = 'true';
            }
            function playVideo() {
                loadVideo();
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }
            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupFilters();
        setupHero();
        setupPlayers();
    });
}());
