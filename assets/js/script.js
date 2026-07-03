/* KNOW ME — production script */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- footer year ---------- */
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* ---------- mobile nav ---------- */
    var toggle = document.getElementById('navToggle');
    var mobileNav = document.getElementById('navMobile');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = toggle.classList.toggle('open');
        mobileNav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      mobileNav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          toggle.classList.remove('open');
          mobileNav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    /* ---------- scroll reveal ---------- */
    initReveal();
    initStagger();

    /* ---------- counters (seq-num elements count up when visible) ---------- */
    initCounters();

    /* ---------- parallax on select media blocks ---------- */
    updateParallax();
    var parallaxTicking = false;
    window.addEventListener('scroll', function () {
      if (!parallaxTicking) {
        requestAnimationFrame(function () { updateParallax(); parallaxTicking = false; });
        parallaxTicking = true;
      }
    }, { passive: true });

    /* ---------- signature orange line (present on Home only) ---------- */
    initConvergeLine();

    /* ---------- process thread (present on Process page only) ---------- */
    updateProcessThread();
    window.addEventListener('scroll', updateProcessThread, { passive: true });
    window.addEventListener('resize', updateProcessThread);

    /* ---------- contact form ---------- */
    initContactForm();
  });

  /* ================= reveal on scroll ================= */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('in'); });
    }
  }

  function initStagger() {
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      var items = group.querySelectorAll('[data-reveal]');
      items.forEach(function (el, i) { el.style.setProperty('--d', (i * 90) + 'ms'); });
    });
  }

  /* ================= counters ================= */
  function initCounters() {
    var els = document.querySelectorAll('.seq-num[data-count]:not(.counted)');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('counted');
        el.textContent = el.dataset.count.padStart(2, '0');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        el.classList.add('counted');
        io.unobserve(el);
        var start = null;
        var dur = 600;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          el.textContent = String(Math.round(p * target)).padStart(2, '0');
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ================= parallax ================= */
  function updateParallax() {
    if (reduceMotion) return;
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var speed = parseFloat(el.dataset.parallax) || 0.05;
      var r = el.getBoundingClientRect();
      var offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = 'translateY(' + offset + 'px)';
    });
  }

  /* ================= signature orange line ================= */
  function initConvergeLine() {
    var path = document.getElementById('converge-path');
    if (!path) return;
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    var dotStart = document.getElementById('dot-start');
    var dotMid = document.getElementById('dot-mid');
    var dotEnd = document.getElementById('dot-end');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        if (reduceMotion) {
          path.style.strokeDashoffset = 0;
          [dotStart, dotMid, dotEnd].forEach(function (d) { if (d) d.classList.add('in'); });
          return;
        }
        var drawDelay = 420, drawDuration = 1150;
        requestAnimationFrame(function () { if (dotStart) dotStart.classList.add('in'); });
        setTimeout(function () {
          path.style.transition = 'stroke-dashoffset ' + drawDuration + 'ms cubic-bezier(.65,.05,.36,1)';
          path.style.strokeDashoffset = 0;
        }, drawDelay);
        setTimeout(function () { if (dotMid) dotMid.classList.add('in'); }, drawDelay + drawDuration * 0.52);
        setTimeout(function () { if (dotEnd) dotEnd.classList.add('in'); }, drawDelay + drawDuration + 60);
      });
    }, { threshold: 0.4 });
    io.observe(path);
  }

  /* ================= process thread ================= */
  function updateProcessThread() {
    var track = document.getElementById('processTrack');
    var fill = document.getElementById('processThreadFill');
    if (!track || !fill) return;
    var r = track.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = r.height;
    if (total <= 0) return;
    var visible = Math.min(Math.max(vh * 0.62 - r.top, 0), total);
    var pct = visible / total;
    fill.style.height = (pct * 100) + '%';
    var rows = track.querySelectorAll('.milestone');
    rows.forEach(function (row, i) {
      var rowThreshold = (i + 0.1) / rows.length;
      if (pct >= rowThreshold) row.classList.add('milestone-in');
    });
  }

  /* ================= contact form =================
     Works out of the box via a mailto fallback. To connect a real backend
     (Formspree, Netlify Forms, a custom endpoint, etc.), replace the body
     of the submit handler below with a fetch() POST to that endpoint. */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#name');
      var business = form.querySelector('#business');
      var email = form.querySelector('#email');
      var message = form.querySelector('#message');

      /* TODO: replace this block with a real submission, e.g.:
         fetch('https://your-endpoint.example/contact', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ name: name.value, business: business.value, email: email.value, message: message.value })
         }); */
      var subject = encodeURIComponent('Nieuw gesprek — ' + (business.value || name.value));
      var body = encodeURIComponent(
        'Naam: ' + name.value + '\n' +
        'Bedrijf: ' + business.value + '\n' +
        'E-mail: ' + email.value + '\n\n' +
        message.value
      );
      window.location.href = 'mailto:hello@know-me.studio?subject=' + subject + '&body=' + body;
      if (status) { status.textContent = 'Je e-mailprogramma opent met het bericht klaar om te versturen.'; status.classList.add('show'); }
    });
  }
})();
