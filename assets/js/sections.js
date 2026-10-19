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
    root.appendChild(h('aside', { class: 'about__side', 'aria-label': 'At a glance' }, photo, coords));
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
  // The page ends where it began: the full painting. Each way to reach me is pinned to one of the
  // painted stars (desktop), and listed under the text for everyone.
  RJY.renderContact = function (root) {
    var L = SITE.links, P = SITE.profile;
    var items = [];
    if (has(L.email)) items.push({ key: 'email', label: 'Email', sub: L.email, href: 'mailto:' + L.email, star: 5 });
    items.push({ key: 'linkedin', label: 'LinkedIn', sub: 'Edwin Ruibin Jin Yao', href: L.linkedin, ext: true, star: 10, side: 'left' });
    items.push({ key: 'github', label: 'GitHub', sub: '@RuibinRay', href: L.github, ext: true, star: 6 });
    if (has(L.resume)) items.push({ key: 'resume', label: 'Résumé', sub: 'PDF', href: L.resume, ext: true, star: 8 });
    var spare = [7, 0, 9];
    (L.other || []).forEach(function (o, i) { items.push({ key: 'other' + i, label: o.label, sub: '', href: o.url, ext: true, star: spare[i] }); });

    var list = h('ul', { class: 'clinks' }, items.map(function (it) {
      return h('li', null, h('a', { href: it.href, target: it.ext ? '_blank' : null, rel: it.ext ? 'noopener' : null, 'data-link': it.key },
        h('span', { class: 'clinks__star', html: RJY.starIcon() }),
        h('span', { class: 'clinks__label', text: it.label }),
        has(it.sub) ? h('span', { class: 'clinks__sub', text: it.sub }) : null));
    }));
    root.appendChild(h('div', { class: 'contact__words' },
      h('p', { class: 'sec__kicker', 'data-kicker': '' }, 'Contact'),
      h('h2', { class: 'contact__title', id: 'contact-title', text: 'Under the Same Sky' }),
      h('p', { class: 'contact__text', text: 'If you work in energy, international markets or finance and think I could help, I’d like to hear from you.' }),
      h('p', { class: 'contact__sub', text: 'Based in ' + P.basedIn + ', ' + P.relocation.charAt(0).toLowerCase() + P.relocation.slice(1, -1) + '. I work in English, Spanish and Mandarin.' }),
      list,
      !has(L.email) ? RJY.ph('your public email — links.email in data/site.js (it becomes a star in the sky)') : null,
      !has(L.resume) ? RJY.ph('a résumé PDF — put it in assets/docs/ and set links.resume') : null));

    // Fixed overlay of the same links, pinned to painted stars
    var layer = h('div', { class: 'skylinks', 'aria-hidden': 'true' });
    var svg = RJY.s('svg', { class: 'skylinks__lines' });
    layer.appendChild(svg);
    var markers = items.filter(function (it) { return it.star != null; }).map(function (it) {
      var m = h('a', { class: 'skylink' + (it.side === 'left' ? ' skylink--left' : ''), href: it.href, tabindex: '-1', target: it.ext ? '_blank' : null, rel: it.ext ? 'noopener' : null, 'data-link': it.key },
        h('span', { class: 'skylink__ring' }), h('span', { class: 'skylink__label', text: it.label }));
      m._star = RJY.Painting.META.stars[it.star];
      layer.appendChild(m);
      return m;
    });
    document.body.appendChild(layer);
    // hovering either the list or the sky marker lights both
    function pair(key, on) { document.querySelectorAll('[data-link="' + key + '"]').forEach(function (el) { el.classList.toggle('is-lit', on); }); }
    document.querySelectorAll('[data-link]').forEach(function (el) {
      var k = el.getAttribute('data-link');
      el.addEventListener('mouseenter', function () { pair(k, true); });
      el.addEventListener('mouseleave', function () { pair(k, false); });
      el.addEventListener('focus', function () { pair(k, true); });
      el.addEventListener('blur', function () { pair(k, false); });
    });

    var words = root.querySelector('.contact__words');
    RJY.skyLinks = {
      update: function (progress, cam) {
        var show = progress > 0.9 && window.innerWidth > 760;
        layer.classList.toggle('is-visible', show);
        if (!show) return;
        var w = window.innerWidth, hh = window.innerHeight;
        var m = RJY.Painting.viewMap(w, hh, RJY.Painting.focalFor(w, hh), cam);
        var box = words.getBoundingClientRect(), pts = [];
        markers.forEach(function (mk) {
          var x = m[0] + mk._star.x * m[2], y = m[1] + mk._star.y * m[3];
          var hidden = x < 40 || x > w - 40 || y < 90 || y > hh - 60 || (x > box.left - 60 && x < box.right + 20 && y > box.top - 30 && y < box.bottom + 30);
          mk.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
          mk.style.visibility = hidden ? 'hidden' : '';
          if (!hidden) pts.push([x, y]);
        });
        var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
        svg.innerHTML = pts.length > 1 ? '<path d="' + d + '"/>' : '';
      }
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
