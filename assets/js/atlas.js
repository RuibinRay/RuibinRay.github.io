/*
 * atlas.js — "A world still waiting to be discovered": an interactive world map.
 *
 * Real country boundaries (Natural Earth 1:50m) drawn with d3-geo. Countries in data/travel.js
 * light up by status; every country can be selected. Statistics, the year filter, the replay and
 * the milestones are all computed from data/travel.js — nothing here is invented.
 *
 * Draft mode (?draft): status buttons in the country panel save to this browser's localStorage,
 * and "Download travel.js" exports the updated data file to commit to the repository.
 */
(function () {
  'use strict';
  var RJY = window.RJY, SITE = window.SITE, h = RJY.h, has = RJY.has;
  var STORE = 'rjy-travel-edits-v1';
  var WORLD_COUNT = 195;  // UN members + observer states
  var STATUS_TEXT = { home: 'Home', visited: 'Visited', current: 'Currently exploring', wishlist: 'On my wishlist', none: 'Undiscovered' };
  var STATUS_DOT = { home: '#f2c14e', visited: '#f2c14e', current: '#5fb3b8', wishlist: '#8e9ccb', none: '#3a4680' };
  var LIT = { home: 1, visited: 1, current: 1 };

  var G, world, features = [], byCode = {}, paths = {}, svgEl, gZoom, zoom, projection, pathGen, root, mapEl, tip, selected = null;
  var started = false, ready = false, pendingOpen = null;

  /* ---------- data (with local edits in draft mode) ---------- */
  function edits() { if (!RJY.draft) return {}; try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; } }
  function saveEdits(e) { try { localStorage.setItem(STORE, JSON.stringify(e)); return true; } catch (err) { return false; } }
  function countries() {
    var list = (SITE.travel.countries || []).map(function (c) { return Object.assign({}, c); });
    var e = edits();
    Object.keys(e).forEach(function (code) {
      var c = list.filter(function (x) { return x.code === code; })[0];
      if (e[code] === 'none') { list = list.filter(function (x) { return x.code !== code; }); return; }
      if (c) c.status = e[code]; else list.push({ code: code, status: e[code], cities: [], years: [], photos: [], related: [] });
    });
    return list;
  }
  function statusOf(code) { var c = countries().filter(function (x) { return x.code === code; })[0]; return c ? c.status : 'none'; }
  function dataFor(code) { return countries().filter(function (x) { return x.code === code; })[0] || null; }

  /* ---------- lazy loading ---------- */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var el = document.createElement('script'); el.src = src; el.async = true;
      el.onload = res; el.onerror = function () { rej(new Error('Could not load ' + src)); };
      document.head.appendChild(el);
    });
  }

  RJY.renderAtlas = function (container) {
    root = container;
    mapEl = root.querySelector('.map');
    RJY.route.on('world', function (code) {
      RJY.scrollTo(document.getElementById('world'), { offset: 40 });
      if (ready) openCountry(code.toUpperCase(), true); else { pendingOpen = code.toUpperCase(); start(); }
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '120% 0px' });
      io.observe(root);
    } else start();
  };

  function start() {
    if (started) return; started = true;
    var p = window.RJYGeo ? Promise.resolve() : loadScript('assets/vendor/geo.bundle.min.js');
    p.then(function () { return window.RJY_WORLD ? null : loadScript('data/world.js'); })
      .then(build)
      .catch(function (err) {
        console.error(err);
        mapEl.innerHTML = '';
        mapEl.appendChild(h('div', { class: 'map__loading', text: 'The map could not load. Refresh the page to try again.' }));
      });
  }

  /* ---------- build ---------- */
  function build() {
    G = window.RJYGeo; world = window.RJY_WORLD;
    var fc = G.feature(world, world.objects.countries);
    features = fc.features.filter(function (f) { return f.id !== 'ATA'; });
    features.forEach(function (f) { byCode[f.id] = f; });

    // bar: legend + search
    var bar = h('div', { class: 'atlas__bar' },
      h('ul', { class: 'legend', 'aria-label': 'Legend' },
        h('li', null, h('i', { class: 'l-visited' }), 'Visited'),
        h('li', null, h('i', { class: 'l-current' }), 'Currently exploring'),
        h('li', null, h('i', { class: 'l-wish' }), 'Want to visit'),
        h('li', null, h('i', { class: 'l-none' }), 'Undiscovered')),
      searchBox());
    root.insertBefore(bar, mapEl);

    mapEl.innerHTML = '';
    var NS = 'http://www.w3.org/2000/svg';
    svgEl = RJY.s('svg', { role: 'img', 'aria-label': 'World map. Use the country search or the list below the map to open a country.' });
    svgEl.innerHTML = '<defs>' +
      '<filter id="glowGold" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="glowTeal" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>';
    gZoom = document.createElementNS(NS, 'g');
    svgEl.appendChild(gZoom);
    mapEl.appendChild(svgEl);
    var dust = h('canvas', { class: 'map__dust', 'aria-hidden': 'true' });
    mapEl.appendChild(dust);
    tip = h('div', { class: 'map__tip', role: 'presentation' });
    mapEl.appendChild(tip);
    mapEl.appendChild(h('div', { class: 'map__controls' },
      h('button', { type: 'button', 'aria-label': 'Zoom in', onclick: function () { zoomBy(1.6); }, text: '+' }),
      h('button', { type: 'button', 'aria-label': 'Zoom out', onclick: function () { zoomBy(1 / 1.6); }, text: '−' }),
      h('button', { type: 'button', 'aria-label': 'Reset map', onclick: resetZoom, html: '<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.2" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="1.4" fill="currentColor"/></svg>' })));

    draw();
    setupZoom();
    below();
    startDust(dust);
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { draw(true); }, 220); });
    ready = true;
    if (pendingOpen) { var c = pendingOpen; pendingOpen = null; openCountry(c, true); }
  }

  function draw(isResize) {
    var w = mapEl.clientWidth || 1000, hgt = mapEl.clientHeight || 520;
    var VW = 1000, VH = Math.round(1000 * hgt / w);
    svgEl.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
    // wide frames show the whole globe; narrow (phone) frames zoom to the land so it stays tappable
    var wholeGlobe = VW / VH >= 1.7;
    projection = G.geoNaturalEarth1().fitExtent([[12, 12], [VW - 12, VH - 12]], wholeGlobe ? { type: 'Sphere' } : { type: 'FeatureCollection', features: features });
    pathGen = G.geoPath(projection);
    gZoom.innerHTML = '';
    var NS = 'http://www.w3.org/2000/svg';
    var sphere = document.createElementNS(NS, 'path'); sphere.setAttribute('class', 'sphere'); sphere.setAttribute('d', pathGen({ type: 'Sphere' }));
    var grat = document.createElementNS(NS, 'path'); grat.setAttribute('class', 'graticule'); grat.setAttribute('d', pathGen(G.geoGraticule10()));
    gZoom.appendChild(grat); if (wholeGlobe) gZoom.appendChild(sphere);
    var frag = document.createDocumentFragment();
    features.forEach(function (f) {
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', pathGen(f) || '');
      p.setAttribute('data-code', f.id);
      p.setAttribute('class', 'country');
      if (!isResize && !RJY.reducedMotion) {
        var c = projection(G.geoCentroid(f)) || [0, 0];
        p.style.opacity = '0';
        p.style.transitionDelay = (150 + (c[0] / VW) * 900 + Math.random() * 200).toFixed(0) + 'ms';
      }
      paths[f.id] = p;
      frag.appendChild(p);
    });
    gZoom.appendChild(frag);
    paint();
    if (!isResize && !RJY.reducedMotion) {
      // the world emerges from the night, west to east
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io.disconnect();
        requestAnimationFrame(function () { Object.keys(paths).forEach(function (k) { paths[k].style.opacity = ''; }); });
        setTimeout(function () { Object.keys(paths).forEach(function (k) { paths[k].style.transitionDelay = ''; }); }, 2000);
      }, { threshold: 0.25 });
      io.observe(mapEl);
    }
    // interactions (delegated)
    if (!svgEl._wired) {
      svgEl._wired = true;
      svgEl.addEventListener('pointermove', function (e) {
        var code = e.target.getAttribute && e.target.getAttribute('data-code');
        if (!code) { tip.style.opacity = 0; return; }
        var r = mapEl.getBoundingClientRect(), st = statusOf(code);
        tip.innerHTML = '<b>' + RJY.esc(nameOf(code)) + '</b><span>' + STATUS_TEXT[st] + '</span>';
        tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px'; tip.style.opacity = 1;
      });
      svgEl.addEventListener('pointerleave', function () { tip.style.opacity = 0; });
      svgEl.addEventListener('click', function (e) {
        var code = e.target.getAttribute && e.target.getAttribute('data-code');
        if (code) { tip.style.opacity = 0; RJY.route.go('#world/' + code); }
      });
    }
    if (selected && paths[selected]) paths[selected].classList.add('is-selected');
  }

  function nameOf(code) { var f = byCode[code]; return RJY.countryName(code, f && f.properties && f.properties.name); }

  function paint(only) {
    var list = countries(), map = {};
    list.forEach(function (c) { map[c.code] = c.status; });
    Object.keys(paths).forEach(function (code) {
      var st = map[code] || 'none', p = paths[code];
      p.setAttribute('class', 'country s-' + (st === 'none' ? 'none' : st) + (code === selected ? ' is-selected' : '') + (only && !only[code] ? ' is-faded' : ''));
      // lit countries are drawn last so their glow sits on top
      if (LIT[st] || st === 'wishlist') p.parentNode.appendChild(p);
    });
  }

  /* ---------- zoom ---------- */
  function setupZoom() {
    zoom = G.zoom().scaleExtent([1, 9])
      .filter(function (ev) {
        if (ev.type === 'wheel') return ev.ctrlKey || ev.metaKey;
        if (ev.type.indexOf('touch') === 0) return ev.touches && ev.touches.length >= 2;
        return !ev.button;
      })
      .on('zoom', function (ev) { gZoom.setAttribute('transform', ev.transform.toString()); });
    G.select(svgEl).call(zoom).on('dblclick.zoom', null);
    var vb = svgEl.viewBox.baseVal;
    zoom.translateExtent([[0, 0], [vb.width, vb.height]]).extent([[0, 0], [vb.width, vb.height]]);
    var hintT;
    mapEl.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) return;
      tip.innerHTML = '<b>' + (navigator.platform.indexOf('Mac') !== -1 ? '⌘' : 'Ctrl') + ' + scroll</b><span>to zoom the map</span>';
      tip.style.left = '50%'; tip.style.top = '54px'; tip.style.opacity = 1;
      clearTimeout(hintT); hintT = setTimeout(function () { tip.style.opacity = 0; }, 1400);
    }, { passive: true });
  }
  function zoomBy(k) { G.select(svgEl).transition().duration(500).call(zoom.scaleBy, k); }
  function resetZoom() { G.select(svgEl).transition().duration(700).call(zoom.transform, G.zoomIdentity); }
  function zoomTo(code) {
    var f = byCode[code]; if (!f) return;
    var b = pathGen.bounds(f), vb = svgEl.viewBox.baseVal;
    // big countries with far-flung territories: focus on the main landmass
    if (code === 'USA') b = [projection([-125, 49.5]), projection([-66, 24.5])];
    if (code === 'FRA') b = [projection([-5, 51.2]), projection([8.3, 42.3])];
    if (code === 'RUS') b = [projection([28, 70]), projection([150, 45])];
    var dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1], cx = (b[0][0] + b[1][0]) / 2, cy = (b[0][1] + b[1][1]) / 2;
    var k = Math.max(1, Math.min(6, 0.42 / Math.max(dx / vb.width, dy / vb.height)));
    var offset = window.innerWidth > 900 ? vb.width * 0.16 / k : 0;   // keep it clear of the side panel
    var t = G.zoomIdentity.translate(vb.width / 2 - offset * k, vb.height / 2).scale(k).translate(-cx, -cy);
    G.select(svgEl).transition().duration(RJY.reducedMotion ? 0 : 900).call(zoom.transform, t);
  }

  /* ---------- search ---------- */
  function searchBox() {
    var names = features.map(function (f) { return { code: f.id, name: nameOf(f.id) }; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    var dl = h('datalist', { id: 'country-names' }, names.map(function (n) { return h('option', { value: n.name }); }));
    var input = h('input', { type: 'search', list: 'country-names', placeholder: 'Find a country', 'aria-label': 'Find a country on the map', autocomplete: 'off' });
    function go() {
      var v = input.value.trim().toLowerCase(); if (!v) return;
      var m = names.filter(function (n) { return n.name.toLowerCase() === v; })[0] || names.filter(function (n) { return n.name.toLowerCase().indexOf(v) === 0; })[0];
      if (m) { RJY.route.go('#world/' + m.code); input.blur(); }
    }
    input.addEventListener('change', go);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    return h('div', { class: 'atlas__search' }, h('span', { html: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' }), input, dl);
  }

  /* ---------- stats, years, milestones ---------- */
  var belowEl;
  function stats() {
    var list = countries(), lit = list.filter(function (c) { return LIT[c.status]; });
    var conts = {}, cities = {}, photos = 0;
    lit.forEach(function (c) {
      var f = byCode[c.code]; if (f && f.properties.cont) conts[f.properties.cont] = 1;
      (c.cities || []).forEach(function (x) { cities[c.code + ':' + x.name] = 1; });
    });
    list.forEach(function (c) { photos += (c.photos || []).length; });
    (SITE.travel.trips || []).forEach(function (t) { photos += (t.photos || []).length; });
    var independent = lit.filter(function (c) { var f = byCode[c.code]; return !f || f.properties.ind; }).length;
    return {
      countries: lit.length, independent: independent, pct: independent / WORLD_COUNT * 100,
      continents: Object.keys(conts).length, cities: Object.keys(cities).length,
      trips: (SITE.travel.trips || []).length, photos: photos,
      wishlist: list.filter(function (c) { return c.status === 'wishlist'; }).length
    };
  }

  function below() {
    belowEl = h('div', { class: 'atlas__below' });
    root.appendChild(belowEl);
    renderBelow();
  }
  function renderBelow() {
    var st = stats();
    belowEl.innerHTML = '';
    var pct = st.pct < 10 ? st.pct.toFixed(1) : Math.round(st.pct);
    var left = h('div', null,
      h('dl', { class: 'stats' },
        stat(st.countries, st.countries === 1 ? 'country' : 'countries'),
        stat(pct + '%', 'of the world’s ' + WORLD_COUNT + ' countries'),
        stat(st.continents, st.continents === 1 ? 'continent' : 'continents'),
        stat(st.cities, st.cities === 1 ? 'city recorded' : 'cities recorded'),
        stat(st.trips, st.trips === 1 ? 'documented trip' : 'documented trips'),
        stat(st.photos, st.photos === 1 ? 'travel photo' : 'travel photos'),
        stat(st.wishlist, 'on the wishlist')),
      h('p', { class: 'atlas__note', text: 'This atlas is still being filled in. For now it holds the countries I’ve lived and worked in.' }),
      h('div', { class: 'atlas__visited' },
        h('p', { class: 'links-head', text: 'Lit so far' }),
        h('div', { class: 'connect' }, countries().filter(function (c) { return c.status !== 'none'; }).map(function (c) {
          return h('a', { href: '#world/' + c.code }, h('i', { style: { background: STATUS_DOT[c.status], boxShadow: '0 0 6px ' + STATUS_DOT[c.status] } }), nameOf(c.code) + ' — ' + STATUS_TEXT[c.status].toLowerCase());
        }))),
      RJY.draft ? draftTools() : null
    );
    var years = yearsWithTravel();
    var yearRow = h('div', { class: 'atlas__years', role: 'group', 'aria-label': 'Travels by year' },
      yearChip('All years', 'all'), years.map(function (y) { return yearChip(String(y), String(y)); }),
      h('button', { class: 'chip replay', type: 'button', onclick: replay, 'aria-label': 'Replay my documented travels in order', html: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor"/></svg>Replay' }));
    var right = h('div', null,
      h('p', { class: 'links-head', text: 'Travels by year' }),
      yearRow,
      h('p', { class: 'atlas__note', id: 'year-caption', 'aria-live': 'polite', text: years.length ? 'Only years I’ve recorded appear here.' : 'No dated trips recorded yet.' }),
      h('p', { class: 'links-head', style: { marginTop: '26px' }, text: 'Milestones' }),
      achievements(st));
    belowEl.appendChild(left); belowEl.appendChild(right);
  }
  function stat(v, label) { return h('div', null, h('dd', { text: String(v) }), h('dt', { text: label })); }

  function yearsWithTravel() {
    var ys = {};
    (SITE.travel.trips || []).forEach(function (t) {
      var a = parseInt(String(t.start).slice(0, 4), 10), b = parseInt(String(t.end || t.start).slice(0, 4), 10);
      for (var y = a; y <= b; y++) if (y) ys[y] = 1;
    });
    countries().forEach(function (c) { (c.years || []).forEach(function (y) { ys[y] = 1; }); });
    return Object.keys(ys).map(Number).sort();
  }
  function countriesIn(year) {
    var set = {};
    (SITE.travel.trips || []).forEach(function (t) {
      var a = parseInt(String(t.start).slice(0, 4), 10), b = parseInt(String(t.end || t.start).slice(0, 4), 10);
      if (year >= a && year <= b) set[t.country] = 1;
    });
    countries().forEach(function (c) { if ((c.years || []).indexOf(year) !== -1) set[c.code] = 1; });
    return set;
  }
  function yearChip(label, value) {
    var b = h('button', { class: 'chip', type: 'button', 'aria-pressed': String(value === 'all'), 'data-year': value, text: label });
    b.addEventListener('click', function () {
      belowEl.querySelectorAll('[data-year]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var cap = document.getElementById('year-caption');
      if (value === 'all') { paint(); cap.textContent = 'Only years I’ve recorded appear here.'; return; }
      var set = countriesIn(+value);
      paint(set);
      var trips = (SITE.travel.trips || []).filter(function (t) { return +String(t.start).slice(0, 4) <= +value && +String(t.end || t.start).slice(0, 4) >= +value; });
      cap.textContent = value + ': ' + (trips.length ? trips.map(function (t) { return t.title + ' (' + nameOf(t.country) + ')'; }).join('; ') : Object.keys(set).map(nameOf).join(', ') || 'nothing recorded');
    });
    return b;
  }

  // Light the documented countries one by one: home first, then by first recorded year.
  var replaying = false;
  function replay() {
    if (replaying) return; replaying = true;
    var list = countries().filter(function (c) { return LIT[c.status]; });
    var firstYear = function (c) {
      var ys = (c.years || []).slice();
      (SITE.travel.trips || []).forEach(function (t) { if (t.country === c.code) ys.push(parseInt(String(t.start).slice(0, 4), 10)); });
      return ys.length ? Math.min.apply(null, ys) : null;
    };
    list.sort(function (a, b) {
      if (a.status === 'home') return -1; if (b.status === 'home') return 1;
      var ya = firstYear(a), yb = firstYear(b);
      if (ya == null && yb == null) return 0; if (ya == null) return -1; if (yb == null) return 1; return ya - yb;
    });
    var cap = document.getElementById('year-caption');
    Object.keys(paths).forEach(function (k) { if (LIT[statusOf(k)]) paths[k].classList.add('is-replay-off'); });
    var i = 0;
    (function nextStep() {
      if (i >= list.length) { replaying = false; cap.textContent = 'Replay finished — ' + list.length + ' countries so far.'; return; }
      var c = list[i++], y = firstYear(c), p = paths[c.code];
      if (p) p.classList.remove('is-replay-off');
      cap.textContent = nameOf(c.code) + (c.status === 'home' ? ' — home' : y ? ' — first recorded ' + y : ' — date not recorded');
      setTimeout(nextStep, RJY.reducedMotion ? 400 : 1300);
    })();
  }

  function achievements(st) {
    var defs = [
      { n: 1, label: 'First country', ok: st.countries >= 1, pts: 1 },
      { n: 2, label: 'Two continents', ok: st.continents >= 2, pts: 2 },
      { n: 3, label: 'Three continents', ok: st.continents >= 3, pts: 3 },
      { n: 5, label: 'Five countries', ok: st.countries >= 5, pts: 5 },
      { n: 10, label: 'Ten countries', ok: st.countries >= 10, pts: 6 },
      { n: 6, label: 'Every inhabited continent', ok: st.continents >= 6, pts: 7 }
    ];
    return h('ul', { class: 'achievements' }, defs.map(function (d) {
      var pts = glyph(d.pts);
      var svg = '<svg viewBox="0 0 34 34" aria-hidden="true">';
      for (var i = 1; i < pts.length; i++) svg += '<line x1="' + pts[i - 1][0] + '" y1="' + pts[i - 1][1] + '" x2="' + pts[i][0] + '" y2="' + pts[i][1] + '"/>';
      pts.forEach(function (p, i) { svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === 0 ? 2.2 : 1.6) + '"/>'; });
      svg += '</svg>';
      return h('li', { class: 'ach' + (d.ok ? ' is-earned' : '') }, h('span', { html: svg }),
        h('span', null, d.label, h('small', { text: d.ok ? 'Reached' : 'Still ahead' })));
    }));
  }
  function glyph(n) {
    var shapes = { 1: [[17, 17]], 2: [[9, 22], [25, 12]], 3: [[6, 24], [17, 10], [28, 22]], 5: [[5, 20], [12, 9], [20, 15], [27, 6], [29, 25]], 6: [[4, 14], [11, 24], [17, 12], [23, 22], [29, 9], [30, 28]], 7: [[4, 26], [8, 12], [15, 18], [18, 5], [24, 14], [30, 8], [28, 28]] };
    return shapes[n] || shapes[1];
  }

  /* ---------- country panel ---------- */
  function relatedFor(code, c) {
    var refs = (c && c.related) ? c.related.slice() : [];
    (SITE.journey || []).forEach(function (j) { if (j.country === code && refs.indexOf('j:' + j.id) === -1) refs.push('j:' + j.id); });
    (SITE.work || []).forEach(function (w) { if ((w.related || []).indexOf('c:' + code) !== -1 && refs.indexOf('w:' + w.id) === -1) refs.push('w:' + w.id); });
    return refs;
  }

  function openCountry(code, zoomIn) {
    if (!byCode[code]) return;
    if (selected && paths[selected]) paths[selected].classList.remove('is-selected');
    selected = code;
    if (paths[code]) paths[code].classList.add('is-selected');
    var c = dataFor(code), st = c ? c.status : 'none';
    if (zoomIn && (LIT[st] || st === 'wishlist' || zoomIn === 'force')) zoomTo(code);
    RJY.sheet.open({
      kind: 'drawer',
      label: nameOf(code),
      onClose: function (why) {
        if (selected && paths[selected]) paths[selected].classList.remove('is-selected');
        selected = null;
        if (why === 'closed') resetZoom();   // back to the whole world
      },
      render: function (body) { body.appendChild(countryView(code, c, st)); }
    });
  }

  function countryView(code, c, st) {
    var flag = RJY.flagSrc(code);
    var el = h('div', { class: 'cp' },
      flag ? h('img', { class: 'cp__flag', src: flag, alt: 'Flag of ' + nameOf(code), width: 56, height: 42 }) : null,
      h('p', { class: 'cp__status' }, h('i', { style: { background: STATUS_DOT[st], boxShadow: '0 0 8px ' + STATUS_DOT[st] } }), STATUS_TEXT[st]),
      h('h2', { class: 'cp__name', text: nameOf(code) }));
    if (LIT[st]) {
      if (has(c.headline)) el.appendChild(h('p', { class: 'cp__head', text: c.headline }));
      if (has(c.years)) { el.appendChild(h('h3', { text: 'When' })); el.appendChild(h('p', { text: c.years.join(', ') })); }
      if (has(c.cities)) {
        el.appendChild(h('h3', { text: 'Places' }));
        el.appendChild(h('ul', { class: 'cp__cities' }, c.cities.map(function (x) { return h('li', null, h('b', { text: x.name }), has(x.note) ? h('span', { text: x.note }) : null); })));
      }
      var trips = (SITE.travel.trips || []).filter(function (t) { return t.country === code; });
      if (trips.length) {
        el.appendChild(h('h3', { text: trips.length === 1 ? 'Trip' : 'Trips' }));
        trips.sort(function (a, b) { return a.start < b.start ? -1 : 1; }).forEach(function (t) {
          el.appendChild(h('div', { class: 'cp__trip' }, h('b', { text: t.title }), h('span', { text: RJY.monthYear(t.start) + (t.end && t.end !== t.start ? ' – ' + RJY.monthYear(t.end) : '') }),
            has(t.story) ? h('p', { text: t.story }) : null, has(t.photos) ? gallery(t.photos) : null));
        });
      }
      section(el, 'My story', c.story, function (v) { return h('p', { text: v }); }, 'your story from ' + nameOf(code) + ' — travel.js → story');
      section(el, 'Highlights', c.highlights, function (v) { return h('ul', { class: 'jd__list' }, v.map(function (x) { return h('li', null, has(x.kind) ? h('b', { text: x.kind + ': ' }) : null, x.text); })); }, 'food, culture, architecture, nature… — highlights');
      section(el, 'What I learned', c.learned, function (v) { return h('p', { text: v }); }, 'what you took away — learned');
      section(el, 'Travelled with', c.companions, function (v) { return h('p', { text: v }); }, null);
      section(el, 'Photos', c.photos, gallery, 'photos — put files in assets/img/travel/ and list them in photos');
      if (has(c.videos)) { el.appendChild(h('h3', { text: 'Clips' })); c.videos.forEach(function (v) { el.appendChild(h('video', { src: v.src, poster: v.poster || null, controls: true, preload: 'none', playsinline: true, style: { width: '100%', borderRadius: '2px', marginBottom: '8px' } })); }); }
      var conn = RJY.connections(relatedFor(code, c), 'What happened here'); if (conn) el.appendChild(conn);
    } else if (st === 'wishlist') {
      el.appendChild(h('p', { class: 'cp__head', text: 'A destination still ahead.' }));
      section(el, 'Why I want to go', c.reasons, function (v) { return h('p', { text: v }); }, 'your reasons — reasons');
      section(el, 'Places I hope to see', c.places, function (v) { return h('ul', { class: 'jd__list' }, v.map(function (x) { return h('li', { text: x }); })); }, 'places — places');
      section(el, 'What I want to do', c.activities, function (v) { return h('ul', { class: 'jd__list' }, v.map(function (x) { return h('li', { text: x }); })); }, 'activities — activities');
      section(el, 'Notes', c.notes, function (v) { return h('p', { text: v }); }, null);
    } else {
      el.appendChild(h('p', { class: 'cp__head', text: 'Not explored yet.' }));
      el.appendChild(h('p', { class: 'cp__empty', text: 'This one is still waiting to be discovered. If you know a place here I shouldn’t miss, tell me.' }));
      el.appendChild(h('div', { class: 'btn-row' }, h('a', { class: 'btn btn--ghost', href: SITE.links.linkedin, target: '_blank', rel: 'noopener', text: 'Suggest it on LinkedIn' })));
    }
    if (RJY.draft) el.appendChild(editor(code, st));
    return el;
  }

  function section(el, title, val, render, hint) {
    if (has(val)) { el.appendChild(h('h3', { text: title })); el.appendChild(render(val)); }
    else if (hint) { var p = RJY.ph(hint); if (p) { el.appendChild(h('h3', { text: title })); el.appendChild(p); } }
  }
  function gallery(list) {
    return h('div', { class: 'cp__gallery' }, list.map(function (p) {
      return h('button', { type: 'button', 'aria-label': 'Open photo: ' + (p.caption || p.alt || ''), onclick: function () { RJY.lightbox(p); } }, h('img', { src: p.src, alt: p.alt || '', loading: 'lazy' }));
    }));
  }

  /* ---------- draft-mode editor ---------- */
  function editor(code, st) {
    var opts = [['visited', 'Visited'], ['current', 'Currently here'], ['wishlist', 'Wishlist'], ['home', 'Home'], ['none', 'Undiscovered']];
    return h('div', { class: 'cp__edit' },
      h('h3', { text: 'Edit (this browser only)' }),
      h('div', { class: 'btn-row' }, opts.map(function (o) {
        return h('button', { class: 'btn' + (o[0] === st ? '' : ' btn--ghost'), type: 'button', 'aria-pressed': String(o[0] === st), onclick: function () {
          var e = edits(); e[code] = o[0];
          var inFile = (SITE.travel.countries || []).filter(function (x) { return x.code === code; })[0];
          if ((inFile ? inFile.status : 'none') === o[0]) delete e[code];
          saveEdits(e); paint(); renderBelow(); openCountry(code, false);
        } }, o[1]);
      })),
      h('p', { text: 'Saved only in this browser. Use “Download travel.js” below the map and replace data/travel.js in your repository to publish it.' }));
  }

  function draftTools() {
    var e = edits(), n = Object.keys(e).length;
    return h('div', { class: 'cp__edit' },
      h('p', { text: n ? n + ' local change' + (n === 1 ? '' : 's') + ' not yet published.' : 'No local changes. Open a country and use the edit buttons.' }),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', type: 'button', onclick: exportFile, disabled: n ? null : true }, 'Download travel.js'),
        h('button', { class: 'btn btn--ghost', type: 'button', disabled: n ? null : true, onclick: function () { if (confirm('Discard all local atlas changes in this browser?')) { saveEdits({}); paint(); renderBelow(); } } }, 'Discard local changes')));
  }

  function exportFile() {
    var data = { countries: countries(), trips: SITE.travel.trips || [] };
    var head = '/*\n * data/travel.js — exported from the atlas editor on ' + new Date().toISOString().slice(0, 10) + '.\n * Replace data/travel.js in your repository with this file to publish the changes.\n * Field guide: see README.md → "Updating the atlas".\n */\nwindow.SITE = window.SITE || {};\n\nSITE.travel = ';
    var blob = new Blob([head + JSON.stringify(data, null, 2) + ';\n'], { type: 'text/javascript' });
    var a = h('a', { href: URL.createObjectURL(blob), download: 'travel.js' });
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- star dust over the map ---------- */
  function startDust(cv) {
    if (RJY.reducedMotion) return;
    var ctx = cv.getContext('2d'), pts = [], vis = false, raf = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { cv.width = mapEl.clientWidth * dpr; cv.height = mapEl.clientHeight * dpr; }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < 70; i++) pts.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.3, p: Math.random() * 6.28, s: 0.4 + Math.random() * 0.9 });
    function frame(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      pts.forEach(function (q) {
        var a = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t / 1000 * q.s + q.p));
        ctx.fillStyle = 'rgba(255, 236, 190,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(q.x * cv.width, q.y * cv.height, q.r * dpr, 0, 6.283); ctx.fill();
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; cancelAnimationFrame(raf); if (vis) raf = requestAnimationFrame(frame); }).observe(mapEl);
  }

  RJY.atlas = { open: function (code) { RJY.route.go('#world/' + code); } };
})();
