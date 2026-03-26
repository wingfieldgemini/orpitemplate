/* ================================================================
   NAVIGATION
   ================================================================ */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobile-nav');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// Sticky header shadow
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

/* ================================================================
   SEARCH BAR — tabs, state, filtering, URL construction
   ================================================================ */
(function() {
  const tabs = document.querySelectorAll('.search-tab');
  const form = document.querySelector('.search-form');
  if (!tabs.length || !form) return;

  // Determine current page context
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const tabTargets = {
    acheter: 'acheter.html',
    louer: 'louer.html'
  };

  // Track active mode
  let activeMode = 'acheter';
  tabs.forEach(tab => { if (tab.classList.contains('active')) activeMode = tab.dataset.tab; });

  // Dynamic fields config: which data-field to show per tab
  const fieldConfig = {
    acheter: ['budget'],
    louer:   ['loyer']
  };
  const allDynamicFields = ['budget', 'loyer'];

  function showFieldsForMode(mode) {
    const visible = fieldConfig[mode] || ['budget'];
    allDynamicFields.forEach(fieldName => {
      const el = form.querySelector(`[data-field="${fieldName}"]`);
      if (!el) return;
      const show = visible.includes(fieldName);
      el.style.display = show ? '' : 'none';
      // Disable hidden selects so they don't submit
      const select = el.querySelector('select');
      if (select) select.disabled = !show;
    });
  }

  function resetSelects() {
    form.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
  }

  // Set initial field visibility
  showFieldsForMode(activeMode);

  // --- 1. Tab switching ---
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      // Update visual state
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeMode = target;

      // Update form action to match selected tab
      form.action = tabTargets[target] || 'acheter.html';

      // Toggle fields and reset values
      showFieldsForMode(target);
      resetSelects();

      console.log('[Search] Tab switched to:', activeMode);
    });
  });

  // --- 2. Read URL params on page load and pre-fill selects ---
  const params = new URLSearchParams(window.location.search);
  if (params.toString()) {
    // Set mode from URL
    const urlMode = params.get('mode');
    if (urlMode) {
      activeMode = urlMode;
      tabs.forEach(t => {
        const isActive = t.dataset.tab === urlMode;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive.toString());
      });
    }

    // Pre-fill selects from URL params
    form.querySelectorAll('select[name]').forEach(select => {
      const val = params.get(select.name);
      if (val) {
        const option = select.querySelector(`option[value="${val}"]`);
        if (option) select.value = val;
      }
    });

    // Auto-filter cards on the listing pages
    filterCards();
  }

  // --- 3. Log state changes on any dropdown change ---
  form.querySelectorAll('select[name]').forEach(select => {
    select.addEventListener('change', () => {
      console.log(`[Search] ${select.name} changed to:`, select.value || '(all)');
    });
  });

  // --- 4. Search submission ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Gather all values
    const searchState = { mode: activeMode };
    form.querySelectorAll('select[name]').forEach(select => {
      if (select.value) searchState[select.name] = select.value;
    });

    // Build query string
    const queryParams = new URLSearchParams(searchState);
    const targetPage = tabTargets[activeMode] || 'acheter.html';
    const searchUrl = targetPage + '?' + queryParams.toString();

    console.log('[Search] Query:', searchState);
    console.log('[Search] URL:', searchUrl);

    // If we're already on the target page, filter in-place
    const onTargetPage = page === targetPage
      || (activeMode === 'acheter' && page === 'index.html');

    if (onTargetPage) {
      // Update URL without reload
      history.replaceState(null, '', '?' + queryParams.toString());
      filterCards();
    } else {
      // Navigate to the target page with params
      window.location.href = searchUrl;
    }
  });

  // --- Filter cards in-place on listing pages ---
  function filterCards() {
    const cards = document.querySelectorAll('.prop-card, .featured-card');
    if (!cards.length) return;

    const typeVal = (form.querySelector('[name="type"]')?.value || '').toLowerCase();
    const locVal = (form.querySelector('[name="localisation"]')?.value || '').toLowerCase().replace(/-/g, ' ');
    const roomsVal = form.querySelector('[name="pieces"]')?.value || '';
    const budgetVal = parseInt(form.querySelector('[name="budget"]')?.value) || 0;

    let visibleCount = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      let show = true;

      // Type filter
      if (typeVal) {
        if (!text.includes(typeVal)) show = false;
      }

      // Location filter
      if (locVal) {
        if (!text.includes(locVal.split(' ')[0])) show = false;
      }

      // Rooms filter — look for "X pièces" in card text
      if (roomsVal) {
        const roomsNum = parseInt(roomsVal);
        const roomMatch = text.match(/(\d+)\s*pièce/);
        if (roomMatch) {
          const cardRooms = parseInt(roomMatch[1]);
          if (roomsVal === '5') {
            if (cardRooms < 5) show = false;
          } else {
            if (cardRooms !== roomsNum) show = false;
          }
        }
      }

      // Budget filter — extract price from card
      if (budgetVal) {
        const priceMatch = text.match(/([\d\s]+)\s*€/);
        if (priceMatch) {
          const cardPrice = parseInt(priceMatch[1].replace(/\s/g, ''));
          if (cardPrice > budgetVal) show = false;
        }
      }

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    // No results message
    let noResults = document.getElementById('no-results');
    if (visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.id = 'no-results';
        noResults.style.cssText = 'text-align:center;padding:48px 0;color:#9E958F;font-size:16px;grid-column:1/-1;';
        noResults.textContent = 'Aucun bien ne correspond à votre recherche. Essayez d\u2019élargir vos critères.';
        const grid = document.querySelector('.properties__grid') || document.querySelector('.featured-grid');
        if (grid) grid.parentNode.insertBefore(noResults, grid.nextSibling);
      }
      noResults.style.display = '';
    } else if (noResults) {
      noResults.style.display = 'none';
    }

    console.log(`[Search] Filtered: ${visibleCount}/${cards.length} visible`);
  }
})();

