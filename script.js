/**
 * MAYA VALLEY RESORT HAMPI
 * Netflix-Inspired Cinematic Streaming Experience Engine
 * 
 * Includes:
 * - Opening hero movie shot transition (scale 1.08 -> 1.0, staggered text fade-in)
 * - Navigation background transition (transparent -> rgba(5,5,5,.94))
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
     HERO MOVIE-SHOT ENTRANCE
     Image: scale(1.08) -> scale(1)
     Text: opacity 0 -> 1, translateY(30px) -> 0
     ========================================================================== */
  function initHeroEntrance() {
    // Initial states
    root.style.setProperty('--hero-scale', '1.08');
    root.style.setProperty('--hero-opacity', '0');
    root.style.setProperty('--hero-trans-y', '30px');

    setTimeout(() => {
      root.style.setProperty('--hero-scale', '1');
      root.style.setProperty('--hero-opacity', '1');
      root.style.setProperty('--hero-trans-y', '0px');
    }, 150);
  }

  /* ==========================================================================
     MOUSE PARALLAX TRACKING
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

    window.addEventListener('resize', () => {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    });
  }

  /* ==========================================================================
     SCROLL ENGINE & LERP CAMERA
     current += (target - current) * 0.1
     ========================================================================== */
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  /* ==========================================================================
     HORIZONTAL 3D CINEMATIC GALLERY
     Center: scale(1), sides: scale(.82) and rotateY(±5deg)
     ========================================================================== */
  function updateHorizontalGallery() {
    if (!hGallerySection || !hGalleryTrack || hPanels.length === 0) return;

    const rect = hGallerySection.getBoundingClientRect();
    const trackHeight = hGallerySection.offsetHeight;
    const scrollableDistance = trackHeight - windowHeight;

    if (scrollableDistance <= 0) return;

    // Progress 0 to 1
    const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));

    // Calculate maximum horizontal travel
    const totalTrackWidth = hGalleryTrack.scrollWidth;
    const maxTranslate = totalTrackWidth - windowWidth + (windowWidth * 0.2);
    const currentTranslateX = progress * maxTranslate;

    hGalleryTrack.style.transform = `translate3d(-${currentTranslateX}px, 0, 0)`;

    if (hGalleryProgressFill) {
      hGalleryProgressFill.style.width = `${progress * 100}%`;
    }

    // 3D Panel Math
    const viewportCenter = windowWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    hPanels.forEach((panel, idx) => {
      const pRect = panel.getBoundingClientRect();
      const pCenter = pRect.left + pRect.width / 2;
      const distFromCenter = (pCenter - viewportCenter) / (windowWidth * 0.5);
      const clampedDist = Math.max(-1.5, Math.min(1.5, distFromCenter));

      // Calculate closest panel for counter
      const absDist = Math.abs(pCenter - viewportCenter);
      if (absDist < minDistance) {
        minDistance = absDist;
        closestIndex = idx;
      }

      // Center: scale(1); side: scale(.82)
      const scale = Math.max(0.82, 1 - Math.abs(clampedDist) * 0.18);
      // Side images: rotateY(±5deg)
      const rotateY = -clampedDist * 5; // degrees

      panel.style.transform = `scale3d(${scale.toFixed(3)}, ${scale.toFixed(3)}, 1) rotateY(${rotateY.toFixed(2)}deg)`;
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
        const targetProgress = Math.min(1, (currentHIndex + 1) / (hPanels.length - 1));
        const rect = hGallerySection.getBoundingClientRect();
        const topOfSection = window.scrollY + rect.top;
        const targetScroll = topOfSection + (targetProgress * (hGallerySection.offsetHeight - windowHeight));
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    }
  }

  /* ==========================================================================
     ACTIVE NAVIGATION LINK OBSERVER
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
     CENTRALIZED 60 FPS ANIMATION LOOP
     ========================================================================== */
  function renderFrame() {
    // 1. Mouse Lerp
    currentMouseX += (targetMouseX - currentMouseX) * 0.08;
    currentMouseY += (targetMouseY - currentMouseY) * 0.08;
    root.style.setProperty('--mouse-x', currentMouseX.toFixed(4));
    root.style.setProperty('--mouse-y', currentMouseY.toFixed(4));

    // 2. Scroll Lerp
    currentScrollY += (targetScrollY - currentScrollY) * 0.1;
    root.style.setProperty('--scroll', currentScrollY.toFixed(2));

    // 3. Navigation Transparent -> rgba(5,5,5,.94)
    if (netflixNav) {
      if (currentScrollY > 60) {
        netflixNav.classList.add('scrolled');
      } else {
        netflixNav.classList.remove('scrolled');
      }
    }

    // 4. Update Horizontal 3D Gallery
    updateHorizontalGallery();

    // 5. Update Nav Active
    updateActiveNav();

    requestAnimationFrame(renderFrame);
  }

  /* ==========================================================================
     FULLSCREEN HIGH-DEFINITION LIGHTBOX
     ========================================================================== */
  function initLightbox() {
    if (!lightbox || contentCards.length === 0) return;

    function openLightbox(index) {
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
        openLightbox(currentGalleryIndex - 1);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(currentGalleryIndex + 1);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!lightbox.hasAttribute('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(currentGalleryIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(currentGalleryIndex + 1);
    });
  }

  /* ==========================================================================
     NAVIGATION & MOBILE DRAWER
     ========================================================================== */
  function initNavigation() {
    // Smooth Anchor Scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;

        const targetEl = document.querySelector(href);
        if (!targetEl) return;

        e.preventDefault();

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
    initHeroEntrance();
    initMouseTracking();
    initHorizontalButtons();
    initLightbox();
    initNavigation();

    // Start 60 FPS animation loop
    requestAnimationFrame(renderFrame);
  });

})();