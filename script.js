/* ==========================================================================
   MAYA VALLEY RESORT HAMPI — CORE JAVASCRIPT
   Vanilla JS • Zero Frameworks • High Performance
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. CONSTANTS & RESORT DETAILS
  const WHATSAPP_NUMBER = "9380376356";
  const RESORT_PHONE = "+919380376356";
  const RESORT_ADDRESS = "Tungabhadra Left Canal, Huligi - Gangavathi Rd, Basapur, Hampi, Karnataka 583234";
  const MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Maya Valley Resort Hampi Basapur")}`;
  const DEFAULT_WA_MESSAGE = "Hello Maya Valley Resort Hampi, I would like to enquire about room availability and booking. Please share the available options.";

  // Set default prefilled enquiry message for any bare WhatsApp link
  document.querySelectorAll('a[href*="wa.me/"]').forEach((link) => {
    if (!link.href.includes('text=')) {
      link.href = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_WA_MESSAGE)}`;
    }
  });

  // 2. IMAGE PATH FALLBACK (Guarantees zero broken images in all environments)
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', function handleImgError() {
      const src = this.getAttribute('src');
      if (src && src.startsWith('images/')) {
        this.src = src.replace('images/', '/images/');
      } else if (src && src.startsWith('/images/')) {
        this.src = src.replace('/images/', 'images/');
      }
    });
  });

  // 3. CURRENT YEAR
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 4. NAVBAR SCROLL EFFECT & MOBILE MENU TOGGLE
  const navbar = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close menu when clicking any nav link
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 5. SMOOTH SCROLL FOR ALL ANCHOR LINKS
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function handleSmoothScroll(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = navbar ? navbar.offsetHeight : 70;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 6. ROOM SELECTION SHORTCUTS
  document.querySelectorAll('.select-room-btn').forEach((btn) => {
    btn.addEventListener('click', function handleRoomSelect() {
      const roomName = this.getAttribute('data-room');
      const roomSelect = document.getElementById('room-preference');
      const bookingSection = document.getElementById('booking');

      if (roomSelect && roomName) {
        roomSelect.value = roomName;
        // Trigger change event to update summary
        roomSelect.dispatchEvent(new Event('change'));
      }

      if (bookingSection) {
        const headerOffset = navbar ? navbar.offsetHeight : 70;
        const elementPosition = bookingSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

        const nameInput = document.getElementById('guest-name');
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 400);
        }
      }
    });
  });

  // ==========================================================================
  // 7. BOOKING FORM LOGIC WITH TWO-COLUMN DESKTOP / ONE-COLUMN MOBILE
  //    - From Date min = Today
  //    - To Date min = selected From Date
  //    - Automatic adjustment to prevent To Date < From Date
  //    - Real-time booking summary preview
  //    - WhatsApp dynamic message generation
  // ==========================================================================
  const bookingForm = document.getElementById('stay-booking-form');
  const nameInput = document.getElementById('guest-name');
  const mobileInput = document.getElementById('guest-mobile');
  const fromDateInput = document.getElementById('from-date');
  const toDateInput = document.getElementById('to-date');
  const guestsSelect = document.getElementById('num-guests');
  const roomSelect = document.getElementById('room-preference');
  const requestInput = document.getElementById('special-request');

  const summaryBox = document.getElementById('booking-summary-box');
  const summaryGuest = document.getElementById('summary-guest-val');
  const summaryMobile = document.getElementById('summary-mobile-val');
  const summaryDates = document.getElementById('summary-dates-val');
  const summaryRoom = document.getElementById('summary-room-val');
  const summaryGuests = document.getElementById('summary-guests-val');
  const summaryNights = document.getElementById('summary-nights-badge');
  const summaryReqItem = document.getElementById('summary-request-item');
  const summaryReqVal = document.getElementById('summary-request-val');

  // Format Date to YYYY-MM-DD
  const formatDateToIso = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format Date to Friendly String (e.g. "12 Oct 2026")
  const formatFriendlyDate = (isoStr) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Set minimum dates
  const today = new Date();
  const todayIso = formatDateToIso(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = formatDateToIso(tomorrow);

  if (fromDateInput) {
    fromDateInput.min = todayIso;
    fromDateInput.value = todayIso;
  }

  if (toDateInput) {
    toDateInput.min = tomorrowIso;
    toDateInput.value = tomorrowIso;
  }

  const stayNightsBadge = document.getElementById('stay-nights-badge');
  const durationBtns = document.querySelectorAll('.duration-btn');

  // Helper to set stay duration in nights
  function setStayDuration(days) {
    if (!fromDateInput || !toDateInput) return;
    const currentFrom = fromDateInput.value || todayIso;
    const parts = currentFrom.split('-');
    const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    targetDate.setDate(targetDate.getDate() + days);
    toDateInput.value = formatDateToIso(targetDate);

    durationBtns.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-days'), 10) === days);
    });

    updateSummaryPreview();
  }

  durationBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.getAttribute('data-days'), 10);
      setStayDuration(days);
    });
  });

  // Handle From Date Change
  if (fromDateInput && toDateInput) {
    fromDateInput.addEventListener('change', () => {
      const selectedFrom = fromDateInput.value;
      if (!selectedFrom) return;

      // Calculate next day
      const parts = selectedFrom.split('-');
      const nextDay = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayIso = formatDateToIso(nextDay);

      toDateInput.min = nextDayIso;

      // If current toDate is earlier or equal to fromDate, advance it
      if (!toDateInput.value || toDateInput.value <= selectedFrom) {
        toDateInput.value = nextDayIso;
      }

      updateSummaryPreview();
    });

    toDateInput.addEventListener('change', () => {
      if (fromDateInput.value && toDateInput.value && toDateInput.value <= fromDateInput.value) {
        alert('To Date must be after From Date.');
        const parts = fromDateInput.value.split('-');
        const nextDay = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        nextDay.setDate(nextDay.getDate() + 1);
        toDateInput.value = formatDateToIso(nextDay);
      }
      updateSummaryPreview();
    });
  }

  // Hero Quick Booking Dates Bar synchronization
  const heroFromDate = document.getElementById('hero-from-date');
  const heroToDate = document.getElementById('hero-to-date');
  const heroGuests = document.getElementById('hero-guests-select');
  const heroBookBtn = document.getElementById('hero-quick-book-btn');

  if (heroFromDate && heroToDate) {
    heroFromDate.min = todayIso;
    heroFromDate.value = todayIso;
    heroToDate.min = tomorrowIso;
    heroToDate.value = tomorrowIso;

    heroFromDate.addEventListener('change', () => {
      if (fromDateInput) {
        fromDateInput.value = heroFromDate.value;
        fromDateInput.dispatchEvent(new Event('change'));
      }
      const parts = heroFromDate.value.split('-');
      const nextDay = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      nextDay.setDate(nextDay.getDate() + 1);
      heroToDate.min = formatDateToIso(nextDay);
      if (!heroToDate.value || heroToDate.value <= heroFromDate.value) {
        heroToDate.value = formatDateToIso(nextDay);
      }
    });

    heroToDate.addEventListener('change', () => {
      if (toDateInput) {
        toDateInput.value = heroToDate.value;
        toDateInput.dispatchEvent(new Event('change'));
      }
    });
  }

  if (heroBookBtn) {
    heroBookBtn.addEventListener('click', () => {
      if (fromDateInput && heroFromDate) fromDateInput.value = heroFromDate.value;
      if (toDateInput && heroToDate) toDateInput.value = heroToDate.value;
      if (guestsSelect && heroGuests) guestsSelect.value = heroGuests.value;
      updateSummaryPreview();

      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        const headerOffset = navbar ? navbar.offsetHeight : 70;
        const elementPosition = bookingSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        setTimeout(() => {
          if (nameInput) nameInput.focus();
        }, 500);
      }
    });
  }

  // Live Summary Updater
  function updateSummaryPreview() {
    if (!summaryBox) return;

    const name = nameInput ? nameInput.value.trim() : '';
    const mobile = mobileInput ? mobileInput.value.trim() : '';
    const fromDate = fromDateInput ? fromDateInput.value : '';
    const toDate = toDateInput ? toDateInput.value : '';
    const guests = guestsSelect ? guestsSelect.value : '';
    const room = roomSelect ? roomSelect.value : '';
    const req = requestInput ? requestInput.value.trim() : '';

    const hasAnyData = name || mobile || guests || room || fromDate;

    if (!hasAnyData) {
      summaryBox.style.display = 'none';
      return;
    }

    summaryBox.style.display = 'block';

    if (summaryGuest) summaryGuest.textContent = name || '—';
    if (summaryMobile) summaryMobile.textContent = mobile || '—';
    if (summaryRoom) summaryRoom.textContent = room || 'Any Available Room';
    if (summaryGuests) summaryGuests.textContent = guests || '—';

    // Calculate nights
    if (fromDate && toDate) {
      const d1 = new Date(fromDate);
      const d2 = new Date(toDate);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      const nightsText = `${diffDays} Night${diffDays > 1 ? 's' : ''}`;
      if (summaryNights) summaryNights.textContent = nightsText;
      if (stayNightsBadge) stayNightsBadge.textContent = `${nightsText} Stay`;
      if (summaryDates) summaryDates.textContent = `${formatFriendlyDate(fromDate)} → ${formatFriendlyDate(toDate)}`;

      // Update duration active button
      durationBtns.forEach((btn) => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-days'), 10) === diffDays);
      });
    } else if (fromDate) {
      if (summaryDates) summaryDates.textContent = `Check-in: ${formatFriendlyDate(fromDate)}`;
      if (stayNightsBadge) stayNightsBadge.textContent = `From ${formatFriendlyDate(fromDate)}`;
    }

    if (summaryReqItem && summaryReqVal) {
      if (req) {
        summaryReqItem.style.display = 'block';
        summaryReqVal.textContent = req;
      } else {
        summaryReqItem.style.display = 'none';
      }
    }
  }

  // Attach live update listeners
  [nameInput, mobileInput, guestsSelect, roomSelect, requestInput].forEach((el) => {
    if (el) {
      el.addEventListener('input', updateSummaryPreview);
      el.addEventListener('change', updateSummaryPreview);
    }
  });

  // Initial update
  updateSummaryPreview();

  // Clear validation errors on typing
  const setupErrorClearing = (inputEl, errorId) => {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => {
      inputEl.classList.remove('has-error');
      const errEl = document.getElementById(errorId);
      if (errEl) errEl.classList.remove('visible');
    });
  };

  setupErrorClearing(nameInput, 'name-error');
  setupErrorClearing(mobileInput, 'mobile-error');
  setupErrorClearing(fromDateInput, 'from-date-error');
  setupErrorClearing(toDateInput, 'to-date-error');
  setupErrorClearing(guestsSelect, 'guests-error');
  setupErrorClearing(roomSelect, 'room-error');

  // Form Submission & WhatsApp Link Generation
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      let firstInvalidEl = null;

      const markInvalid = (el, errorId) => {
        isValid = false;
        if (el) el.classList.add('has-error');
        const err = document.getElementById(errorId);
        if (err) err.classList.add('visible');
        if (!firstInvalidEl && el) firstInvalidEl = el;
      };

      // 1. Validate Name
      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        markInvalid(nameInput, 'name-error');
      }

      // 2. Validate Mobile
      const mobileVal = mobileInput ? mobileInput.value.trim() : '';
      const phoneDigits = mobileVal.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        markInvalid(mobileInput, 'mobile-error');
      }

      // 3. Validate From Date
      const fromVal = fromDateInput ? fromDateInput.value : '';
      if (!fromVal) {
        markInvalid(fromDateInput, 'from-date-error');
      }

      // 4. Validate To Date
      const toVal = toDateInput ? toDateInput.value : '';
      if (!toVal || (fromVal && toVal <= fromVal)) {
        markInvalid(toDateInput, 'to-date-error');
      }

      // 5. Validate Number of Guests
      const guestsVal = guestsSelect ? guestsSelect.value : '';
      if (!guestsVal) {
        markInvalid(guestsSelect, 'guests-error');
      }

      // 6. Validate Room Preference
      const roomVal = roomSelect ? roomSelect.value : '';
      if (!roomVal) {
        markInvalid(roomSelect, 'room-error');
      }

      if (!isValid) {
        if (firstInvalidEl) {
          firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalidEl.focus();
        }
        return;
      }

      const specialReqVal = requestInput && requestInput.value.trim() ? requestInput.value.trim() : 'None';

      // Friendly Dates for message
      const fromFormatted = formatFriendlyDate(fromVal);
      const toFormatted = formatFriendlyDate(toVal);

      // Construct EXACT requested WhatsApp message format:
      const message = `Hi Maya Valley Resort Hampi,

I would like to enquire about a stay.

BOOKING DETAILS

Name: ${nameVal}
Mobile: ${phoneDigits}
From Date: ${fromFormatted}
To Date: ${toFormatted}
Guests: ${guestsVal}
Room Preference: ${roomVal}
Special Request: ${specialReqVal}

Please confirm availability, room options and tariff.

Thank you.`;

      const whatsappUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // 8. INTERACTIVE LEAFLET + OPENSTREETMAP (Zero API Keys Required)
  //    - Main Marker: Maya Valley Resort (Distinguished golden/terracotta pin)
  //    - 15 Hampi Heritage & Attraction Markers
  //    - Custom Popups with Photos, Distance & Directions
  //    - Category Filter support
  //    - "View on Map" triggers from Place Cards
  // ==========================================================================
  const mapElement = document.getElementById('hampi-leaflet-map');
  if (mapElement && typeof L !== 'undefined') {
    // Maya Valley Resort Coordinates: Tungabhadra Left Canal, Basapur, Hampi
    const RESORT_COORDS = [15.3425, 76.4020];

    // Initialize Leaflet Map centered between resort and central Hampi
    const map = L.map('hampi-leaflet-map', {
      center: [15.3380, 76.4420],
      zoom: 12,
      scrollWheelZoom: false, // Prevents accidental scroll interception
      zoomControl: true
    });

    // High quality OpenStreetMap tiles (free, unlimited, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Photo Pin Creators with small picture and place name on it
    const createResortPhotoPin = (loc) => {
      return L.divIcon({
        className: 'photo-marker-wrapper is-resort-marker',
        html: `
          <div class="map-photo-badge resort-badge" title="${loc.name}">
            <div class="badge-thumb resort-thumb">
              <img src="${loc.image}" alt="${loc.name}" />
              <span class="badge-star">★</span>
            </div>
            <div class="badge-content">
              <span class="badge-tag">YOUR RESORT</span>
              <strong class="badge-title resort-title">${loc.name}</strong>
            </div>
            <div class="badge-arrow resort-arrow"></div>
          </div>
        `,
        iconSize: [180, 52],
        iconAnchor: [90, 56],
        popupAnchor: [0, -58]
      });
    };

    const createPlacePhotoPin = (loc) => {
      return L.divIcon({
        className: 'photo-marker-wrapper',
        html: `
          <div class="map-photo-badge" title="${loc.name}">
            <div class="badge-thumb">
              <img src="${loc.image}" alt="${loc.name}" />
            </div>
            <div class="badge-content">
              <span class="badge-title">${loc.name}</span>
            </div>
            <div class="badge-arrow"></div>
          </div>
        `,
        iconSize: [150, 44],
        iconAnchor: [75, 48],
        popupAnchor: [0, -50]
      });
    };

    // Locations Dataset
    const locations = [
      {
        id: 'resort',
        name: 'MAYA VALLEY RESORT',
        category: 'resort',
        coords: RESORT_COORDS,
        image: 'images/resort-garden.webp',
        tag: 'LUXURY RETREAT',
        desc: 'Tungabhadra Left Canal, Basapur, Hampi. A peaceful haven between water, stone, and ancient heritage.',
        dist: 'Starting Point',
        isResort: true,
        symbol: '★'
      },
      {
        id: 'virupaksha',
        name: 'Virupaksha Temple',
        category: 'temple',
        coords: [15.3350, 76.4600],
        image: 'images/virupaksha-temple-hero.jpg',
        tag: 'SACRED TEMPLE',
        desc: '7th-century functioning temple dedicated to Lord Shiva, with a 50m grand gopuram.',
        dist: '~8 km from Maya Valley Resort (16 mins)',
        symbol: '🛕'
      },
      {
        id: 'hampi-bazaar',
        name: 'Hampi Bazaar',
        category: 'royal',
        coords: [15.3353, 76.4630],
        image: 'images/hampi-bazaar.jpg',
        tag: 'ANCIENT MARKETPLACE',
        desc: 'Colonnaded ancient street that once sold gems, silk, and spices during the empire.',
        dist: '~8 km from Maya Valley Resort (16 mins)',
        symbol: '🏛️'
      },
      {
        id: 'vittala',
        name: 'Vijaya Vittala Temple',
        category: 'temple',
        coords: [15.3637, 76.4789],
        image: 'images/stone-chariot.jpg',
        tag: 'HERITAGE JEWEL',
        desc: 'Spectacular 15th-century temple complex renowned for iconic musical pillars.',
        dist: '~10 km from Maya Valley Resort (20 mins)',
        symbol: '🛕'
      },
      {
        id: 'stone-chariot',
        name: 'Stone Chariot',
        category: 'royal',
        coords: [15.3635, 76.4793],
        image: 'images/stone-chariot.jpg',
        tag: 'ICONIC SHRINE',
        desc: 'The world-famous monolithic granite chariot dedicated to Garuda inside Vittala.',
        dist: '~10 km from Maya Valley Resort (20 mins)',
        symbol: '☸'
      },
      {
        id: 'matanga-hill',
        name: 'Matanga Hill',
        category: 'hill',
        coords: [15.3320, 76.4680],
        image: 'images/matanga-hill.jpg',
        tag: 'PANORAMIC SUNRISE',
        desc: 'Highest point in central Hampi offering unmatched sunrise 360° vistas.',
        dist: '~8.5 km from Maya Valley Resort (18 mins)',
        symbol: '🌄'
      },
      {
        id: 'hemakuta-hill',
        name: 'Hemakuta Hill',
        category: 'hill',
        coords: [15.3325, 76.4590],
        image: 'images/hemakuta-hill.jpg',
        tag: 'SUNSET HILL',
        desc: 'Cluster of ancient pre-Vijayanagara shrines offering golden hour sunsets.',
        dist: '~8 km from Maya Valley Resort (15 mins)',
        symbol: '🌅'
      },
      {
        id: 'lotus-mahal',
        name: 'Lotus Mahal',
        category: 'royal',
        coords: [15.3208, 76.4689],
        image: 'images/gallery-1.webp',
        tag: 'ROYAL PALACE',
        desc: 'Indo-Islamic architectural gem inside the royal Zenana Enclosure.',
        dist: '~7.5 km from Maya Valley Resort (15 mins)',
        symbol: '👑'
      },
      {
        id: 'elephant-stables',
        name: 'Elephant Stables',
        category: 'royal',
        coords: [15.3203, 76.4725],
        image: 'images/gallery-2.webp',
        tag: 'ROYAL MONUMENT',
        desc: 'Grand eleven domed chambers built for royal ceremonial elephants.',
        dist: '~7.6 km from Maya Valley Resort (16 mins)',
        symbol: '🐘'
      },
      {
        id: 'achyutaraya',
        name: 'Achyutaraya Temple',
        category: 'temple',
        coords: [15.3370, 76.4720],
        image: 'images/achyutaraya-temple.jpg',
        tag: 'SECLUDED TEMPLE',
        desc: 'Hidden in a quiet boulder valley behind Matanga Hill, with pristine carvings.',
        dist: '~9 km from Maya Valley Resort (18 mins)',
        symbol: '🛕'
      },
      {
        id: 'queens-bath',
        name: 'Queen’s Bath',
        category: 'royal',
        coords: [15.3138, 76.4705],
        image: 'images/gallery-3.webp',
        tag: 'ROYAL ENCLOSURE',
        desc: 'Square aquatic pavilion surrounded by arched balconies and water inlets.',
        dist: '~7 km from Maya Valley Resort (14 mins)',
        symbol: '🛁'
      },
      {
        id: 'sasivekalu-ganesha',
        name: 'Sasivekalu Ganesha',
        category: 'temple',
        coords: [15.3315, 76.4598],
        image: 'images/stone.webp',
        tag: 'MONOLITHIC STATUE',
        desc: '2.4m single boulder carving of Lord Ganesha on Hemakuta slopes.',
        dist: '~7.8 km from Maya Valley Resort (15 mins)',
        symbol: '🕉'
      },
      {
        id: 'ugra-narasimha',
        name: 'Ugra Narasimha',
        category: 'temple',
        coords: [15.3283, 76.4589],
        image: 'images/stone.webp',
        tag: 'COLOSSAL STATUE',
        desc: 'Largest monolith in Hampi (6.7m tall) depicting Lord Narasimha seated.',
        dist: '~7.6 km from Maya Valley Resort (15 mins)',
        symbol: '🦁'
      },
      {
        id: 'shiva-temple',
        name: 'Underground Shiva Temple',
        category: 'temple',
        coords: [15.3262, 76.4624],
        image: 'images/stone.webp',
        tag: 'SUBMERGED TEMPLE',
        desc: 'Ancient temple built below ground level, surrounded by natural canal waters.',
        dist: '~7.4 km from Maya Valley Resort (14 mins)',
        symbol: '🛕'
      },
      {
        id: 'anjanadri-hill',
        name: 'Anjanadri Hill',
        category: 'hill',
        coords: [15.3547, 76.4715],
        image: 'images/hampi-landscape.webp',
        tag: 'SACRED BIRTHPLACE',
        desc: 'Mythological birthplace of Lord Hanuman, accessed via 575 scenic steps.',
        dist: '~11 km from Maya Valley Resort (22 mins)',
        symbol: '⛰'
      },
      {
        id: 'tungabhadra-river',
        name: 'Tungabhadra River & Coracles',
        category: 'hill',
        coords: [15.3385, 76.4620],
        image: 'images/tungabhadra-river.jpg',
        tag: 'SACRED RIVER',
        desc: 'Ancient river cutting through granite hills with traditional circular coracle rides.',
        dist: '~8 km from Maya Valley Resort (16 mins)',
        symbol: '🛶'
      }
    ];

    // Marker Store
    const markerMap = {};
    const markerLayerGroup = L.layerGroup().addTo(map);

    // Build Popups & Markers
    locations.forEach((loc) => {
      const isResort = loc.isResort === true;
      const icon = isResort ? createResortPhotoPin(loc) : createPlacePhotoPin(loc);
      const marker = L.marker(loc.coords, { icon: icon });

      let popupContent = '';
      if (isResort) {
        popupContent = `
          <div class="map-popup-card">
            <img src="${loc.image}" class="map-popup-img" alt="${loc.name}" />
            <div class="map-popup-body">
              <span class="map-popup-tag">${loc.tag}</span>
              <h4 class="map-popup-title">${loc.name}</h4>
              <p class="map-popup-desc">Tungabhadra Left Canal, Basapur, Hampi.<br />${loc.desc}</p>
              <div class="map-popup-actions">
                <a href="${MAPS_SEARCH_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary map-popup-btn">
                  GET DIRECTIONS
                </a>
                <a href="#booking" class="btn btn-dark map-popup-btn map-book-jump-btn">
                  BOOK STAY
                </a>
                <a href="https://wa.me/91${WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp map-popup-btn">
                  WHATSAPP
                </a>
              </div>
            </div>
          </div>
        `;
      } else {
        const placeSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name + " Hampi")}`;
        popupContent = `
          <div class="map-popup-card">
            <img src="${loc.image}" class="map-popup-img" alt="${loc.name}" />
            <div class="map-popup-body">
              <span class="map-popup-tag">${loc.tag}</span>
              <h4 class="map-popup-title">${loc.name}</h4>
              <p class="map-popup-desc">${loc.desc}</p>
              <div class="map-popup-dist">📍 ${loc.dist}</div>
              <div class="map-popup-actions">
                <a href="${placeSearchUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline map-popup-btn">
                  DIRECTIONS ↗
                </a>
                <a href="#booking" class="btn btn-primary map-popup-btn map-book-jump-btn">
                  BOOK STAY
                </a>
              </div>
            </div>
          </div>
        `;
      }

      marker.bindPopup(popupContent, { maxWidth: 300, minWidth: 260 });
      marker.category = loc.category;
      markerLayerGroup.addLayer(marker);
      markerMap[loc.id] = marker;

      // Open resort popup by default
      if (isResort) {
        setTimeout(() => {
          marker.openPopup();
        }, 800);
      }
    });

    // MAP FILTER BUTTONS
    document.querySelectorAll('.map-filter-btn').forEach((btn) => {
      btn.addEventListener('click', function handleFilter() {
        document.querySelectorAll('.map-filter-btn').forEach((b) => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');
        const bounds = [];

        locations.forEach((loc) => {
          const marker = markerMap[loc.id];
          if (!marker) return;

          if (filter === 'all') {
            markerLayerGroup.addLayer(marker);
            bounds.push(loc.coords);
          } else if (filter === 'resort') {
            if (loc.isResort) {
              markerLayerGroup.addLayer(marker);
              bounds.push(loc.coords);
            } else {
              markerLayerGroup.removeLayer(marker);
            }
          } else if (loc.category === filter || loc.isResort) {
            markerLayerGroup.addLayer(marker);
            bounds.push(loc.coords);
          } else {
            markerLayerGroup.removeLayer(marker);
          }
        });

        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: filter === 'resort' ? 14 : 13 });
        }
      });
    });

    // "VIEW ON MAP" BUTTON HANDLERS FROM PLACES CARDS
    document.querySelectorAll('.place-map-btn').forEach((btn) => {
      btn.addEventListener('click', function handlePlaceMapClick() {
        const locationId = this.getAttribute('data-location-id');
        const targetMarker = markerMap[locationId];

        if (targetMarker) {
          const mapSection = document.getElementById('map-section');
          if (mapSection) {
            const headerOffset = navbar ? navbar.offsetHeight : 70;
            const elementPosition = mapSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }

          // Smoothly fly to marker and open popup
          setTimeout(() => {
            map.flyTo(targetMarker.getLatLng(), 15, {
              animate: true,
              duration: 1.2
            });
            setTimeout(() => {
              targetMarker.openPopup();
            }, 600);
          }, 350);
        }
      });
    });
  }
});
