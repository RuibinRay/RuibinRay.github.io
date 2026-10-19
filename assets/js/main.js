/*
 * main.js — puts it all together: the living painting behind the page, the opening sequence,
 * star shortcuts, the camera that drifts through the painting as you scroll, navigation,
 * section rendering and deep links.
 */
(function () {
  'use strict';
  var RJY = window.RJY, SITE = window.SITE, h = RJY.h;
  var doc = document.documentElement;
  var painting = null, glReady = false;

  /* ---------- 1. render content ---------- */
  function render(name, fn) { var el = document.querySelector('[data-render="' + name + '"]'); if (el) { try { fn(el); } catch (e) { console.error('Could not render ' + name, e); } } }
  render('about', RJY.renderAbout);
  render('education', RJY.renderEducation);
  render('offclock', RJY.renderOffclock);
  render('journey', RJY.renderJourney);
  render('work', RJY.renderWork);
  render('palette', RJY.renderPalette);
  render('palette-aux', RJY.renderPaletteAux);
  render('courses', RJY.renderCourses);
  render('constellation', RJY.renderConstellation);
  render('contact', RJY.renderContact);
  render('footer', RJY.renderFooter);
  render('atlas', RJY.renderAtlas);
  render('gallery', RJY.renderGallery);
  RJY.route.on('skills', function (id) { RJY.sheet.close(true); RJY.flashSkill(id); });
  document.querySelectorAll('[data-kicker]').forEach(function (k) { k.insertAdjacentHTML('afterbegin', RJY.starIcon()); });
  document.querySelectorAll('[data-cta]').forEach(function (a) {
    a.insertAdjacentHTML('afterbegin', RJY.starIcon('cta__star'));
    a.insertAdjacentHTML('beforeend', '<svg class="cta__stroke" viewBox="0 0 100 7" preserveAspectRatio="none" aria-hidden="true"><path d="M1 4.6C20 2.4 38 5.6 56 3.9S86 2.6 99 4.2"/></svg>');
  });
  if (RJY.draft) {
    doc.classList.add('is-draft');
    document.body.appendChild(h('a', { class: 'draft-badge', href: location.pathname, title: 'Leave draft mode', text: 'Draft view — placeholders visible' }));
  }

  /* ---------- 2. the living painting ---------- */
  var stage = document.querySelector('.stage');
  var canvas = stage.querySelector('.stage__canvas');
  var still = stage.querySelector('.stage__still');
  var vw = function () { return window.innerWidth; }, vh = function () { return window.innerHeight; };

  function paintingSources() {
    var need = Math.max(vw(), vh() * 1.34) * Math.min(window.devicePixelRatio || 1, 2);
    var size = need > 2300 ? 2560 : need > 1400 ? 2048 : 1280;
    var E = window.RJY_EMBED;
    if (E) return { painting: [E.painting], sky: E.sky, sea: E.sea, mask: E.mask, noise: E.noise, blur: E.blur };
    var b = 'assets/painting/';
    return { painting: [b + 'painting-' + size + '.webp', b + 'painting-' + size + '.jpg'], sky: b + 'flow-sky.png', sea: b + 'flow-sea.png', mask: b + 'masks.png', noise: b + 'noise.png', blur: b + 'painting-blur.jpg' };
  }

  function useStill(force) {
    if (doc.classList.contains('is-gl') && !force) return;
    doc.classList.remove('is-gl');
    if (!still.dataset.loaded) {
      still.dataset.loaded = '1';
      still.sizes = Math.round(Math.max(vw(), vh() * 1.34)) + 'px';
      still.srcset = still.dataset.srcset;
      still.src = still.dataset.src;
    }
    doc.classList.add('is-still');
    // soft CSS glows over the painted stars
    var glows = stage.querySelector('.stage__glows');
    if (!glows.childElementCount) {
      RJY.Painting.META.stars.concat([RJY.Painting.META.moon]).forEach(function (s, i) {
        glows.appendChild(h('span', { 'data-x': s.x, 'data-y': s.y, 'data-r': s.halo, style: { animationDelay: (i * 0.7) + 's' } }));
      });
    }
    layoutStill();
  }

  var stillBase = null;
  function layoutStill() {
    var w = vw(), hh = vh();
    var focal = RJY.Painting.focalFor(w, hh);
    var base = RJY.Painting.coverMap(w, hh, focal), m = RJY.Painting.viewMap(w, hh, focal, camera.current);
    // size the image to the painting once per resize, then move it with a cheap transform
    if (!stillBase || stillBase[2] !== base[2] || stillBase[3] !== base[3]) {
      still.style.width = base[2] + 'px'; still.style.height = base[3] + 'px';
      stillBase = base;
    }
    still.style.transform = 'translate(' + m[0].toFixed(1) + 'px,' + m[1].toFixed(1) + 'px) scale(' + (m[2] / base[2]).toFixed(4) + ')';
    stage.querySelectorAll('.stage__glows span').forEach(function (g) {
      var r = +g.dataset.r * m[2] * 2.2;
      g.style.left = (m[0] + g.dataset.x * m[2]) + 'px'; g.style.top = (m[1] + g.dataset.y * m[3]) + 'px';
      g.style.width = g.style.height = r + 'px';
    });
  }

  function startPainting() {
    var reduced = RJY.reducedMotion;
    if (/[?&]still\b/.test(location.search)) {   // ?still shows the still painting (handy for testing the fallback)
      useStill(); intro.run(reduced ? 0 : 1.2); hotspots.build(); return;
    }
    var firstVisit = !sessionStorageGet('rjy-intro');
    var deep = !!RJY.route.parse(location.hash) || (location.hash && location.hash !== '#home');
    var introDur = reduced ? 0 : (firstVisit && !deep ? 4.8 : 1.4);
    painting = RJY.painting = new RJY.Painting(canvas, {
      sources: paintingSources(), introDuration: introDur, maxDpr: 1.5,
      allowSoftware: /[?&](gl|capture)\b/.test(location.search),          // ?gl forces WebGL even on software renderers (testing)
      preserveDrawingBuffer: /[?&]capture\b/.test(location.search),
      onTooSlow: function () { glReady = false; useStill(true); },
      onContextLost: function () { glReady = false; useStill(true); }
    });
    painting.setView(camera.compute());
    var fallbackTimer = setTimeout(function () { if (!glReady) useStill(); }, 3500);
    painting.init().then(function () {
      glReady = true;
      clearTimeout(fallbackTimer);
      doc.classList.remove('is-still');
      doc.classList.add('is-gl');
      if (reduced) { painting.renderAt(9, 1); }
      else { painting.start(); }
      intro.run(introDur);
      hotspots.build();
    }).catch(function (err) {
      console.warn('Living painting unavailable, showing the still painting instead:', err && err.message);
      clearTimeout(fallbackTimer);
      useStill();
      intro.run(reduced ? 0 : 1.2);
      hotspots.build();
    });
  }
  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  /* ---------- 3. opening sequence ---------- */
  var intro = {
    timers: [],
    run: function (dur) {
      var self = this, steps;
      if (dur <= 0) { this.finish(); return; }
      var k = dur / 4.8;
      steps = [['intro-name', 1700 * k], ['intro-tagline', 3000 * k], ['intro-rest', 3800 * k], ['intro-done', 5000 * k]];
      steps.forEach(function (s) { self.timers.push(setTimeout(function () { doc.classList.add(s[0]); if (s[0] === 'intro-done') self.done(); }, s[1])); });
      var skip = function (e) {
        if (e && e.type === 'keydown' && ['Escape', 'Enter', ' ', 'ArrowDown', 'PageDown'].indexOf(e.key) === -1) return;
        self.finish();
      };
      this.skipHandler = skip;
      ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (ev) { window.addEventListener(ev, skip, { passive: true, once: ev !== 'keydown' }); });
      document.querySelector('.hero__skip').addEventListener('click', function () { self.finish(); });
    },
    finish: function () {
      this.timers.forEach(clearTimeout);
      doc.classList.add('intro-name', 'intro-tagline', 'intro-rest', 'intro-done');
      if (painting) painting.skipIntro();
      this.done();
    },
    done: function () {
      if (this._done) return; this._done = true;
      sessionStorageSet('rjy-intro', '1');
      if (this.skipHandler) ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (ev) { window.removeEventListener(ev, intro.skipHandler); });
      setTimeout(function () { hotspots.hint(); }, 800);
    }
  };

  RJY.intro = intro;

  /* ---------- 4. star shortcuts ---------- */
  var hotspots = {
    defs: [
      { star: 5, label: 'About me', href: '#about' },
      { star: 10, label: 'My journey', href: '#experience' },
      { star: 6, label: 'My world', href: '#world' },
      { moon: true, label: 'My work', href: '#projects' },
      { star: 8, label: 'My palette', href: '#skills' },
      { star: 7, label: 'How it connects', href: '#constellation' },
      { star: 4, label: 'Say hello', href: '#contact' }
    ],
    els: [],
    build: function () {
      var wrap = document.querySelector('.hotspots'), M = RJY.Painting.META;
      wrap.innerHTML = '';
      this.els = this.defs.map(function (d) {
        var p = d.moon ? M.moon : M.stars[d.star];
        var a = h('a', { class: 'hotspot', href: d.href, 'aria-label': d.label }, h('span', { class: 'hotspot__label', text: d.label }));
        a._pt = p; wrap.appendChild(a); return a;
      });
      this.place();
    },
    place: function () {
      if (!this.els.length) return;
      var rects = Array.prototype.map.call(document.querySelectorAll('.hero__name .line > span, .hero__tagline, .hero__intro, .cta, .hero__cue'), function (e) { return e.getBoundingClientRect(); });
      var w = vw(), hh = vh(), focal = RJY.Painting.focalFor(w, hh), m = RJY.Painting.viewMap(w, hh, focal, RJY.Painting.heroView(w, hh));
      this.els.forEach(function (a) {
        var x = m[0] + a._pt.x * m[2], y = m[1] + a._pt.y * m[3] + window.pageYOffset * 0;
        var hidden = x < 24 || x > w - 24 || y < 96 || y > hh - 90 || rects.some(function (r) { return r.width && x > r.left - 40 && x < r.right + 40 && y > r.top - 40 && y < r.bottom + 40; });
        a.style.left = x + 'px'; a.style.top = y + 'px';
        a.style.display = hidden ? 'none' : '';
      });
    },
    hint: function () {
      var wrap = document.querySelector('.hotspots');
      if (RJY.reducedMotion || sessionStorageGet('rjy-hint')) return;
      wrap.classList.add('is-hinting'); sessionStorageSet('rjy-hint', '1');
      setTimeout(function () { wrap.classList.remove('is-hinting'); }, 5200);
    }
  };

  /* ---------- 5. camera: drift through the painting while scrolling ---------- */
  var CAMS = {
    about: { z: 1.3, cx: 0.24, cy: 0.27, dim: 0.25 },
    journey: { z: 1.45, cx: 0.53, cy: 0.29, dim: 0.3 },
    world: { z: 1.25, cx: 0.62, cy: 0.74, dim: 0.3 },
    memories: { z: 1.35, cx: 0.32, cy: 0.62, dim: 0.3 },
    work: { z: 1.5, cx: 0.72, cy: 0.35, dim: 0.2 },
    palette: { z: 1.3, cx: 0.38, cy: 0.13, dim: 0.3 },
    constellation: { z: 1.2, cx: 0.5, cy: 0.2, dim: 0.35 },
    contact: 'hero'
  };
  var camera = {
    keys: [], current: null,
    measure: function () {
      var y0 = window.pageYOffset;
      this.keys = [{ y: 0, cam: 'hero' }];
      document.querySelectorAll('[data-camera]').forEach(function (s) {
        var top = s.getBoundingClientRect().top + y0;
        var lead = s.classList.contains('sec--first') ? vh() * 0.25 : 0;   // let the dissolve play before arriving
        camera.keys.push({ y: Math.max(1, top + lead - vh() * 0.15), cam: s.dataset.camera, el: s });
      });
    },
    get: function (name) {
      if (name === 'hero' || CAMS[name] === 'hero') { var v = RJY.Painting.heroView(vw(), vh()); v.dim = 0; return v; }
      return CAMS[name];
    },
    // 0..1: how far the camera has travelled into the final (contact) view
    endProgress: function () {
      var k = this.keys; if (k.length < 2) return 0;
      var a = k[k.length - 2], b = k[k.length - 1], y = window.pageYOffset;
      return Math.min(1, Math.max(0, (y - a.y) / Math.max(1, b.y - a.y)));
    },
    compute: function () {
      var y = window.pageYOffset, k = this.keys;
      if (!k.length) this.measure();
      k = this.keys;
      var a = k[0], b = k[0];
      for (var i = 0; i < k.length; i++) { if (k[i].y <= y) { a = k[i]; b = k[i + 1] || k[i]; } }
      var A = this.get(a.cam), B = this.get(b.cam);
      var t = b === a ? 0 : Math.min(1, Math.max(0, (y - a.y) / Math.max(1, b.y - a.y)));
      t = t * t * (3 - 2 * t);
      var lerp = function (p, q) { return p + (q - p) * t; };
      this.current = { z: lerp(A.z, B.z), cx: lerp(A.cx, B.cx), cy: lerp(A.cy, B.cy), dim: lerp(A.dim, B.dim) };
      return this.current;
    }
  };

  /* ---------- 6. scroll & resize loop ---------- */
  var nav = document.getElementById('nav');
  var heroText = document.querySelector('.hero__text');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var ticking = false, mouse = [0, 0];
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var y = window.pageYOffset, H = vh();
    var cam = camera.compute();
    if (painting && glReady) {
      painting.setView(cam);
      painting.setScroll(cam.dim);
      // the painting is mostly hidden behind the veils between hero and contact
      var veiled = y > H * 1.2 && y < (camera.keys[camera.keys.length - 1].y - H * 0.6);
      painting.setBudget(veiled ? 0.6 : 1, veiled ? 30 : 60);
    } else if (doc.classList.contains('is-still')) layoutStill();
    nav.classList.toggle('is-scrolled', y > 40);
    var f = Math.min(1, y / (H * 0.5));
    heroText.style.opacity = String(1 - f);
    heroText.style.transform = 'translate(' + (-mouse[0] * 6).toFixed(1) + 'px,' + (-(mouse[1] * 4) - y * 0.12).toFixed(1) + 'px)';
    if (RJY.skyLinks) RJY.skyLinks.update(camera.endProgress(), cam);
    var hs = document.querySelector('.hotspots');
    hs.style.opacity = y > 30 ? '0' : '1'; hs.style.visibility = y > H * 0.5 ? 'hidden' : '';
    // current section in the navigation
    var mid = H * 0.38, current = sections[0];
    sections.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) current = s; });
    navLinks.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + current.id)); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var rz;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () { if (painting && glReady) painting.resize(); camera.measure(); hotspots.place(); update(); }, 120);
  });
  window.addEventListener('load', function () { camera.measure(); update(); });
  if ('ResizeObserver' in window) {
    var lastH = 0;
    new ResizeObserver(function () {
      var hgt = document.documentElement.scrollHeight;
      if (Math.abs(hgt - lastH) > 2) { lastH = hgt; camera.measure(); onScroll(); }
    }).observe(document.getElementById('main'));
  }

  // gentle parallax: the sky drifts a few pixels with the pointer
  if (RJY.finePointer && !RJY.reducedMotion) {
    window.addEventListener('pointermove', function (e) {
      if (window.pageYOffset > vh()) return;
      mouse = [e.clientX / vw() * 2 - 1, e.clientY / vh() * 2 - 1];
      if (painting) painting.setMouse(mouse[0], mouse[1]);
      onScroll();
    }, { passive: true });
  }

  /* ---------- 7. reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !RJY.reducedMotion) {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { rio.observe(el); });
  } else document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });

  /* ---------- 8. mobile menu ---------- */
  var toggle = document.querySelector('.nav__toggle'), menu = document.getElementById('menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    RJY.lockScroll(open);
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a') && toggle.getAttribute('aria-expanded') === 'true') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });

  /* ---------- 9. go ---------- */
  function boot() {
    camera.measure();
    if (location.protocol === 'file:' && !window.RJY_EMBED) {
      // Opened by double-clicking index.html: browsers block WebGL from reading local image files,
      // so load the same images bundled as data (see README → "Previewing on your computer").
      var sc = document.createElement('script');
      sc.src = 'assets/painting/embedded.js';
      sc.onload = startPainting;
      sc.onerror = startPainting;
      document.head.appendChild(sc);
    } else startPainting();
    update();
    if (RJY.route.parse(location.hash)) setTimeout(function () { RJY.route.handle(); }, 60);
    else if (location.hash && location.hash !== '#home') {
      var t = document.querySelector(location.hash);
      if (t) setTimeout(function () { RJY.scrollTo(t, { instant: true, offset: 0 }); }, 60);
    }
  }
  boot();
})();
