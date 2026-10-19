/*
 * gallery.js — "Memories": every public photo on the site in one place.
 *   · data/gallery.js
 *   · the photos listed in data/travel.js (countries, places and trips)
 *   · photos uploaded to assets/photos/<COUNTRY>/<place>/ (found by places.js)
 * The section and its menu link stay hidden until there is at least one photo, and appear by
 * themselves when uploaded photos are found. In draft view (?draft) an empty section shows how
 * to add photos.
 */
(function () {
  'use strict';
  var RJY = window.RJY, SITE = window.SITE, h = RJY.h, has = RJY.has;
  var root, section, navItem = null;

  function key(src) { try { return decodeURIComponent(String(src)); } catch (e) { return String(src); } }

  function collect() {
    var out = [], seen = {};
    function add(p, base) {
      if (!p || !p.src || p.public === false) return;
      var k = key(p.src);
      if (seen[k]) return;          // listed in a data file and also found in a folder
      seen[k] = 1;
      out.push(Object.assign({}, base, p));
    }
    ((SITE.gallery && SITE.gallery.photos) || []).forEach(function (p) { add(p, {}); });
    var T = SITE.travel || {};
    var countries = (T.countries || []).slice();
    if (RJY.photos && RJY.photos.ready()) RJY.photos.countriesWithPhotos().forEach(function (code) {
      if (!countries.some(function (c) { return c.code === code; })) countries.push({ code: code });
    });
    countries.forEach(function (c) {
      var name = RJY.countryName(c.code);
      var P = RJY.places ? RJY.places.forCountry(c) : { places: [], photos: c.photos || [] };
      P.places.forEach(function (pl) {
        pl.photos.forEach(function (p) { add(p, { category: 'Travel', country: c.code, place: pl.name + ', ' + name }); });
      });
      P.photos.forEach(function (p) { add(p, { category: 'Travel', country: c.code, place: name }); });
    });
    (T.trips || []).forEach(function (t) {
      (t.photos || []).forEach(function (p) { add(p, { category: 'Travel', country: t.country, date: t.start }); });
    });
    return out;
  }

  RJY.galleryCount = function () { return collect().length; };

  RJY.renderGallery = function (el) {
    root = el;
    section = root.closest('section');
    render();
    document.addEventListener('rjy:photos', render);
  };

  // The "Memories" link sits after "World" in the menu, only while the section is shown.
  function setLink(on) {
    if (on && !navItem) {
      var worldLink = document.querySelector('.nav__list a[href="#world"]');
      if (!worldLink) return;
      navItem = h('li', null, h('a', { class: 'nav__link', href: '#memories', text: 'Memories' }));
      worldLink.parentNode.insertAdjacentElement('afterend', navItem);
    } else if (!on && navItem) { navItem.remove(); navItem = null; }
  }

  function render() {
    var photos = collect();
    var show = photos.length > 0 || RJY.draft;
    section.hidden = !show;
    setLink(show);
    root.innerHTML = '';
    if (!show) return;
    if (!photos.length) {
      root.appendChild(RJY.ph('photos — upload them to assets/photos/<COUNTRY>/<place>/ (README → “Adding photos”), or list them in data/gallery.js. This section stays hidden on the public site until there is at least one photo.'));
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
    [group('cat', 'Filter by category', cats),
      group('country', 'Filter by country', countries, function (c) { return RJY.countryName(c); }),
      group('year', 'Filter by year', years)].forEach(function (g) { if (g) root.appendChild(g); });
    var grid = h('div', { class: 'gallery' });
    function matches(p) {
      return (state.cat === 'all' || p.category === state.cat) && (state.country === 'all' || p.country === state.country) &&
        (state.year === 'all' || String(p.date || '').slice(0, 4) === state.year);
    }
    photos.forEach(function (p, i) {
      var meta = [p.place || (p.country ? RJY.countryName(p.country) : ''), p.date ? RJY.monthYear(p.date) : ''].filter(has).join(', ');
      var label = p.caption || p.alt || (meta ? 'Photo from ' + meta : 'Photo');
      var fig = h('figure', { class: 'gallery__item reveal', 'data-i': i },
        h('button', { type: 'button', 'aria-label': 'Open photo: ' + label, onclick: function () {
          var shown = photos.filter(function (q) { return !q.broken && matches(q); });
          RJY.lightbox(p, shown, shown.indexOf(p));
        } },
          h('img', { src: p.src, alt: p.alt || label, loading: 'lazy', decoding: 'async', onerror: function () { p.broken = true; fig.hidden = true; } })),
        has(p.caption) || meta ? h('figcaption', null, has(p.caption) ? h('span', { text: p.caption }) : null, meta ? h('small', { text: meta }) : null) : null);
      grid.appendChild(fig);
    });
    root.appendChild(grid);
    root.appendChild(h('p', { class: 'gallery__empty muted', hidden: true, text: 'No photos match those filters.' }));
    function apply() {
      var shown = 0;
      grid.querySelectorAll('.gallery__item').forEach(function (el) {
        var p = photos[+el.dataset.i];
        var ok = !p.broken && matches(p);
        el.hidden = !ok; if (ok) shown++;
      });
      root.querySelector('.gallery__empty').hidden = shown > 0;
    }
    if (RJY.reveal) RJY.reveal(root);
  }
})();
