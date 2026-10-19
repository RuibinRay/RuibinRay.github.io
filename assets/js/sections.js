/*
 * sections.js — About, education, palette (skills), languages, credentials, contact, footer.
 * All text comes from /data/*.js.
 */
(function () {
  'use strict';
  var RJY = window.RJY, SITE = window.SITE, h = RJY.h, has = RJY.has;

  /* ---------------- About ---------------- */
  RJY.renderAbout = function (root) {
    var A = SITE.about, P = SITE.profile;
    var blocks = A.blocks.map(function (b) {
      if (!has(b.text)) return RJY.draft ? h('div', { class: 'about__block' }, h('h3', { text: b.title }), RJY.ph('your answer — data/site.js → about.blocks')) : null;
      return h('div', { class: 'about__block reveal' }, h('h3', { text: b.title }), h('p', { text: b.text }));
    });
    var langs = P.languages.map(function (l) {
      return l.native === '中文' ? h('span', null, 'Mandarin ', h('span', { class: 'zh', lang: 'zh', text: '中文' })) : h('span', { text: l.name });
    });
    var langLine = h('dd');
    langs.forEach(function (n, i) { if (i) langLine.appendChild(document.createTextNode(i === langs.length - 1 ? ' and ' : ', ')); langLine.appendChild(n); });
    var coords = h('dl', { class: 'coords reveal' },
      h('div', null, h('dt', { text: 'Born in' }), h('dd', { text: P.bornIn })),
      h('div', null, h('dt', { text: 'Roots in' }), h('dd', { text: P.roots })),
      h('div', null, h('dt', { text: 'Based in' }), h('dd', { text: P.basedIn })),
      h('div', null, h('dt', { text: 'Speaks' }), langLine),
      h('div', null, h('dt', { text: 'Graduating' }), h('dd', { text: P.graduation })),
      h('div', null, h('dt', { text: 'Focus' }), h('dd', { text: P.focus + '. ' + P.relocation }))
    );
    var photo = has(A.photo && A.photo.src)
      ? h('figure', { class: 'about__photo reveal' }, h('img', { src: A.photo.src, alt: A.photo.alt || 'Portrait of Ray', loading: 'lazy' }))
      : RJY.ph('a portrait or travel photo — about.photo in data/site.js');
    root.appendChild(h('div', { class: 'about__main' },
      h('p', { class: 'about__lead reveal', text: A.lead }),
      h('div', { class: 'about__blocks' }, blocks)
    ));
    root.appendChild(h('div', { class: 'about__side', role: 'group', 'aria-label': 'At a glance' }, photo, coords));
  };

  RJY.renderEducation = function (root) {
    SITE.education.forEach(function (e) {
      root.appendChild(h('div', { class: 'edu__item' },
        h('p', { class: 'edu__when', text: e.when }),
        h('h3', { text: e.school }),
        h('p', { text: e.degree }),
        h('p', { text: e.place }),
        e.notes.map(function (n) { return h('p', { class: 'gold', text: n }); })
      ));
    });
    var award = SITE.awards[0];
    if (award) {
      root.appendChild(h('div', { class: 'edu__item' },
        h('p', { class: 'edu__when', text: award.year }),
        h('h3', { text: award.title }),
        h('p', { text: award.text }),
        has(award.evidence) ? h('p', null, h('a', { class: 'link', href: award.evidence, target: '_blank', rel: 'noopener', text: 'See the announcement' })) : RJY.ph('link to the certificate or announcement — awards[0].evidence')
      ));
    }
  };

  RJY.renderOffclock = function (root) {
    root.appendChild(h('h3', { text: 'Off the clock' }));
    SITE.about.offTheClock.forEach(function (x) { root.appendChild(h('span', { text: x })); });
  };

  /* ---------------- Palette ---------------- */
  var PIGMENTS = {
    gold: ['#f2c14e', '#ffe29a', '#c98f1e'], ember: ['#e8892b', '#ffc27a', '#a85512'],
    cobalt: ['#2a4ea6', '#6d93d6', '#152f72'], cornflower: ['#4a73b8', '#9bb8e6', '#2b4f8f'],
    periwinkle: ['#8e9ccb', '#c9d1ef', '#5e6aa1'], foam: ['#cfdcef', '#ffffff', '#93a6c9'],
    moon: ['#f3e3a8', '#fff6d6', '#cdb46a'], umber: ['#8a6a4f', '#c9a37f', '#5a4231'], teal: ['#5fb3b8', '#a7e3e5', '#317f86']
  };
  function rand(seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
  // A procedurally painted brushstroke, different for every colour.
  function swatch(pigment, seed) {
    var c = PIGMENTS[pigment] || PIGMENTS.gold, W = 300, top = [], bot = [], n = 24, i;
    for (i = 0; i <= n; i++) {
      var x = 6 + (W - 14) * i / n, t = i / n;
      var taper = Math.min(1, t * 6) * Math.min(1, (1 - t) * 3.2);
      var half = (15 + 5 * Math.sin(t * 3 + seed)) * (0.35 + 0.65 * taper);
      var mid = 27 + 4 * Math.sin(t * 2.4 + seed * 1.7);
      top.push([x, mid - half - rand(seed + i) * 2.2]);
      bot.push([x, mid + half + rand(seed * 3 + i) * 2.2]);
    }
    var d = 'M' + top.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    d += ' L' + bot.reverse().map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z';
    var bristles = '';
    for (i = 0; i < 9; i++) {
      var y = 15 + i * 3.1 + rand(seed + i * 7) * 2, x0 = 8 + rand(seed + i) * 40, x1 = W - 10 - rand(seed + i * 2) * 70;
      var col = i % 3 === 0 ? c[1] : (i % 3 === 1 ? c[2] : c[0]);
      bristles += '<path d="M' + x0.toFixed(1) + ' ' + y.toFixed(1) + ' C' + (x0 + 80).toFixed(1) + ' ' + (y - 2 + rand(seed + i) * 4).toFixed(1) + ' ' + (x1 - 80).toFixed(1) + ' ' + (y + 2 - rand(seed * 2 + i) * 4).toFixed(1) + ' ' + x1.toFixed(1) + ' ' + (y + rand(seed + i * 5) * 2 - 1).toFixed(1) + '" stroke="' + col + '" stroke-width="' + (0.7 + rand(seed + i * 11) * 1.4).toFixed(2) + '" fill="none" opacity="' + (0.35 + rand(seed + i * 13) * 0.4).toFixed(2) + '" stroke-linecap="round"/>';
    }
    return '<svg class="pig__swatch" viewBox="0 0 300 54" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" fill="' + c[0] + '" opacity=".92"/>' + bristles + '</svg>';
  }

  RJY.renderPalette = function (root) {
    SITE.palette.forEach(function (g, i) {
      var tools = has(g.tools) ? h('div', { class: 'pig__tools', 'aria-label': 'Tools' }, g.tools.map(function (t) { return h('span', { text: t }); })) : null;
      var el = h('article', { class: 'pig reveal', id: 'skill-' + g.id },
        h('div', { html: swatch(g.pigment, i * 3.7 + 1) }),
        h('h3', { text: g.name }),
        h('p', { text: g.text }),
        tools,
        RJY.connections(g.seenIn, 'Where it shows')
      );
      root.appendChild(el);
    });
  };

  RJY.flashSkill = function (id) {
    var el = document.getElementById('skill-' + id);
    if (!el) return;
    RJY.scrollTo(el, { offset: 120 });
    el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash');
  };

  RJY.renderPaletteAux = function (root) {
    var P = SITE.profile;
    root.appendChild(h('div', { class: 'langs-wrap reveal' },
      h('h3', { text: 'Languages' }),
      h('ul', { class: 'langs' }, P.languages.map(function (l) {
        var zh = l.native === '中文';
        return h('li', null,
          h('span', { class: 'native' + (zh ? ' zh' : ''), lang: zh ? 'zh' : (l.name === 'Spanish' ? 'es' : 'en'), text: l.native }),
          l.native !== l.name ? h('span', { class: 'en', text: l.name }) : h('span'),
          has(l.note) ? h('span', { class: 'note', text: l.note }) : null
        );
      }))
    ));
    root.appendChild(h('div', { class: 'creds reveal' },
      h('h3', { text: 'Certifications' }),
      h('ol', null, SITE.certifications.map(function (c) {
        var t = has(c.url) ? h('a', { class: 'link t', href: c.url, target: '_blank', rel: 'noopener', text: c.title }) : h('span', { class: 't', text: c.title });
        return h('li', null, h('span', { class: 'yr', text: c.year }), h('span', null, t, h('span', { class: 'i', text: c.issuer })));
      })),
      h('div', { class: 'tools-all' }, SITE.tools.map(function (g) { return h('p', { style: { margin: 0 } }, h('b', { text: g.group }), g.items.join(', ')); }))
    ));
  };

  RJY.renderCourses = function (root) {
    root.appendChild(h('h3', { class: 'visually-hidden', text: 'Coursework' }));
    SITE.coursework.forEach(function (g) {
      root.appendChild(h('div', null, h('h4', { text: g.group + ' coursework' }), h('ul', null, g.courses.map(function (c) { return h('li', { text: c }); }))));
    });
  };

  /* ---------------- Contact ---------------- */
  // The page ends where it began: the full painting. Five painted stars are the social links, joined by
  // a gold constellation line (on narrow screens the same constellation is drawn under the text).
  // Email and phone numbers sit with the text.
  function firstSegment(url) {
    try { return decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean)[0] || ''); } catch (e) { return ''; }
  }
  var NETWORKS = [
    // star: the painted star (index in RJY.Painting.LIGHTS) the link lives on, in constellation order
    { key: 'instagram', label: 'Instagram', star: 9, handle: function (u) { var s = firstSegment(u); return s ? '@' + s : ''; } },
    { key: 'x', label: 'X', star: 8, handle: function (u) { var s = firstSegment(u); return s ? '@' + s : ''; } },
    { key: 'facebook', label: 'Facebook', star: 5, handle: function (u) { return firstSegment(u); } },
    { key: 'github', label: 'GitHub', star: 7, handle: function (u) { var s = firstSegment(u); return s ? '@' + s : ''; } },
    { key: 'linkedin', label: 'LinkedIn', star: 10, handle: function () { return SITE.profile.legalName; } }
  ];

  RJY.renderContact = function (root) {
    var L = SITE.links, P = SITE.profile;
    var items = NETWORKS.filter(function (n) { return has(L[n.key]); }).map(function (n) {
      return { key: n.key, label: n.label, star: n.star, href: L[n.key], handle: n.handle(L[n.key]) };
    });
    (L.other || []).forEach(function (o, i) {
      if (has(o.url)) items.push({ key: 'other' + i, label: o.label, star: [6, 4, 0][i], href: o.url, handle: '' });
    });
    function accName(it) { return it.label + (it.handle ? ', ' + it.handle : '') + ' (opens in a new tab)'; }

    // email and phones, beside the words
    var phones = (L.phones || []).filter(function (p) { return has(p.number); });
    var rows = [];
    if (has(L.email)) {
      var copy = navigator.clipboard ? h('button', { class: 'cdetails__copy', type: 'button', text: 'Copy', onclick: function () {
        var b = this;
        navigator.clipboard.writeText(L.email).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); }, function () {});
      } }) : null;
      rows.push(h('div', null, h('dt', { text: 'Email' }), h('dd', null, h('a', { href: 'mailto:' + L.email, text: L.email }), copy)));
    }
    if (phones.length) {
      rows.push(h('div', null, h('dt', { text: 'Phone' }), phones.map(function (p) {
        return h('dd', null, h('a', { href: 'tel:' + p.number.replace(/[^\d+]/g, ''), text: p.number }), has(p.label) ? h('span', { class: 'cdetails__where', text: p.label }) : null);
      })));
    }
    var missingPhones = (L.phones || []).filter(function (p) { return !has(p.number); });

    // the constellation drawn in the page (phones, tablets, or when the painted stars are covered)
    var inline = h('ol', { class: 'cconst', 'aria-label': 'Find me online' }, items.map(function (it, i) {
      return h('li', null, h('a', { href: it.href, target: '_blank', rel: 'noopener', 'aria-label': accName(it), 'data-link': it.key, 'data-star': it.star },
        h('span', { class: 'cconst__star', html: RJY.starIcon() }),
        h('span', { class: 'cconst__name', text: it.label }),
        it.handle ? h('span', { class: 'cconst__handle', text: it.handle }) : null));
    }));
    var inlineSvg = RJY.s('svg', { class: 'cconst__lines', 'aria-hidden': 'true' });
    var inlineWrap = h('div', { class: 'cconst-wrap' }, inlineSvg, inline);

    var words = h('div', { class: 'contact__words' },
      h('p', { class: 'sec__kicker', 'data-kicker': '' }, 'Contact'),
      h('h2', { class: 'contact__title', id: 'contact-title', text: 'Under the Same Sky' }),
      h('p', { class: 'contact__text', text: 'If you work in energy, international markets or finance and think I could help, I’d like to hear from you.' }),
      h('p', { class: 'contact__sub', text: 'Based in ' + P.basedIn + ', ' + P.relocation.charAt(0).toLowerCase() + P.relocation.slice(1, -1) + '. I work in English, Spanish and Mandarin.' }),
      rows.length ? h('dl', { class: 'cdetails' }, rows) : null,
      missingPhones.length ? RJY.ph('your ' + missingPhones.map(function (p) { return p.label; }).join(' and ') + ' phone number — links.phones in data/site.js') : null,
      !has(L.email) ? RJY.ph('your public email — links.email in data/site.js') : null,
      inlineWrap);
    root.appendChild(words);

    // the same links pinned to the painted stars (desktop): fixed over the painting
    var layer = h('div', { class: 'skylinks', role: 'group', 'aria-label': 'Find me online' });
    var svg = RJY.s('svg', { class: 'skylinks__lines', 'aria-hidden': 'true' });
    layer.appendChild(svg);
    var markers = items.map(function (it) {
      var lab = h('span', { class: 'skylink__label' }, h('span', { class: 'skylink__name', text: it.label }), it.handle ? h('span', { class: 'skylink__handle', text: it.handle }) : null);
      var a = h('a', { class: 'skylink', href: it.href, target: '_blank', rel: 'noopener', 'aria-label': accName(it), 'data-link': it.key, 'data-star': it.star }, lab);
      a._it = it; a._lab = lab;
      layer.appendChild(a);
      return a;
    });
    root.appendChild(layer);

    // pointing at a link wakes its star (in the painting) and lights its lines
    function wake(key, on) {
      document.querySelectorAll('[data-link="' + key + '"]').forEach(function (el) { el.classList.toggle('is-lit', on); });
      svg.querySelectorAll('[data-a="' + key + '"],[data-b="' + key + '"]').forEach(function (el) { el.classList.toggle('is-hot', on); });
      inlineSvg.querySelectorAll('[data-a="' + key + '"],[data-b="' + key + '"]').forEach(function (el) { el.classList.toggle('is-hot', on); });
      var it = items.filter(function (x) { return x.key === key; })[0];
      if (it && RJY.starHover && skyMode && shown) RJY.starHover(it.star, on);
    }
    root.querySelectorAll('[data-link]').forEach(function (el) {
      var k = el.getAttribute('data-link');
      el.addEventListener('pointerenter', function () { wake(k, true); });
      el.addEventListener('pointerleave', function () { if (document.activeElement !== el) wake(k, false); });
      el.addEventListener('focus', function () { wake(k, true); });
      el.addEventListener('blur', function () { wake(k, false); });
    });
    // keyboard: arriving on the links scrolls all the way down so the painted stars line up
    layer.addEventListener('focusin', function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (window.pageYOffset < max - 2) RJY.scrollNow(max);
    });

    var skyMode = false, shown = false, drawn = false, lastKey = '';
    var section = root.closest('section');

    function detailRects() {
      return Array.prototype.map.call(words.querySelectorAll('.sec__kicker, .contact__title, .contact__text, .contact__sub, .cdetails, .ph'), function (e) { return e.getBoundingClientRect(); })
        .filter(function (r) { return r.width > 0; });
    }
    function hits(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

    // Place every star link for a camera; returns false when a star or its label cannot be shown.
    var why = '';   // why the links last fell back to the in-page constellation (handy when adjusting the layout)
    function place(cam, commit, offsetY) {
      var w = window.innerWidth, hh = window.innerHeight;
      why = '';
      if (w <= 760) { why = 'narrow screen'; return false; }
      var m = RJY.Painting.viewMap(w, hh, RJY.Painting.focalFor(w, hh), cam);
      var navH = 64, foot = 76, oy = offsetY || 0;
      var blocks = detailRects().map(function (r) { return { x: r.left - 18, y: r.top - 14 + oy, w: r.width + 36, h: r.height + 28 }; });
      var pts = [], ok = true;
      markers.forEach(function (a) {
        var s = RJY.Painting.LIGHTS[a._it.star];
        var x = m[0] + s.x * m[2], y = m[1] + s.y * m[3];
        var r = Math.max(20, Math.min(60, RJY.Painting.effectRadius(a._it.star) * m[2] * 0.7));
        pts.push({ a: a, x: x, y: y, r: r });
        if (x < 24 || x > w - 24 || y < navH + 14 || y > hh - foot) { ok = false; why = a._it.key + ': star outside the free area'; }
        blocks.forEach(function (b) { if (hits({ x: x - r, y: y - r, w: 2 * r, h: 2 * r }, b)) { ok = false; why = a._it.key + ': star under the text'; } });
      });
      if (!ok) return false;
      // labels: try right, below, left, above — the first spot that stays clear of everything
      // (a label may sit inside its own star's invisible hit circle, but not over another star or label)
      var placed = pts.map(function (p) { return { x: p.x - p.r, y: p.y - p.r, w: 2 * p.r, h: 2 * p.r }; });
      pts.forEach(function (p, idx) {
        var lw = p.a._lab.offsetWidth || 140, lh = p.a._lab.offsetHeight || 44, g = p.r * 0.75 + 10;
        // centred spots may slide sideways to stay on screen (a star near the edge)
        var cx = Math.max(12, Math.min(w - 12 - lw, p.x - lw / 2));
        var spots = [
          { side: 'right', x: p.x + g, y: p.y - lh / 2 },
          { side: 'below', x: cx, y: p.y + g },
          { side: 'left', x: p.x - g - lw, y: p.y - lh / 2 },
          { side: 'above', x: cx, y: p.y - g - lh }
        ];
        var pick = null;
        for (var k = 0; k < spots.length && !pick; k++) {
          var c = spots[k], box = { x: c.x - 6, y: c.y - 6, w: lw + 12, h: lh + 12 };
          if (c.x < 12 || c.x + lw > w - 12 || c.y < navH + 6 || c.y + lh > hh - foot + 20) continue;
          if (blocks.some(function (b) { return hits(box, b); })) continue;
          if (placed.some(function (b, k) { return k !== idx && hits(box, b); })) continue;
          pick = c;
        }
        if (!pick) { ok = false; why = p.a._it.key + ': no room for the label'; return; }
        placed.push({ x: pick.x, y: pick.y, w: lw, h: lh });
        p.lx = pick.x - p.x; p.ly = pick.y - p.y; p.side = pick.side;
      });
      if (!ok || !commit) return ok;
      pts.forEach(function (p) {
        p.a.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
        p.a.style.setProperty('--r', p.r.toFixed(1) + 'px');
        p.a._lab.style.transform = 'translate(' + p.lx.toFixed(1) + 'px,' + p.ly.toFixed(1) + 'px)';
        p.a.dataset.side = p.side;
      });
      // the gold constellation line: star to star, stopping short of each painted star
      // (paths are created once and then only moved, so the drawing-in animation plays once)
      var paths = svg.querySelectorAll('path');
      if (paths.length !== pts.length - 1) {
        svg.innerHTML = '';
        for (var j = 1; j < pts.length; j++) svg.appendChild(RJY.s('path', { 'data-a': pts[j - 1].a._it.key, 'data-b': pts[j].a._it.key }));
        paths = svg.querySelectorAll('path');
      }
      for (var i = 1; i < pts.length; i++) {
        var A = pts[i - 1], B = pts[i], dx = B.x - A.x, dy = B.y - A.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var ga = Math.min(A.r * 0.62, len / 3), gb = Math.min(B.r * 0.62, len / 3);
        var x1 = A.x + dx / len * ga, y1 = A.y + dy / len * ga, x2 = B.x - dx / len * gb, y2 = B.y - dy / len * gb;
        var mx = (x1 + x2) / 2 + dy * 0.06, my = (y1 + y2) / 2 - dx * 0.06;
        paths[i - 1].setAttribute('d', 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1));
        paths[i - 1].style.setProperty('--len', Math.ceil(len - ga - gb + 2));
      }
      return true;
    }

    // Lines for the in-page constellation: through the centre of each star glyph.
    function drawInline() {
      if (!inline.offsetParent) return;
      var box = inlineWrap.getBoundingClientRect(), stars = inline.querySelectorAll('.cconst__star'), d = '';
      inlineSvg.setAttribute('viewBox', '0 0 ' + box.width.toFixed(0) + ' ' + box.height.toFixed(0));
      var pts = Array.prototype.map.call(stars, function (s) { var r = s.getBoundingClientRect(); return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top]; });
      for (var i = 1; i < pts.length; i++) {
        var A = pts[i - 1], B = pts[i], dx = B[0] - A[0], dy = B[1] - A[1], len = Math.sqrt(dx * dx + dy * dy) || 1, g = 11;
        d += '<path data-a="' + items[i - 1].key + '" data-b="' + items[i].key + '" d="M' + (A[0] + dx / len * g).toFixed(1) + ' ' + (A[1] + dy / len * g).toFixed(1) + 'L' + (B[0] - dx / len * g).toFixed(1) + ' ' + (B[1] - dy / len * g).toFixed(1) + '"/>';
      }
      inlineSvg.innerHTML = d;
    }

    // Choose: links on the painted stars, or the drawn constellation under the text.
    function chooseMode() {
      var w = window.innerWidth, hh = window.innerHeight;
      var key = w + 'x' + hh;
      var hero = RJY.Painting.heroView(w, hh);
      // judge with the page scrolled to the very end (the final framing), whatever the scroll is now
      var max = document.documentElement.scrollHeight - hh, offset = max - window.pageYOffset;
      skyMode = items.length > 1 && place(hero, false, -offset);
      section.classList.toggle('is-sky', skyMode);
      lastKey = key;
      drawInline();
    }

    var raf = 0;
    function relayout() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { chooseMode(); RJY.skyLinks.update(lastProgress, lastCam); }); }
    window.addEventListener('resize', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    window.addEventListener('load', relayout);

    var lastProgress = 0, lastCam = null;
    RJY.skyLinks = {
      why: function () { return why; },
      update: function (progress, cam) {
        lastProgress = progress; lastCam = cam;
        if (!lastKey) chooseMode();
        var show = skyMode && progress > 0.9;
        if (show) {
          var fits = place(cam, true, 0);
          if (!fits && progress > 0.995) { chooseMode(); show = skyMode && place(cam, true, 0); }
        }
        if (show !== shown) {
          shown = show;
          layer.classList.toggle('is-visible', show);
          if (show && !drawn) { drawn = true; layer.classList.add('is-drawing'); setTimeout(function () { layer.classList.remove('is-drawing'); }, 3200); }
          if (!show) items.forEach(function (it) { if (RJY.starHover) RJY.starHover(it.star, false); });
        }
      },
      activeStars: function () { return shown ? items.map(function (it) { return it.star; }) : []; }
    };
  };

  RJY.renderFooter = function (root) {
    var y = SITE.meta.year;
    var credit = has(SITE.meta.paintingCredit) ? ' ' + SITE.meta.paintingCredit + '.' : '';
    root.appendChild(h('p', { style: { margin: 0 } }, '© ' + y + ' Ruibin Jin Yao. Homepage painting: a Starry Night ocean scene after Vincent van Gogh.' + credit));
    if (!credit && RJY.draft) root.appendChild(RJY.ph('credit for the painting — meta.paintingCredit in data/site.js'));
    root.appendChild(h('p', { style: { margin: 0 } }, 'Map: Natural Earth. Built with HTML, CSS and JavaScript — no trackers. ', h('a', { href: '#home', text: 'Back to the sky' })));
  };
})();
