/**
 * MAYA VALLEY RESORT HAMPI
 * Netflix-Inspired Cinematic Streaming Experience Engine
 * 
 * Features:
 * - Full-Screen Film Burn Light Leak Transition Engine (triggerFilmBurn)
 * - 60 FPS Ambient Floating Embers Particle Canvas
 * - Scene Burn Observer on scroll transitions
 * - Opening hero movie shot transition (scale 1.08 -> 1.0, staggered text fade-in)
 * - Navigation background transition (transparent -> rgba(8,8,12,.95))
 * - 60 FPS requestAnimationFrame lerp scroll camera
 * - Horizontal 3D gallery with dynamic scale(1) & rotateY(±5deg)
 * - Interactive featured content cards rail & fullscreen lightbox
 * - Mobile responsive drawer menu
 */

(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;

  // Viewport metrics
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  // Physics State
  let targetScrollY = window.scrollY;
  let currentScrollY = window.scrollY;
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  // DOM Elements
  const netflixNav = document.getElementById('netflixNav');
  const heroBgPhoto = document.getElementById('heroBgPhoto');
  const heroLowerLeft = document.querySelector('.hero-lower-left');

  const mobileHamburger = document.getElementById('mobileHamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  // Film Burn & Ember Elements
  const filmBurnOverlay = document.getElementById('filmBurnOverlay');
  const emberCanvas = document.getElementById('emberCanvas');
  const emberCtx = emberCanvas ? emberCanvas.getContext('2d') : null;

  // Horizontal Gallery Elements
  const hGallerySection = document.getElementById('gallery-horizontal');
  const hGalleryTrack = document.getElementById('hGalleryTrack');
  const hPanels = Array.from(document.querySelectorAll('.h-panel'));
  const hGalleryProgressFill = document.getElementById('hGalleryProgressFill');
  const hCurIndex = document.getElementById('hCurIndex');
  const hNavPrev = document.getElementById('hNavPrev');
  const hNavNext = document.getElementById('hNavNext');
  let currentHIndex = 0;

  // Cards Rail & Lightbox
  const contentCards = Array.from(document.querySelectorAll('.content-card'));
  const lightbox = document.getElementById('cinematicLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;
  const galleryData = contentCards.map(card => ({
    src: card.querySelector('img').getAttribute('src'),
    alt: card.querySelector('img').getAttribute('alt'),
    caption: card.getAttribute('data-caption') || card.querySelector('.card-title').textContent
  }));

  /* ==========================================================================
     1. CINEMATIC FILM BURN TRANSITION ENGINE
     Fires a fiery light leak & heatwave across the viewport
     ========================================================================== */
  let burnTimer = null;

  function triggerFilmBurn(duration = 750) {
    if (!filmBurnOverlay) return;

    if (burnTimer) {
      clearTimeout(burnTimer);
    }

    filmBurnOverlay.classList.remove('active');
    // Force DOM reflow to restart animation reliably
    void filmBurnOverlay.offsetWidth;
    filmBurnOverlay.classList.add('active');

    burnTimer = setTimeout(() => {
      filmBurnOverlay.classList.remove('active');
      burnTimer = null;
    }, duration);
  }

  /* ==========================================================================
     2. FLOATING AMBIENT EMBERS CANVAS (60 FPS GPU-ACCELERATED)
     Gentle glowing golden-orange sparks that react to scroll velocity
     ========================================================================== */
  const EMBER_COUNT = 40;
  const embers = [];

  const emberColors = [
    'rgba(255, 179, 0, ',   // Golden Topaz
    'rgba(255, 112, 67, ',  // Sunset Coral
    'rgba(255, 61, 0, ',    // Fiery Orange
    'rgba(255, 238, 88, '   // Light Gold
  ];

  function initEmbers() {
    if (!emberCanvas || !emberCtx) return;

    emberCanvas.width = windowWidth;
    emberCanvas.height = windowHeight;

    embers.length = 0;
    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push({
        x: Math.random() * windowWidth,
        y: Math.random() * windowHeight,
        r: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: -(Math.random() * 0.8 + 0.4),
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
        baseAlpha: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    window.addEventListener('resize', () => {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
      if (emberCanvas) {
        emberCanvas.width = windowWidth;
        emberCanvas.height = windowHeight;
      }
    }, { passive: true });
  }

  function renderEmbers(time) {
    if (!emberCanvas || !emberCtx) return;

    emberCtx.clearRect(0, 0, windowWidth, windowHeight);

    const velocityBoost = Math.min(2.5, Math.abs(scrollVelocity) * 0.05);

    embers.forEach((ember) => {
      ember.pulsePhase += ember.pulseSpeed;
      const currentAlpha = Math.max(0.1, Math.min(1, ember.baseAlpha + Math.sin(ember.pulsePhase) * 0.25 + velocityBoost * 0.2));

      // Draw glowing ember
      emberCtx.beginPath();
      emberCtx.arc(ember.x, ember.y, ember.r + (velocityBoost * 0.5), 0, Math.PI * 2);
      emberCtx.fillStyle = ember.color + currentAlpha.toFixed(3) + ')';
      emberCtx.shadowColor = '#FF9100';
      emberCtx.shadowBlur = 10;
      emberCtx.fill();

      // Motion
      ember.x += ember.speedX + (currentMouseX * 0.3);
      ember.y += ember.speedY - (velocityBoost * 1.5);

      // Boundary Wrap
      if (ember.y < -10) {
        ember.y = windowHeight + 10;
        ember.x = Math.random() * windowWidth;
      }
      if (ember.x < -10) ember.x = windowWidth + 10;
      if (ember.x > windowWidth + 10) ember.x = -10;
    });
  }

  /* ==========================================================================
     3. SCENE BURN OBSERVER (SCROLL-DRIVEN FILM BURN CUTS)
     Ignites a subtle film burn light leak when transitioning between major scenes
     ========================================================================== */
  function initSceneBurnTransitions() {
    const scenes = document.querySelectorAll('.hero-feature, .cinematic-rail-section, .stream-scene, .horizontal-cinematic-gallery, .stay-feature-scene, .streaming-location-split, .streaming-finale-scene');
    let currentActiveScene = null;
    let lastBurnTime = 0;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          const now = Date.now();
          if (currentActiveScene && currentActiveScene !== entry.target && (now - lastBurnTime > 1200)) {
            triggerFilmBurn(650);
            lastBurnTime = now;
          }
          currentActiveScene = entry.target;
        }
      });
    }, {
      threshold: [0.4]
    });

    scenes.forEach(scene => observer.observe(scene));
  }

  /* ==========================================================================
     4. HERO MOVIE-SHOT ENTRANCE
     Image: scale(1.08) -> scale(1)
     Text: opacity 0 -> 1, translateY(30px) -> 0
     ========================================================================== */
  function initHeroEntrance() {
    root.style.setProperty('--hero-scale', '1.08');
    root.style.setProperty('--hero-opacity', '0');
    root.style.setProperty('--hero-trans-y', '30px');

    setTimeout(() => {
      root.style.setProperty('--hero-scale', '1');
      root.style.setProperty('--hero-opacity', '1');
      root.style.setProperty('--hero-trans-y', '0px');
      // Subtle opening burn flash like an old 35mm projector lamp starting
      triggerFilmBurn(650);
    }, 180);
  }

  /* ==========================================================================
     5. MOUSE PARALLAX TRACKING
     ========================================================================== */
  function initMouseTracking() {
    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / windowWidth) * 2 - 1;
      targetMouseY = (e.clientY / windowHeight) * 2 - 1;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      targetMouseX = 0;
      targetMouseY = 0;
    });
  }

  /* ==========================================================================
     6. SCROLL ENGINE & VELOCITY TRACKING
     ========================================================================== */
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  /* ==========================================================================
     7. HORIZONTAL 3D CINEMATIC GALLERY
     ========================================================================== */
  function updateHorizontalGallery() {
    if (!hGallerySection || !hGalleryTrack || hPanels.length === 0) return;

    const rect = hGallerySection.getBoundingClientRect();
    const trackHeight = hGallerySection.offsetHeight;
    const scrollableDistance = trackHeight - windowHeight;

    if (scrollableDistance <= 0) return;

    const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
    const totalTrackWidth = hGalleryTrack.scrollWidth;
    const maxTranslate = totalTrackWidth - windowWidth + (windowWidth * 0.2);
    const currentTranslateX = progress * maxTranslate;

    hGalleryTrack.style.transform = `translate3d(-${currentTranslateX}px, 0, 0)`;

    if (hGalleryProgressFill) {
      hGalleryProgressFill.style.width = `${progress * 100}%`;
    }

    const viewportCenter = windowWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    hPanels.forEach((panel, idx) => {
      const pRect = panel.getBoundingClientRect();
      const pCenter = pRect.left + pRect.width / 2;
      const distFromCenter = (pCenter - viewportCenter) / (windowWidth * 0.5);
      const clampedDist = Math.max(-1.5, Math.min(1.5, distFromCenter));

      const absDist = Math.abs(pCenter - viewportCenter);
      if (absDist < minDistance) {
        minDistance = absDist;
        closestIndex = idx;
      }

      const scale = Math.max(0.82, 1 - Math.abs(clampedDist) * 0.18);
      const rotateY = -clampedDist * 5;

      panel.style.transform = `scale3d(${scale.toFixed(3)}, ${scale.toFixed(3)}, 1) rotateY(${rotateY.toFixed(2)}deg)`;
      
      if (absDist < pRect.width * 0.4) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    if (hCurIndex) {
      hCurIndex.textContent = (closestIndex + 1).toString().padStart(2, '0');
    }
    currentHIndex = closestIndex;
  }

  function initHorizontalButtons() {
    if (hNavPrev) {
      hNavPrev.addEventListener('click', () => {
        if (!hGallerySection) return;
        triggerFilmBurn(500);
        const targetProgress = Math.max(0, (currentHIndex - 1) / (hPanels.length - 1));
        const rect = hGallerySection.getBoundingClientRect();
        const topOfSection = window.scrollY + rect.top;
        const targetScroll = topOfSection + (targetProgress * (hGallerySection.offsetHeight - windowHeight));
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    }

    if (hNavNext) {
      hNavNext.addEventListener('click', () => {
        if (!hGallerySection) return;
        triggerFilmBurn(500);
        const targetProgress = Math.min(1, (currentHIndex + 1) / (hPanels.length - 1));
        const rect = hGallerySection.getBoundingClientRect();
        const topOfSection = window.scrollY + rect.top;
        const targetScroll = topOfSection + (targetProgress * (hGallerySection.offsetHeight - windowHeight));
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    }
  }

  /* ==========================================================================
     8. ACTIVE NAVIGATION LINK OBSERVER
     ========================================================================== */
  function updateActiveNav() {
    const navLinks = document.querySelectorAll('.nav-primary-links .nav-link');
    const sections = [
      { id: 'hero', el: document.getElementById('hero') },
      { id: 'curated-rail', el: document.getElementById('curated-rail') },
      { id: 'story', el: document.getElementById('story') },
      { id: 'gallery-horizontal', el: document.getElementById('gallery-horizontal') },
      { id: 'stay', el: document.getElementById('stay') },
      { id: 'location', el: document.getElementById('location') }
    ];

    let activeId = 'hero';
    sections.forEach(({ id, el }) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= windowHeight * 0.4 && rect.bottom >= windowHeight * 0.1) {
        activeId = id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     9. CENTRALIZED 60 FPS ANIMATION LOOP
     ========================================================================== */
  function renderFrame(time) {
    // 1. Mouse Lerp
    currentMouseX += (targetMouseX - currentMouseX) * 0.08;
    currentMouseY += (targetMouseY - currentMouseY) * 0.08;
    root.style.setProperty('--mouse-x', currentMouseX.toFixed(4));
    root.style.setProperty('--mouse-y', currentMouseY.toFixed(4));

    // 2. Scroll Lerp & Velocity Calculation
    const prevScroll = currentScrollY;
    currentScrollY += (targetScrollY - currentScrollY) * 0.1;
    scrollVelocity = currentScrollY - prevScroll;
    root.style.setProperty('--scroll', currentScrollY.toFixed(2));

    // 3. Navigation Scrolled State
    if (netflixNav) {
      if (currentScrollY > 60) {
        netflixNav.classList.add('scrolled');
      } else {
        netflixNav.classList.remove('scrolled');
      }
    }

    // 4. Update Horizontal Gallery
    updateHorizontalGallery();

    // 5. Update Nav Active Links
    updateActiveNav();

    // 6. Draw Ambient Floating Embers
    renderEmbers(time);

    requestAnimationFrame(renderFrame);
  }

  /* ==========================================================================
     10. FULLSCREEN LIGHTBOX WITH FILM BURN REVEAL
     ========================================================================== */
  function initLightbox() {
    if (!lightbox || contentCards.length === 0) return;

    function openLightbox(index) {
      triggerFilmBurn(650);
      currentGalleryIndex = (index + galleryData.length) % galleryData.length;
      const data = galleryData[currentGalleryIndex];

      if (lightboxImg) {
        lightboxImg.src = data.src;
        lightboxImg.alt = data.alt;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = data.caption;
      }
      if (lightboxCounter) {
        const displayIndex = (currentGalleryIndex + 1).toString().padStart(2, '0');
        const total = galleryData.length.toString().padStart(2, '0');
        lightboxCounter.textContent = `${displayIndex} / ${total}`;
      }

      if (typeof lightbox.showModal === 'function') {
        lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
      body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      triggerFilmBurn(500);
      if (typeof lightbox.close === 'function') {
        lightbox.close();
      } else {
        lightbox.removeAttribute('open');
      }
      body.style.overflow = '';
    }

    contentCards.forEach((card, idx) => {
      card.addEventListener('click', () => openLightbox(idx));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerFilmBurn(450);
        openLightbox(currentGalleryIndex - 1);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerFilmBurn(450);
        openLightbox(currentGalleryIndex + 1);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!lightbox.hasAttribute('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        triggerFilmBurn(450);
        openLightbox(currentGalleryIndex - 1);
      }
      if (e.key === 'ArrowRight') {
        triggerFilmBurn(450);
        openLightbox(currentGalleryIndex + 1);
      }
    });
  }

  /* ==========================================================================
     11. NAVIGATION & MOBILE DRAWER (WITH BURN TRANSITIONS)
     ========================================================================== */
  function initNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;

        const targetEl = document.querySelector(href);
        if (!targetEl) return;

        e.preventDefault();

        // Trigger cinematic film burn on section jumps
        triggerFilmBurn(700);

        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          mobileDrawer.classList.remove('open');
          body.style.overflow = '';
        }

        const navHeight = netflixNav ? netflixNav.offsetHeight : 0;
        const targetTop = targetEl.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: targetTop - (href === '#hero' ? 0 : navHeight / 2),
          behavior: 'smooth'
        });
      });
    });

    // Mobile Hamburger
    if (mobileHamburger && mobileDrawer) {
      mobileHamburger.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileHamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        body.style.overflow = isOpen ? 'hidden' : '';
      });
    }

    if (drawerClose && mobileDrawer) {
      drawerClose.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        if (mobileHamburger) mobileHamburger.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
      });
    }

    if (drawerBackdrop && mobileDrawer) {
      drawerBackdrop.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        if (mobileHamburger) mobileHamburger.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
      });
    }
  }

  /* ==========================================================================
     INIT BOOTSTRAP
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initEmbers();
    initHeroEntrance();
    initMouseTracking();
    initHorizontalButtons();
    initLightbox();
    initNavigation();
    initSceneBurnTransitions();

    // Start 60 FPS centralized animation loop
    requestAnimationFrame(renderFrame);
  });

  // Global access for testing
  window.triggerFilmBurn = triggerFilmBurn;

})();