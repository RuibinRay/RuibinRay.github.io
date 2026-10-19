/*
 * gallery.js — "Memories": photos from data/gallery.js plus every travel photo in data/travel.js.
 * The section (and its menu link) only appears when there is at least one public photo.
 * In draft view (?draft) an empty section shows how to add photos.
 */
(function () {
  'use strict';
  var RJY = window.RJY, SITE = window.SITE, h = RJY.h, has = RJY.has;

  function collect() {
    var out = [];
    ((SITE.gallery && SITE.gallery.photos) || []).forEach(function (p) { if (p && p.src && p.public !== false) out.push(p); });
    var T = SITE.travel || {};
    (T.countries || []).forEach(function (c) {
      (c.photos || []).forEach(function (p) { if (p && p.src && p.public !== false) out.push(Object.assign({ category: 'Travel', country: c.code }, p)); });
    });
    (T.trips || []).forEach(function (t) {
      (t.photos || []).forEach(function (p) { if (p && p.src && p.public !== false) out.push(Object.assign({ category: 'Travel', country: t.country, date: t.start }, p)); });
    });
    return out;
  }

  RJY.galleryCount = function () { return collect().length; };

  RJY.renderGallery = function (root) {
    var photos = collect();
    var section = root.closest('section');
    if (!photos.length && !RJY.draft) { section.remove(); return; }
    // add the menu link only when the section exists
    var worldLink = document.querySelector('.nav__list a[href="#world"]');
    if (worldLink) worldLink.parentNode.insertAdjacentElement('afterend', h('li', null, h('a', { class: 'nav__link', href: '#memories', text: 'Memories' })));
    if (!photos.length) {
      root.appendChild(RJY.ph('photos — add them to data/gallery.js, or to a country in data/travel.js. This section stays hidden on the public site until there is at least one photo.'));
      return;
    }
    var state = { cat: 'all', country: 'all', year: 'all' };
    var cats = [], countries = [], years = [];
    photos.forEach(function (p) {
      if (p.category && cats.indexOf(p.category) === -1) cats.push(p.category);
      if (p.country && countries.indexOf(p.country) === -1) countries.push(p.country);
      var y = p.date ? String(p.date).slice(0, 4) : '';
      if (y && years.indexOf(y) === -1) years.push(y);
    });
    years.sort();
    function group(kind, label, values, fmt) {
      if (values.length < 2) return null;
      return h('div', { class: 'filters', role: 'group', 'aria-label': label },
        [['all', 'All']].concat(values.map(function (v) { return [v, fmt ? fmt(v) : v]; })).map(function (pair) {
          return h('button', { class: 'chip', type: 'button', 'data-kind': kind, 'data-value': pair[0], 'aria-pressed': String(pair[0] === 'all'), text: pair[1], onclick: function () {
            state[kind] = pair[0];
            root.querySelectorAll('.chip[data-kind="' + kind + '"]').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.value === pair[0])); });
            apply();
          } });
        }));
    }
    root.appendChild(group('cat', 'Filter by category', cats));
    root.appendChild(group('country', 'Filter by country', countries, function (c) { return RJY.countryName(c); }));
    root.appendChild(group('year', 'Filter by year', years));
    var grid = h('div', { class: 'gallery' });
    photos.forEach(function (p, i) {
      var meta = [p.place || (p.country ? RJY.countryName(p.country) : ''), p.date ? RJY.monthYear(p.date) : ''].filter(has).join(', ');
      var fig = h('figure', { class: 'gallery__item reveal', 'data-i': i },
        h('button', { type: 'button', 'aria-label': 'Open photo: ' + (p.caption || p.alt || ''), onclick: function () { RJY.lightbox(p); } },
          h('img', { src: p.src, alt: p.alt || '', loading: 'lazy', decoding: 'async' })),
        has(p.caption) || meta ? h('figcaption', null, has(p.caption) ? h('span', { text: p.caption }) : null, meta ? h('small', { text: meta }) : null) : null);
      grid.appendChild(fig);
    });
    root.appendChild(grid);
    root.appendChild(h('p', { class: 'gallery__empty muted', hidden: true, text: 'No photos match those filters.' }));
    function apply() {
      var shown = 0;
      grid.querySelectorAll('.gallery__item').forEach(function (el) {
        var p = photos[+el.dataset.i];
        var ok = (state.cat === 'all' || p.category === state.cat) && (state.country === 'all' || p.country === state.country) && (state.year === 'all' || String(p.date || '').slice(0, 4) === state.year);
        el.hidden = !ok; if (ok) shown++;
      });
      root.querySelector('.gallery__empty').hidden = shown > 0;
    }
  };
})();
