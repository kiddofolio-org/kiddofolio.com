/* Kiddofolio — main.js */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---- Theme toggle (no localStorage; sandbox-safe) ---- */
  var toggle = document.querySelector('[data-theme-toggle]');
  var mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', mode);

  var sun = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  var moon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';

  function paint() {
    if (!toggle) return;
    toggle.innerHTML = mode === 'dark' ? sun : moon;
    toggle.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode');
  }
  paint();
  if (toggle) {
    toggle.addEventListener('click', function () {
      mode = mode === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', mode);
      paint();
    });
  }

  /* ---- Mobile nav ---- */
  var menuBtn = document.querySelector('[data-menu-btn]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Sticky header shadow ---- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('header--scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- FAQ: smooth height animation for <details> ---- */
  document.querySelectorAll('.faq').forEach(function (faq) {
    var body = faq.querySelector('.faq__a');
    var summary = faq.querySelector('summary');
    if (!body || !summary) return;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (faq.open) {
        var h = body.scrollHeight;
        body.style.height = h + 'px';
        requestAnimationFrame(function () { body.style.height = '0px'; });
        var done = function () { faq.open = false; body.style.height = ''; body.removeEventListener('transitionend', done); };
        body.addEventListener('transitionend', done);
      } else {
        faq.open = true;
        var target = body.scrollHeight;
        body.style.height = '0px';
        requestAnimationFrame(function () { body.style.height = target + 'px'; });
        var open = function () { body.style.height = ''; body.removeEventListener('transitionend', open); };
        body.addEventListener('transitionend', open);
      }
    });
  });

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Footer year ---- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
