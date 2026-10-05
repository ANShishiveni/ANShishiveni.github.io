(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* year */
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    /* reveal on scroll */
    var revealables = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
      revealables.forEach(function (el) { io.observe(el); });
    }

    /* mobile menu */
    var menuBtn = document.getElementById('menuBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    function closeMenu() {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', function () {
        var open = mobileMenu.classList.toggle('hidden') === false;
        menuBtn.setAttribute('aria-expanded', String(open));
      });
      mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }

    /* header elevation + back to top */
    var header = document.getElementById('siteHeader');
    var toTop = document.getElementById('toTop');
    function onScroll() {
      var sc = window.scrollY;
      if (header) header.style.paddingBottom = sc > 10 ? '0' : '';
      if (toTop) {
        if (sc > 600) { toTop.classList.remove('hidden'); toTop.classList.add('grid'); }
        else { toTop.classList.add('hidden'); toTop.classList.remove('grid'); }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    /* active nav link */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
    var sections = navLinks.map(function (l) { return document.querySelector(l.getAttribute('href')); }).filter(Boolean);
    if (sections.length && 'IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          navLinks.forEach(function (l) {
            var active = l.getAttribute('href') === '#' + e.target.id;
            l.classList.toggle('text-brand-charcoal', active);
            l.classList.toggle('bg-gray-100', active);
            l.classList.toggle('text-gray-500', !active);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }

    /* project filter */
    var filterBtns = document.querySelectorAll('.filter-btn');
    var projects = document.querySelectorAll('.project');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        filterBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        projects.forEach(function (card) {
          var show = f === 'all' || card.getAttribute('data-cat') === f || card.getAttribute('data-cat') === 'all';
          card.classList.toggle('is-hidden', !show);
          if (show) card.classList.add('is-visible');
        });
      });
    });

    /* copy email */
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      var label = btn.querySelector('[data-copy-label]');
      var original = label ? label.textContent : null;
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        function done() {
          if (!label) return;
          label.textContent = 'Copied to clipboard';
          window.setTimeout(function () { label.textContent = original; }, 2200);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { label && (label.textContent = text); });
        } else if (label) {
          label.textContent = text;
        }
      });
    });

    /* Project Card Spotlight */
    document.querySelectorAll('.project').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--x', x + 'px');
        card.style.setProperty('--y', y + 'px');
      });
    });

    /* Magnetic Buttons */
    document.querySelectorAll('.magnetic-btn').forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var h = rect.width / 2;
        var v = rect.height / 2;
        var x = e.clientX - rect.left - h;
        var y = e.clientY - rect.top - v;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });

  })();
