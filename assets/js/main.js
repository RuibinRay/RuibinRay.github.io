/*
 * main.js — puts it all together: the living painting behind the page, the opening sequence,
 * the star portals, the camera that drifts through the painting as you scroll, navigation,
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
  render('hero-featured', RJY.renderHeroFeatured);
  render('palette', RJY.renderPalette);
  render('palette-aux', RJY.renderPaletteAux);
  render('certificates', RJY.renderCertificates);
  render('courses', RJY.renderCourses);
  render('constellation', RJY.renderConstellation);
  render('contact', RJY.renderContact);
  render('footer', RJY.renderFooter);
  render('atlas', RJY.renderAtlas);
  render('albums', RJY.renderAlbums);
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
  if (!RJY.finePointer) doc.classList.add('is-touch');

  /* ---------- 2a. pause / play the moving painting ----------
     The painting moves on its own; this button (in the navigation) stops and restarts it, and the
     choice is remembered in this browser. */
  var MOTION_KEY = 'rjy-motion';
  var ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9M11 3.5v9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.4l7 4.6-7 4.6z" fill="currentColor"/></svg>';
  var motion = {
    paused: (function () { try { return localStorage.getItem(MOTION_KEY) === 'paused'; } catch (e) { return false; } })(),
    btn: null,
    build: function () {
      var navEl = document.getElementById('nav');
      this.btn = h('button', { class: 'nav__motion', type: 'button', onclick: function () { motion.set(!motion.paused); } });
      navEl.insertBefore(this.btn, navEl.querySelector('.nav__toggle'));
      this.render();
    },
    render: function () {
      var p = this.paused;
      doc.classList.toggle('is-paused', p);
      if (!this.btn) return;
      this.btn.setAttribute('aria-label', p ? 'Play the moving painting' : 'Pause the moving painting');
      this.btn.title = p ? 'Play the painting' : 'Pause the painting';
      this.btn.innerHTML = p ? ICON_PLAY : ICON_PAUSE;
    },
    set: function (p) {
      this.paused = p;
      try { localStorage.setItem(MOTION_KEY, p ? 'paused' : 'playing'); } catch (e) {}
      if (painting && glReady) { if (p) painting.stop(); else painting.start(); }
      this.render();
      try { document.dispatchEvent(new CustomEvent('rjy:motion', { detail: { paused: p } })); } catch (e) {}
      if (typeof update === 'function') update();   // the camera holds still (or moves again) at once
    }
  };
  RJY.motion = motion;
  motion.build();

  /* ---------- 2. the living painting ---------- */
  var stage = document.querySelector('.stage');
  var canvas = stage.querySelector('.stage__canvas');
  var still = stage.querySelector('.stage__still');
  var stageVeil = h('div', { class: 'stage__veil' });
  stage.appendChild(stageVeil);
  var vw = function () { return window.innerWidth; }, vh = function () { return window.innerHeight; };
  // the soft preview behind the canvas sits exactly where the painting will appear
  function placePreview() {
    var w = stage.clientWidth || vw(), hh = stage.clientHeight || vh(), m = RJY.Painting.coverMap(w, hh, RJY.Painting.focalFor(w, hh));
    stage.style.backgroundSize = Math.round(m[2]) + 'px ' + Math.round(m[3]) + 'px';
    stage.style.backgroundPosition = Math.round(m[0]) + 'px ' + Math.round(m[1]) + 'px';
  }
  placePreview();

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
      RJY.Painting.LIGHTS.forEach(function (s, i) {
        glows.appendChild(h('span', { 'data-i': i, 'data-x': s.x, 'data-y': s.y, 'data-r': s.halo, style: { animationDelay: (i * 0.7) + 's' } }));
      });
    }
    layoutStill();
  }

  var stillBase = null;
  function stillMap(view) {
    var w = vw(), hh = vh(), focal = RJY.Painting.focalFor(w, hh);
    return { base: RJY.Painting.coverMap(w, hh, focal), m: RJY.Painting.viewMap(w, hh, focal, view) };
  }
  function layoutStill(view) {
    var mm = stillMap(view || camera.current), base = mm.base, m = mm.m;
    // size the image to the painting once per resize, then move it with a cheap transform
    if (!stillBase || stillBase[2] !== base[2] || stillBase[3] !== base[3]) {
      still.style.width = base[2] + 'px'; still.style.height = base[3] + 'px';
      stillBase = base;
    }
    still.style.transform = 'translate(' + m[0].toFixed(1) + 'px,' + m[1].toFixed(1) + 'px) scale(' + (m[2] / base[2]).toFixed(4) + ')';
    // the section's colour mood, as closely as a CSS filter allows
    var v = view || camera.current;
    if (v && v.tint) {
      var warm = (v.tint[0] - v.tint[2]) * 0.6, light = (v.tint[0] + v.tint[1] + v.tint[2]) / 3;
      still.style.filter = 'saturate(' + v.sat.toFixed(3) + ') brightness(' + (light * (1 - 0.38 * (v.dim || 0))).toFixed(3) + ')' +
        (warm > 0.01 ? ' sepia(' + Math.min(0.4, warm).toFixed(3) + ')' : warm < -0.01 ? ' hue-rotate(' + (warm * 40).toFixed(1) + 'deg)' : '');
    }
    stage.querySelectorAll('.stage__glows span').forEach(function (g) {
      var r = +g.dataset.r * m[2] * 2.2;
      g.style.left = (m[0] + g.dataset.x * m[2]) + 'px'; g.style.top = (m[1] + g.dataset.y * m[3]) + 'px';
      g.style.width = g.style.height = r + 'px';
    });
  }
  // hover on the still painting: a CSS glow brightens over the star
  function stillHover(i, on) {
    var g = stage.querySelector('.stage__glows span[data-i="' + i + '"]');
    if (g) g.classList.toggle('is-lit', on);
  }
  RJY.starHover = function (i, on) {
    if (painting && glReady) painting.setHover(i, on);
    else stillHover(i, on);
  };

  // ?why: a small line at the bottom of the screen saying how the painting is being shown and why
  // (living or still, full or lighter, resolution, frame rate, graphics) — for checking a device.
  var stillWhy = '';
  function whyBadge() {
    if (!/[?&]why\b/.test(location.search)) return;
    var el = h('p', { class: 'why-badge', role: 'status' });
    document.body.appendChild(el);
    var last = 0, lastT = performance.now();
    setInterval(function () {
      var P = painting, n = P && P.frames || 0, t = performance.now(), fps = Math.round((n - last) * 1000 / (t - lastT));
      last = n; lastT = t;
      var parts = [];
      if (glReady && P) parts.push('Living painting (' + (P.lite ? 'lighter' : 'full') + ', ' + Math.round(P.quality * 100) + '% resolution, ' + (P.running ? fps + ' fps' : 'paused') + ')');
      else parts.push('Still image' + (stillWhy ? ': ' + stillWhy : ''));
      if (RJY.reducedMotion) parts.push('reduce motion is on (calmer movement)');
      if (P && P.renderer && parts[0].indexOf(P.renderer) === -1) parts.push(P.renderer);
      el.textContent = parts.join(' · ');
    }, 1000);
  }

  // The opening and the star doorways start once the painting is ready, or after a short wait on a
  // slow connection (the blurred preview of the painting shows meanwhile).
  var introStarted = false;
  function startIntro(dur) {
    if (introStarted) return;
    introStarted = true;
    intro.run(dur);
    hotspots.build();
  }
  function startPainting() {
    var reduced = RJY.reducedMotion;
    whyBadge();
    if (/[?&]still\b/.test(location.search)) {
      stillWhy = '?still in the address';   // ?still shows the still painting (handy for testing the fallback)
      useStill(); startIntro(reduced ? 0 : 1.2); return;
    }
    var firstVisit = !sessionStorageGet('rjy-intro');
    var deep = !!RJY.route.parse(location.hash) || (location.hash && location.hash !== '#home');
    var introDur = reduced ? 0 : (firstVisit && !deep ? 4.8 : 1.4);
    painting = RJY.painting = new RJY.Painting(canvas, {
      sources: paintingSources(), introDuration: introDur, maxDpr: 1.5,
      allowSoftware: /[?&](gl|capture)\b/.test(location.search),          // ?gl forces WebGL even on software renderers (testing)
      lite: /[?&]lite\b/.test(location.search),                           // ?lite starts with the lighter painting (testing)
      preserveDrawingBuffer: /[?&]capture\b/.test(location.search),
      onTooSlow: function () { glReady = false; stillWhy = 'this device could not draw it smoothly'; useStill(true); },
      onContextLost: function () { glReady = false; stillWhy = 'the graphics context was lost'; useStill(true); },
      onRestored: function () { glReady = true; showLiving(); update(); }
    });
    // reduced motion: the painting still lives, but calmly (slower flow, nothing zooms or spins)
    painting.setGentle(reduced);
    painting.setCamera(camera.compute(), true);
    var slowStart = setTimeout(function () { startIntro(reduced ? 0 : 1.2); }, 2600);
    var fallbackTimer = setTimeout(function () { if (!glReady) useStill(); }, 9000);
    painting.init().then(function () {
      glReady = true;
      clearTimeout(fallbackTimer); clearTimeout(slowStart);
      showLiving();
      startIntro(introDur);
      update();
    }).catch(function (err) {
      console.warn('Living painting unavailable, showing the still painting instead:', err && err.message);
      stillWhy = err && err.message;
      clearTimeout(fallbackTimer); clearTimeout(slowStart);
      useStill();
      startIntro(reduced ? 0 : 1.2);
    });
  }
  function showLiving() {
    doc.classList.remove('is-still');
    doc.classList.add('is-gl');
    if (motion.paused) painting.renderAt(9, 1); else painting.start();
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
      setTimeout(function () { hotspots.place(); }, 900);
      if (this.skipHandler) ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (ev) { window.removeEventListener(ev, intro.skipHandler); });
      setTimeout(function () { hotspots.hint(); }, 700);
    }
  };

  RJY.intro = intro;

  /* ---------- 4. star portals ----------
     Painted stars that lead somewhere. There is no circle or button: the invisible hit area is a
     little larger than the star, and the star itself reacts (in the painting) when you come near,
     hover or focus it. Selecting one opens a portal into its section. */
  var hotspots = {
    defs: [
      // star: index in RJY.Painting.LIGHTS (11 = the moon). style: 0 iris, 1 parting, 2 soft. night: 0 keeps the painting.
      { star: 10, label: 'Discover my story', href: '#about', style: 2 },
      { star: 5, label: 'Follow my journey', href: '#experience', style: 0, sparkle: 1 },
      { star: 6, label: 'Explore my world', href: '#world', style: 1 },
      { star: 7, label: 'Discover my projects', href: '#projects', style: 0, sparkle: 1 },
      { star: 8, label: 'See my palette', href: '#skills', style: 2 },
      { star: 9, label: 'See how it all connects', href: '#constellation', style: 0, sparkle: 1 },
      { star: 11, label: 'Say hello', href: '#contact', style: 0, night: 0 }
    ],
    els: [],
    build: function () {
      var wrap = document.querySelector('.hotspots'), L = RJY.Painting.LIGHTS;
      wrap.innerHTML = '';
      this.els = this.defs.map(function (d) {
        var label = h('span', { class: 'hotspot__label' }, h('span', { class: 'hotspot__text', text: d.label }));
        var a = h('a', { class: 'hotspot', href: d.href, 'aria-label': d.label, 'data-star': d.star }, label);
        a._def = d; a._pt = L[d.star]; a._label = label;
        var on = function () { RJY.starHover(d.star, true); };
        var off = function () { if (document.activeElement !== a) RJY.starHover(d.star, false); };
        a.addEventListener('pointerenter', on);
        a.addEventListener('pointerleave', off);
        a.addEventListener('focus', on);
        a.addEventListener('blur', function () { RJY.starHover(d.star, false); });
        a.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;   // let new-tab clicks work normally
          e.preventDefault();
          portal.go(d, e.detail === 0);   // detail 0: Enter on the keyboard
        });
        wrap.appendChild(a);
        return a;
      });
      this.place();
    },
    // Keep each portal on its painted star (the painting is cropped differently on every screen).
    place: function () {
      if (!this.els.length) return;
      // (while the opening plays, the name's letters are still sliding up inside their lines, so a
      // line's own box gives the height and the letters give the width)
      var rects = Array.prototype.map.call(document.querySelectorAll('.hero__name .line > span'), function (e) {
        var t = e.getBoundingClientRect(), l = e.parentNode.getBoundingClientRect();
        return { left: t.left, right: t.right, top: l.top, bottom: l.bottom };
      }).concat(Array.prototype.map.call(document.querySelectorAll('.hero__tagline, .hero__intro, .cta, .hero__featured, .hero__cue'), function (e) { return e.getBoundingClientRect(); }));
      var w = vw(), hh = vh(), focal = RJY.Painting.focalFor(w, hh), m = RJY.Painting.viewMap(w, hh, focal, RJY.Painting.heroView(w, hh));
      var navH = nav ? nav.offsetHeight : 76, scrollY = window.pageYOffset;
      this.els.forEach(function (a) {
        var i = a._def.star, x = m[0] + a._pt.x * m[2], y = m[1] + a._pt.y * m[3];
        var halo = RJY.Painting.effectRadius(i) * m[2];
        var r = Math.max(24, Math.min(88, halo * 0.75));
        var hidden = x < 14 || x > w - 14 || y < navH + 10 || y > hh - 70 || rects.some(function (b) {
          b = { left: b.left, right: b.right, top: b.top + scrollY, bottom: b.bottom + scrollY };
          return b.right > b.left && x > b.left - 30 && x < b.right + 30 && y > b.top - 30 && y < b.bottom + 30;
        });
        a.style.left = x + 'px'; a.style.top = y + 'px';
        a.style.width = a.style.height = (2 * r) + 'px';
        a.style.marginLeft = a.style.marginTop = (-r) + 'px';
        a.hidden = hidden;
        a._visible = !hidden;
        // label below the star (above it near the bottom of the screen), kept inside the window
        var lab = a._label, below = y < hh * 0.62, off = Math.max(18, Math.min(56, halo * 0.6)) + 8;
        lab.classList.toggle('is-above', !below);
        lab.style.top = below ? (r + off) + 'px' : '';
        lab.style.bottom = below ? '' : (r + off) + 'px';
        var lw = lab.offsetWidth || 160;
        var shift = Math.max(12 - (x - lw / 2), Math.min(0, (w - 12) - (x + lw / 2)));
        lab.style.setProperty('--shift', shift + 'px');
      });
    },
    visibleStars: function () {
      return this.els.filter(function (a) { return a._visible; }).map(function (a) { return a._def.star; });
    },
    // After the opening, the portal stars shimmer one after another, once per visit.
    hint: function () {
      if (RJY.reducedMotion || sessionStorageGet('rjy-hint') || !painting || !glReady) return;
      sessionStorageSet('rjy-hint', '1');
      painting.flareSequence(this.visibleStars(), 0.32);
    }
  };

  /* ---------- 5. portal: a star becomes a doorway into a section ---------- */
  var cameraFrozen = false;
  var portal = {
    busy: false,
    go: function (d, fromKeyboard) {
      if (this.busy) return;
      var target = document.querySelector(d.href);
      if (!target) return;
      this.busy = true;
      if (!doc.classList.contains('intro-done')) intro.finish();
      var from = window.pageYOffset, self = this;
      var living = painting && glReady && painting.running && !RJY.reducedMotion;
      blockInput(true);
      doc.classList.add('is-portal');
      var jumped = false, finished = false;
      function go() { if (!jumped) { jumped = true; jump(d, from, fromKeyboard); } }
      // safety net: if the animation stalls (a lost graphics context, a hidden tab), land anyway
      var guard = setTimeout(function () {
        if (painting && painting.portalState) { painting.portalState = null; painting.setHover(d.star, false); }
        go(); arrive(); finish();
      }, 5000);
      function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(guard);
        doc.classList.remove('is-arriving', 'is-portal-still');
        blockInput(false);
        self.busy = false;
        RJY.starHover(d.star, false);
        var head = target.querySelector('h2');
        if (head) { head.setAttribute('tabindex', '-1'); try { head.focus({ preventScroll: true }); } catch (e) {} }
      }
      if (living) {
        cameraFrozen = true;
        painting.setBudget(1, 60);
        painting.startPortal(d.star, {
          style: d.style || 0, night: d.night == null ? 1 : d.night, sparkle: d.sparkle || 0, duration: 1.0, coverAt: 0.82,
          onCover: go,
          onEnd: function () { go(); arrive(); painting.endPortal(0.5, finish); }
        });
      } else if (!RJY.reducedMotion && !motion.paused && doc.classList.contains('is-still')) {
        // still painting: zoom toward the star, let the night close in, then open on the section
        doc.classList.add('is-portal-still');
        RJY.starHover(d.star, true);
        var mm = stillMap(camera.current), sx = mm.m[0] + RJY.Painting.LIGHTS[d.star].x * mm.m[2], sy = mm.m[1] + RJY.Painting.LIGHTS[d.star].y * mm.m[3];
        var k = 2.4;
        still.style.transform = 'translate(' + (sx - (sx - mm.m[0]) * k).toFixed(1) + 'px,' + (sy - (sy - mm.m[1]) * k).toFixed(1) + 'px) scale(' + (mm.m[2] / mm.base[2] * k).toFixed(4) + ')';
        stageVeil.style.background = 'radial-gradient(circle at ' + sx + 'px ' + sy + 'px, rgba(255,226,150,.35) 0, rgba(5,10,46,.7) 10vmax, #050a2e 36vmax)';
        setTimeout(function () { go(); arrive(); setTimeout(finish, 520); }, 700);
      } else {
        // reduced motion: a simple, quick crossfade
        setTimeout(function () { go(); arrive(); setTimeout(finish, 320); }, 180);
      }
    }
  };
  RJY.portal = portal;

  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - vh()); }
  function jump(d, from, fromKeyboard) {
    var target = document.querySelector(d.href);
    var y = Math.round(target.getBoundingClientRect().top + window.pageYOffset);
    if (d.href === '#contact') {
      // the contact sky is the very end of the page (the painting's full view), unless its words are
      // taller than the window: then land with its first line just under the navigation
      var first = target.querySelector('.sec__kicker, .contact__title');
      var firstY = first ? Math.round(first.getBoundingClientRect().top + window.pageYOffset) - (nav ? nav.offsetHeight : 76) - 24 : y;
      y = Math.min(maxScroll(), firstY);
    }
    // record the history entry before moving, so Back (and the browser's own scroll restoration)
    // returns to where the visitor was
    try {
      history.replaceState(Object.assign({}, history.state || {}, { y: from, star: fromKeyboard ? d.star : null }), '');
      history.pushState({ y: y, portal: 1 }, '', d.href);
    } catch (e) {}
    RJY.scrollNow(y);
  }
  function arrive() {
    cameraFrozen = false;
    doc.classList.add('is-arriving');
    doc.classList.remove('is-portal');
    if (doc.classList.contains('is-still')) {
      doc.classList.remove('is-portal-still');
      still.style.transition = 'none'; layoutStill(camera.compute()); void still.offsetWidth; still.style.transition = '';
    }
    update();
  }
  // While the portal plays, the page does not scroll under it.
  var SCROLL_KEYS = { ArrowDown: 1, ArrowUp: 1, PageDown: 1, PageUp: 1, Home: 1, End: 1, ' ': 1 };
  function stop(e) { if (portal.busy && (e.type !== 'keydown' || SCROLL_KEYS[e.key])) e.preventDefault(); }
  var blocking = false;
  function blockInput(on) {
    if (on === blocking) return;
    blocking = on;
    ['wheel', 'touchmove', 'keydown'].forEach(function (ev) {
      if (on) window.addEventListener(ev, stop, { passive: false }); else window.removeEventListener(ev, stop, { passive: false });
    });
  }
  // Back / forward after a portal: return to where the visitor was.
  window.addEventListener('popstate', function (e) {
    if (e.state && typeof e.state.y === 'number' && !RJY.route.parse(location.hash)) {
      RJY.scrollNow(e.state.y);
      update();   // bring the homepage (and its doorways, hidden while scrolled away) back at once
      // came back from a doorway opened with the keyboard: focus returns to that star
      if (e.state.star != null) {
        var a = document.querySelector('.hotspot[data-star="' + e.state.star + '"]');
        var give = function () { try { a.focus({ preventScroll: true }); } catch (err) {} return document.activeElement === a; };
        // (with reduced motion every style change is a tiny transition, so it may only work a frame later)
        if (a && !a.hidden && !give()) requestAnimationFrame(function () { setTimeout(give, 40); });
      }
    }
  });

  /* ---------- 6. camera: travel into the painting while scrolling ----------
     Each section has a place in the painting, a zoom that deepens as the page goes on, and a colour
     mood (tint, saturation, how strongly the paint flows, how brightly the stars glow). Between two
     sections everything blends with the scroll; at Contact the camera pulls back to the full view. */
  var CAMS = {
    //            zoom     centre (0–1 across, down)  dim       tint [r, g, b]          saturation  flow  star glow
    about:         { z: 1.22, cx: 0.32, cy: 0.42, dim: 0.22, tint: [1.07, 1.0, 0.88],  sat: 1.08, flow: 1.0, glow: 1.1 },   // warm: the figure and the bright star
    journey:       { z: 1.38, cx: 0.53, cy: 0.29, dim: 0.26, tint: [0.9, 0.97, 1.12],  sat: 1.15, flow: 1.3, glow: 1.0 },   // the great spiral, cool and moving
    world:         { z: 1.5, cx: 0.62, cy: 0.74, dim: 0.26, tint: [0.84, 1.05, 1.05], sat: 1.05, flow: 0.9, glow: 0.9 },   // the sea, teal
    work:          { z: 1.64, cx: 0.74, cy: 0.34, dim: 0.2, tint: [0.98, 0.9, 1.12],  sat: 1.12, flow: 1.2, glow: 1.15 },  // the second spiral, violet
    palette:       { z: 1.74, cx: 0.4, cy: 0.14, dim: 0.24, tint: [1.04, 1.0, 0.97],  sat: 1.4, flow: 1.0, glow: 1.1 },    // the stars, colours at their richest
    constellation: { z: 1.84, cx: 0.52, cy: 0.17, dim: 0.32, tint: [0.84, 0.9, 1.14],  sat: 0.8, flow: 0.55, glow: 1.5 },  // deep night, the stars brightest
    contact: 'hero'
  };
  var NATURAL = { tint: [1, 1, 1], sat: 1, flow: 1, glow: 1 };
  var camera = {
    keys: [], current: null,
    measure: function () {
      var y0 = window.pageYOffset;
      this.keys = [{ y: 0, cam: 'hero' }];
      document.querySelectorAll('[data-camera]').forEach(function (s) {
        if (s.hidden || !s.getClientRects().length) return;   // a section that isn't shown
        var top = s.getBoundingClientRect().top + y0;
        var lead = s.classList.contains('sec--first') ? vh() * 0.25 : 0;   // let the dissolve play before arriving
        camera.keys.push({ y: Math.max(1, top + lead - vh() * 0.15), cam: s.dataset.camera, el: s });
      });
    },
    get: function (name) {
      if (name === 'hero' || CAMS[name] === 'hero') return Object.assign(RJY.Painting.heroView(vw(), vh()), { dim: 0 }, NATURAL);
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
      this.current = {
        z: lerp(A.z, B.z), cx: lerp(A.cx, B.cx), cy: lerp(A.cy, B.cy), dim: lerp(A.dim, B.dim),
        tint: [lerp(A.tint[0], B.tint[0]), lerp(A.tint[1], B.tint[1]), lerp(A.tint[2], B.tint[2])],
        sat: lerp(A.sat, B.sat), flow: lerp(A.flow, B.flow), glow: lerp(A.glow, B.glow)
      };
      // paused: nothing moves, so the view stays the full painting (the colours and dimming still follow)
      if (motion.paused) Object.assign(this.current, RJY.Painting.heroView(vw(), vh()));
      return this.current;
    }
  };

  /* ---------- 7. scroll & resize loop ---------- */
  var nav = document.getElementById('nav');
  var heroText = document.querySelector('.hero__text');
  var hotspotWrap = document.querySelector('.hotspots');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  var ticking = false, mouse = [0, 0];
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var y = window.pageYOffset, H = vh();
    var cam = cameraFrozen ? camera.current : camera.compute();
    if (painting && glReady) {
      if (!cameraFrozen) {
        painting.setCamera(cam);
        // behind the sections the painting is partly veiled: a little less resolution and frame rate
        var veiled = y > H * 1.2 && y < (camera.keys[camera.keys.length - 1].y - H * 0.6);
        painting.setBudget(veiled ? 0.8 : 1, veiled ? 40 : 60);
      }
    } else if (doc.classList.contains('is-still') && !cameraFrozen && !doc.classList.contains('is-portal-still')) layoutStill();
    nav.classList.toggle('is-scrolled', y > 40);
    var f = Math.min(1, y / (H * 0.5));
    heroText.style.opacity = String(1 - f);
    heroText.style.transform = 'translate(' + (-mouse[0] * 6).toFixed(1) + 'px,' + (-(mouse[1] * 4) - y * 0.12).toFixed(1) + 'px)';
    if (RJY.skyLinks) RJY.skyLinks.update(camera.endProgress(), cam);
    hotspotWrap.style.opacity = y > 30 ? '0' : '1'; hotspotWrap.style.visibility = y > H * 0.5 ? 'hidden' : '';
    // which stars respond to the pointer: the portals on the homepage, the contact stars at the end
    if (painting && glReady) {
      var heroActive = y < H * 0.3 && !cameraFrozen;
      painting.setInteractive(heroActive ? hotspots.visibleStars() : (RJY.skyLinks ? RJY.skyLinks.activeStars() : []));
    }
    // current section in the navigation
    var mid = H * 0.38, current = sections[0];
    sections.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) current = s; });
    document.querySelectorAll('.nav__link').forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + current.id)); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var rz;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () { placePreview(); if (painting && glReady) painting.resize(); camera.measure(); hotspots.place(); update(); }, 120);
  });
  window.addEventListener('load', function () { camera.measure(); hotspots.place(); update(); });
  if ('ResizeObserver' in window) {
    var lastH = 0;
    new ResizeObserver(function () {
      var hgt = document.documentElement.scrollHeight;
      if (Math.abs(hgt - lastH) > 2) { lastH = hgt; camera.measure(); onScroll(); }
    }).observe(document.getElementById('main'));
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { hotspots.place(); });

  // gentle parallax: the sky drifts a few pixels with the pointer; nearby stars sense the pointer
  if (RJY.finePointer && !RJY.reducedMotion) {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      if (painting) painting.setCursor(e.clientX, e.clientY);
      if (window.pageYOffset > vh()) return;
      mouse = [e.clientX / vw() * 2 - 1, e.clientY / vh() * 2 - 1];
      if (painting) painting.setMouse(mouse[0], mouse[1]);
      onScroll();
    }, { passive: true });
    document.addEventListener('pointerleave', function () { if (painting) painting.setCursor(null); });
  }

  /* ---------- 8. reveal on scroll ---------- */
  var rio = null;
  if ('IntersectionObserver' in window && !RJY.reducedMotion) {
    rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  }
  // also used for content drawn later (photos found after the page loaded)
  RJY.reveal = function (scope) {
    (scope || document).querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { if (rio) rio.observe(el); else el.classList.add('is-in'); });
  };
  RJY.reveal();

  /* ---------- 9. mobile menu ---------- */
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

  /* ---------- 10. go ---------- */
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
