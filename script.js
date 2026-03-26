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
   SEARCH TABS — switch between Acheter / Louer / Estimer
   ================================================================ */
document.querySelectorAll('.search-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    // Redirect to the right page on tab click
    if (target === 'louer') window.location.href = 'louer.html';
    else if (target === 'estimer') window.location.href = 'estimer.html';
    else if (target === 'acheter') window.location.href = 'acheter.html';
  });
});

/* ================================================================
   SEARCH FILTER — filter property cards on acheter/louer pages
   ================================================================ */
const searchForm = document.querySelector('.search-form');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = searchForm.querySelector('[id^="s-type"]');
    const location = searchForm.querySelector('[id^="s-location"]');
    const cards = document.querySelectorAll('.prop-card, .featured-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const cardText = card.textContent.toLowerCase();
      const typeVal = type ? type.value.toLowerCase() : '';
      const locVal = location ? location.value.toLowerCase() : '';

      let show = true;
      if (typeVal && typeVal !== 'tous les biens' && typeVal !== 'tous') {
        if (!cardText.includes(typeVal)) show = false;
      }
      if (locVal && locVal !== 'toute la côte d\'azur' && locVal !== 'toute') {
        if (!cardText.includes(locVal.split(',')[0].trim().toLowerCase())) show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    // Show "no results" message
    let noResults = document.getElementById('no-results');
    if (visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.id = 'no-results';
        noResults.style.cssText = 'text-align:center;padding:40px 0;color:#9E958F;font-size:16px;grid-column:1/-1;';
        noResults.textContent = 'Aucun bien ne correspond à votre recherche. Essayez d\'élargir vos critères.';
        const grid = document.querySelector('.properties__grid') || document.querySelector('.featured-grid');
        if (grid) grid.parentNode.insertBefore(noResults, grid.nextSibling);
      }
      noResults.style.display = '';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  });
}

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
      dot.addEventListener('click', () => scrollToCard(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let autoplayInterval;

    function scrollToCard(index) {
      currentIndex = Math.max(0, Math.min(index, cards.length - 1));
      cards[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    nav.querySelector('.carousel-btn--prev').addEventListener('click', () => {
      scrollToCard(currentIndex - 1);
      resetAutoplay();
    });
    nav.querySelector('.carousel-btn--next').addEventListener('click', () => {
      scrollToCard(currentIndex + 1);
      resetAutoplay();
    });

    // Auto-advance
    function startAutoplay() {
      autoplayInterval = setInterval(() => {
        scrollToCard(currentIndex >= cards.length - 1 ? 0 : currentIndex + 1);
      }, 5000);
    }
    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }
    startAutoplay();

    // Update dots on manual scroll
    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const trackRect = track.getBoundingClientRect();
        cards.forEach((card, i) => {
          const rect = card.getBoundingClientRect();
          if (rect.left >= trackRect.left - 10 && rect.left <= trackRect.left + 50) {
            currentIndex = i;
            dots.forEach((d, j) => d.classList.toggle('active', j === i));
          }
        });
      }, 100);
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