/* ================================================================
   FORM HANDLING — contact & estimation forms
   ================================================================ */
document.querySelectorAll('form[data-form]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.classList.remove('form-error');
      if (!field.value.trim()) {
        field.classList.add('form-error');
        valid = false;
      }
    });

    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.classList.add('form-error');
      valid = false;
    }

    if (!valid) return;

    // Show confirmation
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg> Message envoyé !';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Show success message
    let msg = form.querySelector('.form-success');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-success';
      msg.innerHTML = '<strong>Merci !</strong> Votre message a bien été envoyé. Notre équipe vous recontactera sous 24 heures.';
      form.appendChild(msg);
    }
    msg.style.display = '';

    // Reset after 4s
    setTimeout(() => {
      form.reset();
      btn.innerHTML = originalText;
      btn.disabled = false;
      btn.style.opacity = '';
      setTimeout(() => { msg.style.display = 'none'; }, 3000);
    }, 4000);
  });
});

// Remove error styling on input
document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('form-error'));
});

/* ================================================================
   TESTIMONIALS CAROUSEL
   ================================================================ */
const track = document.querySelector('.testimonials-track');
if (track) {
  const cards = track.querySelectorAll('.testimonial-card');
  if (cards.length > 0) {
    // Create nav controls
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    nav.innerHTML = `
      <button class="carousel-btn carousel-btn--prev" aria-label="Avis précédent">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="carousel-dots"></div>
      <button class="carousel-btn carousel-btn--next" aria-label="Avis suivant">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    `;
    track.parentNode.insertBefore(nav, track.nextSibling);

    const dotsContainer = nav.querySelector('.carousel-dots');
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Avis ${i + 1}`);
      dot.addEventListener('click', () => { goToCard(i); resetAutoplay(); });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let autoplayTimer = null;
    let isVisible = false;

    // Scroll the track horizontally using scrollLeft — never touches page scroll
    function goToCard(index) {
      currentIndex = Math.max(0, Math.min(index, cards.length - 1));
      const gap = 16; // matches CSS gap
      const cardWidth = cards[0].offsetWidth + gap;
      const targetScroll = currentIndex * cardWidth;

      // Manually animate scrollLeft to avoid any browser smooth-scroll side effects
      const start = track.scrollLeft;
      const distance = targetScroll - start;
      const duration = 350;
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const ease = 1 - (1 - progress) * (1 - progress);
        track.scrollLeft = start + distance * ease;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);

      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    nav.querySelector('.carousel-btn--prev').addEventListener('click', () => {
      goToCard(currentIndex - 1);
      resetAutoplay();
    });
    nav.querySelector('.carousel-btn--next').addEventListener('click', () => {
      goToCard(currentIndex + 1);
      resetAutoplay();
    });

    // Autoplay — only when visible
    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        if (isVisible) {
          goToCard(currentIndex >= cards.length - 1 ? 0 : currentIndex + 1);
        }
      }, 5000);
    }
    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }
    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !autoplayTimer) startAutoplay();
        if (!isVisible) stopAutoplay();
      }, { threshold: 0.2 }).observe(track);
    } else {
      isVisible = true;
      startAutoplay();
    }

    // Sync dots on manual swipe/scroll
    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const gap = 16;
        const cardWidth = cards[0].offsetWidth + gap;
        const newIndex = Math.round(track.scrollLeft / cardWidth);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < cards.length) {
          currentIndex = newIndex;
          dots.forEach((d, j) => d.classList.toggle('active', j === currentIndex));
        }
      }, 80);
    }, { passive: true });
  }
}

/* ================================================================
   SCROLL ANIMATIONS — fade-in-up on scroll
   ================================================================ */
const animateElements = document.querySelectorAll('.section__header, .prop-card, .featured-card, .service-card, .stat-item, .testimonial-card, .contact-info-item, .agency-card, .cta-banner, .content-grid, .contact-form-card');
if ('IntersectionObserver' in window && animateElements.length > 0) {
  animateElements.forEach(el => el.classList.add('animate-on-scroll'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  animateElements.forEach(el => observer.observe(el));
}

/* ================================================================
   COOKIE CONSENT BANNER
   ================================================================ */
if (!localStorage.getItem('cookie-consent')) {
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner__inner">
      <p>Ce site utilise des cookies pour améliorer votre expérience. En continuant, vous acceptez notre <a href="confidentialite.html">politique de confidentialité</a> et notre <a href="cookies.html">politique de cookies</a>.</p>
      <div class="cookie-banner__btns">
        <button class="btn btn--primary btn--sm" id="cookie-accept">Accepter</button>
        <button class="btn btn--outline btn--sm" id="cookie-decline">Refuser</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('visible'));

  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  });
  document.getElementById('cookie-decline').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'declined');
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  });
}

/* ================================================================
   FAVORITE BUTTON TOGGLE
   ================================================================ */
document.querySelectorAll('.prop-card__fav').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    btn.classList.toggle('active');
    const svg = btn.querySelector('svg');
    if (btn.classList.contains('active')) {
      svg.setAttribute('fill', '#E30513');
      svg.setAttribute('stroke', '#E30513');
    } else {
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
    }
  });
});
