/**
 * fullscreen.js — self-contained fullscreen controller for all lecture modules
 * Put this snippet before closing </body> tag in each lecture's index.html to enable fullscreen mode:
 * <script src="../fullscreen.js"></script>
 */
(function () {

    /* ── CSS ── */
    const css = `
    #fs-btn {
      position      : absolute;
      bottom        : -50px;
      right         : 20px;
      width         : 34px;
      height        : 34px;
      padding       : 0;
      background    : #ffffff;
      border        : 1px solid #e2e8f0;
      border-radius : 8px;
      color         : #64748b;
      cursor        : pointer;
      box-shadow    : 0 1px 3px rgba(0,0,0,0.07);
      transition    : color .2s, border-color .2s, background .2s;
      display       : flex;
      align-items   : center;
      justify-content: center;
      z-index       : 10;
    }

    #fs-btn:hover {
      color        : #2563eb;
      border-color : #2563eb;
    }

    #fs-btn.fs-active {
      background   : #dbeafe;
      color        : #1d4ed8;
      border-color : #2563eb;
    }

    #fs-btn svg {
      width         : 16px;
      height        : 16px;
      pointer-events: none;
    }

    #slides:fullscreen,
    #slides:-webkit-full-screen {
      background : #f8fafc;
      overflow-y : auto;
      padding    : 28px 32px 32px;
      font-size  : 1.1rem;
      overflow-x: hidden;
    }

    #slides:fullscreen .card,
    #slides:-webkit-full-screen .card {
      width            : 100%;
      max-width        : 90vw;
      height           : auto;
      min-height       : 88vh;
      margin           : 0 auto;
      display          : flex;
      flex-direction   : column;
      transform        : scale(1.01);
      transform-origin : top center;
      overflow         : hidden;
    }

    #slides:fullscreen #slidesContainer,
    #slides:-webkit-full-screen #slidesContainer {
      flex      : 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    #slides:fullscreen h1,
    #slides:-webkit-full-screen h1 { font-size: 3rem; }

    #slides:fullscreen h2,
    #slides:-webkit-full-screen h2 { font-size: 2.3rem; }

    #slides:fullscreen h3,
    #slides:-webkit-full-screen h3 { font-size: 1.5rem; }

    #slides:fullscreen p,
    #slides:-webkit-full-screen p,
    #slides:fullscreen li,
    #slides:-webkit-full-screen li,
    #slides:fullscreen td,
    #slides:-webkit-full-screen td,
    #slides:fullscreen th,
    #slides:-webkit-full-screen th,
    #slides:fullscreen button,
    #slides:-webkit-full-screen button {
      font-size  : 1.08rem;
      line-height: 1.7;
    }

    #slides:fullscreen pre,
    #slides:-webkit-full-screen pre,
    #slides:fullscreen code,
    #slides:-webkit-full-screen code { font-size: 1rem; }

    #slides:fullscreen .slide.active,
    #slides:-webkit-full-screen .slide.active { min-height: auto; }

    #slides:fullscreen #fs-btn,
    #slides:-webkit-full-screen #fs-btn {
      position: fixed;
      bottom  : 20px;
      right   : 20px;
      z-index : 9999;
    }
  `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    /* ── SVG icons ── */
    const ICON_MAX = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 3H3v5"/>
      <path d="M16 3h5v5"/>
      <path d="M3 16v5h5"/>
      <path d="M21 16v5h-5"/>
    </svg>
  `;

    const ICON_MIN = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 3v5H3"/>
      <path d="M16 3v5h5"/>
      <path d="M3 16h5v5"/>
      <path d="M21 16h-5v5"/>
    </svg>
  `;

    /* ── Scroll reset helper ── */
    function resetAllScroll() {
        window.scrollTo({ top: 0, behavior: 'instant' });

        const slides = document.getElementById('slides');
        if (slides) slides.scrollTop = 0;

        const container = document.getElementById('slidesContainer');
        if (container) container.scrollTop = 0;
    }

    /* ── Init ── */
    function init() {

        const target = document.getElementById('slides');
        if (!target) return;

        if (getComputedStyle(target).position === 'static') {
            target.style.position = 'relative';
        }

        /* ── Fullscreen button ── */
        const btn = document.createElement('button');
        btn.id = 'fs-btn';
        btn.title = 'Toggle fullscreen';
        btn.innerHTML = ICON_MAX;
        target.appendChild(btn);

        /* ── Sync button UI to fullscreen state ── */
        function syncUI() {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);

            btn.innerHTML = isFs ? ICON_MIN : ICON_MAX;
            btn.classList.toggle('fs-active', isFs);
            btn.title = isFs ? 'Exit fullscreen' : 'Toggle fullscreen';

            if (isFs) {
                requestAnimationFrame(function () {
                    resetAllScroll();
                    target.offsetHeight;
                });
            }
        }

        /* ── Button click ── */
        btn.addEventListener('click', function () {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);

            if (!isFs) {
                const req = target.requestFullscreen || target.webkitRequestFullscreen;
                if (req) req.call(target);
            } else {
                const exit = document.exitFullscreen || document.webkitExitFullscreen;
                if (exit) exit.call(document);
            }
        });

        /* ── Fullscreen change events ── */
        document.addEventListener('fullscreenchange', syncUI);
        document.addEventListener('webkitfullscreenchange', syncUI);

        /* ── Reset scroll on slide change ── */
        const slideEls = document.querySelectorAll('.slide');

        if (slideEls.length) {
            const observer = new MutationObserver(function (mutations) {
                for (const mutation of mutations) {
                    if (
                        mutation.type === 'attributes' &&
                        mutation.attributeName === 'class' &&
                        mutation.target.classList.contains('active')
                    ) {
                        resetAllScroll();
                        break;
                    }
                }
            });

            slideEls.forEach(function (slide) {
                observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
            });
        }
        document.addEventListener('keydown', function (e) {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            if (!isFs) return;
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

            const container = document.getElementById('slidesContainer');
            const el = (container && container.scrollHeight > container.clientHeight)
                ? container
                : (target.scrollHeight > target.clientHeight ? target : null);

            if (!el) return;
            e.preventDefault();
            el.scrollBy({ top: e.key === 'ArrowDown' ? 120 : -120, behavior: 'smooth' });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();