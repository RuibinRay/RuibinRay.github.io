/*
 * ui.js — small shared helpers: element builder, draft placeholders, cross-links between
 * stars (journey ↔ projects ↔ countries ↔ skills), the sheet (side drawer / chapter overlay),
 * the lightbox and hash routing.
 */
(function () {
  'use strict';
  var RJY = window.RJY = window.RJY || {};
  var SITE = window.SITE || {};

  /* ---------- environment ---------- */
  var params = new URLSearchParams(location.search);
  RJY.draft = params.has('draft');
  RJY.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  RJY.finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- element builder ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null) continue;
      if (k === 'text') el.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  RJY.h = h; RJY.s = s;

  RJY.has = function (v) { return Array.isArray(v) ? v.length > 0 : (v != null && String(v).trim() !== ''); };
  // Placeholder shown only in draft mode (?draft)
  RJY.ph = function (text) { return RJY.draft ? h('p', { class: 'ph', text: text }) : null; };

  RJY.starIcon = function (cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5l1.6 7.3 7.4 1.6-7.4 1.6L12 19.5l-1.6-7.5L3 10.4l7.4-1.6z"/></svg>';
  };
  RJY.brushRule = function () {
    return '<svg class="brush-rule" viewBox="0 0 360 10" preserveAspectRatio="none" aria-hidden="true"><path d="M2 6.5C40 3 78 7.6 120 5.2S205 2.6 246 5.4 318 7.4 358 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
  };

  /* ---------- countries ---------- */
  var A3A2 = 'ABWAWAFGAFAGOAOAIAAIALAAXALBALANDADAREAEARGARARMAMASMASATAAQATFTFATGAGAUSAUAUTATAZEAZBDIBIBELBEBENBJBFABFBGDBDBGRBGBHRBHBHSBSBIHBABLMBLBLRBYBLZBZBMUBMBOLBOBRABRBRBBBBRNBNBTNBTBWABWCAFCFCANCACHECHCHLCLCHNCNCIVCICMRCMCODCDCOGCGCOKCKCOLCOCOMKMCPVCVCRICRCUBCUCUWCWCYMKYCYPCYCZECZDEUDEDJIDJDMADMDNKDKDOMDODZADZECUECEGYEGERIERESHEHESPESESTEEETHETFINFIFJIFJFLKFKFRAFRFROFOFSMFMGABGAGBRGBGEOGEGGYGGGHAGHGINGNGMBGMGNBGWGNQGQGRCGRGRDGDGRLGLGTMGTGUMGUGUYGYHKGHKHMDHMHNDHNHRVHRHTIHTHUNHUIDNIDIMNIMINDINIOTIOIRLIEIRNIRIRQIQISLISISRILITAITJAMJMJEYJEJORJOJPNJPKAZKZKENKEKGZKGKHMKHKIRKIKNAKNKORKRKWTKWLAOLALBNLBLBRLRLBYLYLCALCLIELILKALKLSOLSLTULTLUXLULVALVMACMOMAFMFMARMAMCOMCMDAMDMDGMGMDVMVMEXMXMHLMHMKDMKMLIMLMLTMTMMRMMMNEMEMNGMNMNPMPMOZMZMRTMRMSRMSMUSMUMWIMWMYSMYNAMNANCLNCNERNENFKNFNGANGNICNINIUNUNLDNLNORNONPLNPNRUNRNZLNZOMNOMPAKPKPANPAPCNPNPERPEPHLPHPLWPWPNGPGPOLPLPRIPRPRKKPPRTPTPRYPYPSEPSPYFPFQATQAROURORUSRURWARWSAUSASDNSDSENSNSGPSGSGSGSSHNSHSLBSBSLESLSLVSVSMRSMSOMSOSPMPMSRBRSSSDSSSTPSTSURSRSVKSKSVNSISWESESWZSZSXMSXSYCSCSYRSYTCATCTCDTDTGOTGTHATHTJKTJTKMTMTLSTLTONTOTTOTTTUNTNTURTRTWNTWTZATZUGAUGUKRUAURYUYUSAUSUZBUZVATVAVCTVCVENVEVGBVGVIRVIVNMVNVUTVUWLFWFWSMWSXKXXKYEMYEZAFZAZMBZMZWEZW';
  var a3toA2 = {};
  for (var i = 0; i < A3A2.length; i += 5) a3toA2[A3A2.substr(i, 3)] = A3A2.substr(i + 3, 2);
  var regionNames = null;
  try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) { regionNames = null; }
  var NAME_FIX = { USA: 'United States', GBR: 'United Kingdom', KOR: 'South Korea', PRK: 'North Korea', RUS: 'Russia', CZE: 'Czechia' };
  RJY.countryA2 = function (a3) { return a3toA2[a3] || ''; };
  RJY.countryName = function (a3, fallback) {
    if (NAME_FIX[a3]) return NAME_FIX[a3];
    var a2 = a3toA2[a3];
    if (a2 && regionNames) { try { var n = regionNames.of(a2); if (n && n !== a2) return n; } catch (e) {} }
    return fallback || a3;
  };
  RJY.flagSrc = function (a3) { var a2 = a3toA2[a3]; return a2 ? 'assets/flags/' + a2.toLowerCase() + '.svg' : ''; };

  /* ---------- cross-links ("connected stars") ---------- */
  function find(list, id) { for (var i = 0; i < (list || []).length; i++) if (list[i].id === id) return list[i]; return null; }
  RJY.findJourney = function (id) { return find(SITE.journey, id); };
  RJY.findWork = function (id) { return find(SITE.work, id); };
  RJY.findSkill = function (id) { return find(SITE.palette, id); };
  RJY.findCountry = function (code) {
    var c = (SITE.travel && SITE.travel.countries) || [];
    for (var i = 0; i < c.length; i++) if (c[i].code === code) return c[i];
    return null;
  };

  RJY.resolve = function (ref) {
    var p = String(ref).split(':'), t = p[0], id = p.slice(1).join(':'), item;
    if (t === 'j' && (item = RJY.findJourney(id))) return { type: 'j', id: id, label: item.short || item.title, title: item.title, href: '#experience/' + id };
    if (t === 'w' && (item = RJY.findWork(id))) return { type: 'w', id: id, label: item.short || item.title, title: item.title, href: '#projects/' + id };
    if (t === 's' && (item = RJY.findSkill(id))) return { type: 's', id: id, label: item.name, href: '#skills/' + id };
    if (t === 'c') return { type: 'c', id: id, label: RJY.countryName(id), href: '#world/' + id };
    return null;
  };

  // Build a row of connected-star links. Navigation happens through the hash router.
  RJY.connections = function (refs, title) {
    var items = (refs || []).map(RJY.resolve).filter(Boolean);
    if (!items.length) return null;
    return h('div', { class: 'connected' },
      h('p', { class: 'links-head', text: title || 'Connected stars' }),
      h('div', { class: 'connect' }, items.map(function (r) {
        return h('a', { href: r.href, title: r.title || null }, h('i', { class: 't-' + r.type }), r.label);
      }))
    );
  };

  /* ---------- scroll lock ---------- */
  var lockCount = 0;
  RJY.lockScroll = function (on) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.documentElement.classList.toggle('is-locked', lockCount > 0);
  };

  /* ---------- sheet: country drawer or full chapter ---------- */
  var sheet = null, lastFocus = null, onCloseCb = null;
  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'), function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }
  RJY.sheet = {
    open: function (opts) {
      sheet = sheet || document.getElementById('sheet');
      var panel = sheet.querySelector('.sheet__panel'), body = sheet.querySelector('.sheet__body');
      var wasOpen = sheet.classList.contains('is-open');
      if (wasOpen && onCloseCb) { var cb = onCloseCb; onCloseCb = null; cb('replaced'); }
      body.innerHTML = '';
      opts.render(body);
      sheet.classList.toggle('sheet--chapter', opts.kind === 'chapter');
      var title = body.querySelector('h2, h1');
      if (title) { title.id = 'sheet-title'; }
      panel.setAttribute('aria-label', opts.label || (title ? title.textContent : 'Details'));
      if (!wasOpen) { lastFocus = document.activeElement; RJY.lockScroll(true); }
      sheet.inert = false; sheet.removeAttribute('inert');
      sheet.classList.add('is-open');
      panel.scrollTop = 0;
      onCloseCb = opts.onClose || null;
      setTimeout(function () { panel.focus({ preventScroll: true }); }, 30);
    },
    close: function (silent) {
      if (!sheet || !sheet.classList.contains('is-open')) return;
      sheet.classList.remove('is-open');
      sheet.inert = true; sheet.setAttribute('inert', '');
      RJY.lockScroll(false);
      var cb = onCloseCb; onCloseCb = null;
      if (cb) cb('closed');
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
    },
    isOpen: function () { return !!(sheet && sheet.classList.contains('is-open')); }
  };
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#sheet [data-close]')) { e.preventDefault(); RJY.route.closeDetail(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!RJY.sheet.isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); RJY.route.closeDetail(); return; }
    if (e.key === 'Tab') {
      var panel = sheet.querySelector('.sheet__panel'), f = focusables(panel);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- lightbox ---------- */
  RJY.lightbox = function (photo) {
    var lb = document.getElementById('lightbox');
    lb.innerHTML = '';
    var close = function () { lb.hidden = true; document.removeEventListener('keydown', onKey); if (prev) prev.focus(); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    var prev = document.activeElement;
    lb.appendChild(h('figure', null,
      h('img', { src: photo.src, alt: photo.alt || '' }),
      h('figcaption', null,
        [photo.caption, photo.place, photo.date ? RJY.monthYear(photo.date) : ''].filter(RJY.has).join(' — '),
        RJY.has(photo.story) ? h('p', { text: photo.story }) : null)
    ));
    var btn = h('button', { class: 'sheet__close', type: 'button', 'aria-label': 'Close photo', onclick: close, html: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>' });
    lb.appendChild(btn);
    lb.onclick = function (e) { if (e.target === lb) close(); };
    lb.hidden = false;
    document.addEventListener('keydown', onKey);
    btn.focus();
  };

  /* ---------- hash routing for detail views ---------- */
  // #projects/<id> opens a case study, #world/<CODE> a country, #experience/<id> a journey entry,
  // #skills/<id> highlights a palette colour. Plain section hashes just scroll.
  var handlers = {};
  var pushed = 0;      // detail views we added to the history stack
  RJY.route = {
    on: function (section, fn) { handlers[section] = fn; },
    parse: function (hash) {
      var m = /^#([a-z]+)\/(.+)$/.exec(hash || '');
      return m ? { section: m[1], id: decodeURIComponent(m[2]) } : null;
    },
    go: function (hash) {
      if (location.hash === hash) { RJY.route.handle(); return; }
      var from = RJY.route.parse(location.hash);
      // moving from one detail to another replaces the entry, so Back returns to the page
      if (from && RJY.sheet.isOpen()) history.replaceState({ rjy: 1 }, '', hash);
      else { history.pushState({ rjy: 1 }, '', hash); pushed++; }
      RJY.route.handle();
    },
    handle: function () {
      var r = RJY.route.parse(location.hash);
      if (!r) { if (RJY.sheet.isOpen()) RJY.sheet.close(true); return; }
      var fn = handlers[r.section];
      if (fn) fn(r.id);
    },
    // Close the current detail view and step the address back to its section.
    closeDetail: function () {
      var r = RJY.route.parse(location.hash);
      if (r && pushed > 0) { history.back(); return; }   // popstate closes the sheet
      RJY.sheet.close(true);
      if (r) history.replaceState(null, '', '#' + r.section);
    }
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var href = a.getAttribute('href');
    if (RJY.route.parse(href)) { e.preventDefault(); RJY.route.go(href); }
  });
  window.addEventListener('popstate', function () {
    if (!RJY.route.parse(location.hash) && pushed > 0) pushed--;
    RJY.route.handle();
  });

  /* ---------- smooth scroll that respects reduced motion ---------- */
  RJY.scrollTo = function (el, opts) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - (opts && opts.offset != null ? opts.offset : 64);
    window.scrollTo({ top: Math.max(0, top), behavior: RJY.reducedMotion || (opts && opts.instant) ? 'auto' : 'smooth' });
  };

  /* ---------- formatting ---------- */
  RJY.monthYear = function (ym) {
    if (!ym) return '';
    var p = String(ym).split('-');
    if (p.length < 2) return p[0];
    var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(p[1], 10) - 1];
    return m + ' ' + p[0];
  };
  RJY.esc = function (str) { return String(str).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
})();
