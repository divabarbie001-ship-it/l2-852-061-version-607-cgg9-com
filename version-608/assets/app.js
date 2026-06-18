(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var typeFilter = panel.querySelector("[data-type-filter]");
            var yearFilter = panel.querySelector("[data-year-filter]");
            var sortSelect = panel.querySelector("[data-sort-select]");
            var grid = panel.nextElementSibling;
            var emptyState = grid ? grid.nextElementSibling : null;
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function applyFilters() {
                var keyword = valueOf(input);
                var typeValue = valueOf(typeFilter);
                var yearValue = valueOf(yearFilter);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title || "",
                        card.dataset.region || "",
                        card.dataset.type || "",
                        card.dataset.year || "",
                        card.dataset.tags || ""
                    ].join(" ").toLowerCase();
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesType = !typeValue || (card.dataset.type || "").toLowerCase() === typeValue;
                    var matchesYear = !yearValue || (card.dataset.year || "").toLowerCase() === yearValue;
                    var show = matchesKeyword && matchesType && matchesYear;
                    card.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visible === 0);
                }
            }

            function applySort() {
                if (!grid || !sortSelect) {
                    return;
                }
                var sortValue = sortSelect.value;
                var sorted = cards.slice();
                sorted.sort(function (a, b) {
                    if (sortValue === "year-desc") {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }
                    if (sortValue === "year-asc") {
                        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                    }
                    if (sortValue === "title-asc") {
                        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                    }
                    return cards.indexOf(a) - cards.indexOf(b);
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                applyFilters();
            }

            [input, typeFilter, yearFilter].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", applyFilters);
                    element.addEventListener("change", applyFilters);
                }
            });

            if (sortSelect) {
                sortSelect.addEventListener("change", applySort);
            }
        });
    });

    window.initVideoPlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var attached = false;
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            }
            attached = true;
        }

        function beginPlay() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", beginPlay);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                beginPlay();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
