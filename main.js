/**
 * Dra. Júnia Nascimento — Landing Page
 * Skill: ui-ux-pro-max
 * Rules applied:
 *  - Animation: 150-300ms, ease-out, interruptible (§7)
 *  - prefers-reduced-motion support (§1)
 *  - Touch targets ≥44px (§2)
 *  - Inline validation on blur, not keystroke (§8)
 *  - Focus management after submit error (§8)
 *  - aria-live for errors and success (§8)
 *  - Smooth scroll + header scroll state (§5)
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── HEADER: scroll state ────────────────────────────────── */
  const header = document.getElementById('header');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── MOBILE NAV ──────────────────────────────────────────── */
  const menuBtn = document.querySelector('.header__menu-btn');
  const nav     = document.getElementById('nav-menu');

  function openNav() {
    nav.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Fechar menu de navegação');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  // Close on nav link click (mobile)
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNav();
      menuBtn.focus();
    }
  });

  /* ── SMOOTH SCROLL for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'instant' : 'smooth',
      });

      // Move focus to section for screen readers
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ── REVEAL ANIMATIONS (IntersectionObserver) ────────────── */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealEls = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  } else {
    // No animation: show all elements immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  /* ── COUNTER ANIMATION ───────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (!target || prefersReducedMotion) {
      el.textContent = target >= 1000
        ? target.toLocaleString('pt-BR')
        : target;
      return;
    }

    const duration = 1400;
    const startTime = performance.now();

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current >= 1000
        ? current.toLocaleString('pt-BR')
        : current;

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Trigger counters when stats section enters viewport
  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    const counterObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statsSection.querySelectorAll('.stat__number[data-target]').forEach(animateCounter);
        counterObs.disconnect();
      }
    }, { threshold: 0.4 });
    counterObs.observe(statsSection);
  }

  /* ── FORM VALIDATION ─────────────────────────────────────── */
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('submit-btn');
  const successMsg = document.getElementById('form-success');

  if (!form) return;

  /**
   * Validate a single field.
   * Rule §8: validate on blur; show error below field.
   */
  function validateField(field) {
    const errorEl = document.getElementById(
      field.getAttribute('aria-describedby') || `err-${field.id}`
    );
    let message = '';

    if (field.required && !field.value.trim()) {
      message = 'Este campo é obrigatório.';
    } else if (field.type === 'email' && field.value.trim()) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(field.value.trim())) {
        message = 'Informe um e-mail válido (ex: nome@email.com).';
      }
    } else if (field.type === 'tel' && field.required) {
      const digits = field.value.replace(/\D/g, '');
      if (digits.length < 10) {
        message = 'Informe um telefone válido com DDD.';
      }
    }

    if (errorEl) errorEl.textContent = message;
    field.classList.toggle('is-error', !!message);
    return !message;
  }

  // Validate on blur (not on every keystroke) — rule §8 inline-validation
  form.querySelectorAll('.form__input').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    // Clear error on input (after blur showed it)
    field.addEventListener('input', () => {
      if (field.classList.contains('is-error')) {
        validateField(field);
      }
    });
  });

  // Phone mask
  const telInput = document.getElementById('f-tel');
  if (telInput) {
    telInput.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) {
        v = `(${v.slice(0,2)}) ${v.slice(2, v.length <= 10 ? 6 : 7)}-${v.slice(v.length <= 10 ? 6 : 7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }
      this.value = v;
    });
  }

  /* ── FORM SUBMIT ─────────────────────────────────────────── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate all required fields
    const fields  = [...form.querySelectorAll('.form__input')];
    const valid   = fields.map(f => validateField(f)).every(Boolean);

    if (!valid) {
      // §8: after submit error, focus first invalid field
      const firstError = form.querySelector('.form__input.is-error');
      if (firstError) firstError.focus();
      return;
    }

    // Build WhatsApp message from form data
    const nome = form.querySelector('#f-nome').value.trim();
    const tel = form.querySelector('#f-tel').value.trim();
    const email = form.querySelector('#f-email').value.trim();
    const tipo = form.querySelector('#f-tipo').value;
    const msg = form.querySelector('#f-msg').value.trim();

    let texto = `Olá, gostaria de agendar uma consulta com a Dra. Júnia Nascimento.\n\n`;
    texto += `*Nome:* ${nome}\n`;
    texto += `*Telefone:* ${tel}\n`;
    if (email) texto += `*E-mail:* ${email}\n`;
    if (tipo) texto += `*Tipo de consulta:* ${tipo}\n`;
    if (msg) texto += `*Motivo:* ${msg}\n`;

    const waURL = `https://wa.me/5531986488180?text=${encodeURIComponent(texto)}`;

    // Success feedback before redirecting
    form.reset();
    form.querySelectorAll('.form__input').forEach(f => f.classList.remove('is-error'));
    successMsg.hidden = false;
    successMsg.focus();

    // Open WhatsApp after brief delay for user feedback
    setTimeout(() => {
      window.open(waURL, '_blank', 'noopener,noreferrer');
    }, 800);

    // Hide success after 6s
    setTimeout(() => { successMsg.hidden = true; }, 6000);
  });

  /* ── FOOTER YEAR ─────────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── LGPD BANNER ───────────────────────────────────────────── */
  const lgpdBanner = document.getElementById('lgpd-banner');
  const lgpdAccept = document.getElementById('lgpd-accept');

  if (lgpdBanner && lgpdAccept) {
    const accepted = localStorage.getItem('lgpd-accepted');
    if (!accepted) {
      lgpdBanner.hidden = false;
    }

    lgpdAccept.addEventListener('click', () => {
      localStorage.setItem('lgpd-accepted', '1');
      lgpdBanner.hidden = true;
    });
  }

})();
