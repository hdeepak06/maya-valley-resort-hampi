/**
 * MAYA VALLEY RESORT HAMPI
 * Luxury Cinematic Editorial Experience Engine
 * 
 * Features:
 * - Buttery-smooth 60/120 FPS scroll & hero camera zoom settle
 * - Decoupled IntersectionObserver for scroll reveals & active navigation
 * - Subtle 3D card perspective tilt with mouse damping
 * - Fullscreen magazine-style image lightbox with ESC & arrow navigation
 * - Seamless mobile drawer navigation
 */

(function () {
  'use strict';

  // DOM Elements
  const heroSection = document.getElementById('hero');
  const heroImage = document.getElementById('heroImage');
  const luxuryNav = document.getElementById('luxuryNav');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  
  // Mobile Drawer
  const mobileHamburger = document.getElementById('mobileHamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerItems = Array.from(document.querySelectorAll('.drawer-item'));

  // Lightbox
  const lightbox = document.getElementById('luxuryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));

  let currentGalleryIndex = 0;
  const galleryData = galleryCards.map(card => {
    const img = card.querySelector('.g-img');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      caption: card.getAttribute('data-caption') || (img ? img.getAttribute('alt') : '')
    };
  });

  /* ==========================================================================
     1. HERO CINEMATIC ENTRANCE & PARALLAX
     ========================================================================== */
  function initHero() {
    if (!heroSection) return;

    // Trigger slow cinematic entrance
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroSection.classList.add('loaded');
      }, 100);
    });

    // Subtle parallax on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (heroImage && scrollY < window.innerHeight) {
            heroImage.style.transform = `translate3d(0, ${scrollY * 0.16}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ==========================================================================
     2. NAVIGATION SCROLL & ACTIVE SECTION HIGHLIGHT
     ========================================================================== */
  function initNav() {
    if (!luxuryNav) return;

    // Scroll background transition
    const handleNavScroll = () => {
      if (window.scrollY > 40) {
        luxuryNav.classList.add('scrolled');
      } else {
        luxuryNav.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // Active Section Observer
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (href === id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => sectionObserver.observe(sec));

    // Smooth Anchor Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId) return;

        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          closeDrawer();
        }
      });
    });
  }

  /* ==========================================================================
     3. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initMobileMenu() {
    if (mobileHamburger) {
      mobileHamburger.addEventListener('click', openDrawer);
    }
    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', closeDrawer);
    }
    drawerItems.forEach(item => {
      item.addEventListener('click', closeDrawer);
    });
  }

  /* ==========================================================================
     4. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     ========================================================================== */
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-elem');
    if (!revealElements.length) return;

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* ==========================================================================
     5. SUBTLE 3D CARD PERSPECTIVE TILT
     ========================================================================== */
  function init3DTilt() {
    // Only enable on desktop devices with fine hover pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const tiltCards = document.querySelectorAll('.stay-card, .bento-card, .about-card-panel');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4; // Max -4deg to 4deg
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     6. CLEAN FULLSCREEN LIGHTBOX
     ========================================================================== */
  function updateLightbox(index) {
    if (index < 0) index = galleryData.length - 1;
    if (index >= galleryData.length) index = 0;
    currentGalleryIndex = index;

    const data = galleryData[currentGalleryIndex];
    if (!data) return;

    if (lightboxImg) {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = data.caption;
    }
    if (lightboxCounter) {
      const cur = String(currentGalleryIndex + 1).padStart(2, '0');
      const total = String(galleryData.length).padStart(2, '0');
      lightboxCounter.textContent = `${cur} / ${total}`;
    }
  }

  function openLightbox(index) {
    if (!lightbox) return;
    updateLightbox(index);
    lightbox.showModal ? lightbox.showModal() : lightbox.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }

  function closeLightboxModal() {
    if (!lightbox) return;
    lightbox.close ? lightbox.close() : lightbox.removeAttribute('open');
    document.body.style.overflow = '';
  }

  function initLightbox() {
    galleryCards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-gallery-index'), 10) || 0;
        openLightbox(idx);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightboxModal);
    }
    if (lightboxBackdrop) {
      lightboxBackdrop.addEventListener('click', closeLightboxModal);
    }
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        updateLightbox(currentGalleryIndex - 1);
      });
    }
    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        updateLightbox(currentGalleryIndex + 1);
      });
    }

    // Keyboard controls (ESC, Arrow Left, Arrow Right)
    window.addEventListener('keydown', (e) => {
      const isOpen = lightbox && (lightbox.open || lightbox.hasAttribute('open'));
      if (!isOpen) return;

      if (e.key === 'Escape') {
        closeLightboxModal();
      } else if (e.key === 'ArrowLeft') {
        updateLightbox(currentGalleryIndex - 1);
      } else if (e.key === 'ArrowRight') {
        updateLightbox(currentGalleryIndex + 1);
      }
    });
  }

  /* ==========================================================================
     INITIALIZATION ON DOM READY
     ========================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHero();
      initNav();
      initMobileMenu();
      initScrollReveals();
      init3DTilt();
      initLightbox();
    });
  } else {
    initHero();
    initNav();
    initMobileMenu();
    initScrollReveals();
    init3DTilt();
    initLightbox();
  }

})();