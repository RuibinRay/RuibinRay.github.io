/*
 * work.js — "My Constellations": projects drawn as constellations, an index for scanning,
 * and the case-study chapter that opens over the page (#projects/<id>).
 */
(function () {
  'use strict';
  var RJY = window.RJY, SITE = window.SITE, h = RJY.h, s = RJY.s, has = RJY.has;
  var HUES = { gold: '#f2c14e', ember: '#f0a04a', foam: '#cfdcef', periwinkle: '#a7b3e0' };

  // Minimum spanning tree gives a natural, uncluttered constellation shape.
  function mst(pts) {
    var n = pts.length, inTree = [0], edges = [];
    if (n < 2) return edges;
    while (inTree.length < n) {
      var best = null;
      inTree.forEach(function (a) {
        for (var b = 0; b < n; b++) {
          if (inTree.indexOf(b) !== -1) continue;
          var d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
          if (!best || d < best.d) best = { a: a, b: b, d: d };
        }
      });
      edges.push(best); inTree.push(best.b);
    }
    return edges;
  }

  // Depth-first order through the tree, so neighbours in a phone layout are connected stars.
  function treeOrder(n, edges) {
    var adj = {}; for (var i = 0; i < n; i++) adj[i] = [];
    edges.forEach(function (e) { adj[e.a].push(e.b); adj[e.b].push(e.a); });
    var seen = {}, out = [];
    (function visit(i) { seen[i] = 1; out.push(i); adj[i].forEach(function (j) { if (!seen[j]) visit(j); }); })(0);
    for (var k = 0; k < n; k++) if (!seen[k]) out.push(k);
    return out;
  }

  // Split a label into lines that fit a width (approximate: 0.52em per character).
  function wrap(text, maxPx, fs) {
    var max = Math.max(8, Math.floor(maxPx / (fs * 0.52))), words = text.split(' '), lines = [''];
    words.forEach(function (w) {
      var cur = lines[lines.length - 1];
      if ((cur + ' ' + w).trim().length > max && cur) lines.push(w); else lines[lines.length - 1] = (cur + ' ' + w).trim();
    });
    return lines;
  }

  function drawConstellation(c, items, wide, compact) {
    var VW, VH, pad = 40, pts;
    var base = items.map(function (w) { return { w: w, x: w.star[0], y: w.star[1] }; });
    var edges = mst(base);
    if (compact) {
      // phones: a vertical chain of stars, labels to the right
      var order = treeOrder(base.length, edges), gap = 64;
      VW = 340; VH = 40 + gap * (base.length - 1) + 40;
      pts = base.slice();
      order.forEach(function (idx, k) {
        var j = Math.sin((k + 3) * 91.7) * 1000; j = j - Math.floor(j);
        pts[idx] = { w: base[idx].w, x: 34 + (k % 2 ? 54 : 0) + j * 18, y: 36 + k * gap };
      });
    } else {
      VW = wide ? 1000 : 500; VH = wide ? 300 : 320;
      pts = base.map(function (p) { return { w: p.w, x: pad + p.x * (VW - 2 * pad), y: pad + p.y * (VH - 2 * pad) }; });
    }
    var color = HUES[c.hue] || HUES.gold;
    var svg = s('svg', { viewBox: '0 0 ' + VW + ' ' + VH, role: 'group', 'aria-label': c.name + ' constellation, ' + items.length + ' projects', class: compact ? 'is-compact' : null });
    var gid = 'wg-' + c.id;
    svg.appendChild(s('defs', null, s('radialGradient', { id: gid }, s('stop', { offset: '0', 'stop-color': '#fff6dc', 'stop-opacity': '.95' }), s('stop', { offset: '.22', 'stop-color': color, 'stop-opacity': '.45' }), s('stop', { offset: '1', 'stop-color': color, 'stop-opacity': '0' }))));
    var edgeEls = [];
    edges.forEach(function (e) {
      var A = pts[e.a], B = pts[e.b];
      var len = Math.hypot(B.x - A.x, B.y - A.y);
      var bend = compact ? 0.18 : 0.08;
      var mx = (A.x + B.x) / 2 + (B.y - A.y) * bend, my = (A.y + B.y) / 2 - (B.x - A.x) * bend;
      var line = s('path', { class: 'edge', d: 'M' + A.x + ' ' + A.y + ' Q' + mx + ' ' + my + ' ' + B.x + ' ' + B.y, 'data-a': A.w.id, 'data-b': B.w.id });
      line.style.setProperty('--len', Math.ceil(len * 1.15));
      svg.appendChild(line); edgeEls.push(line);
    });
    pts.forEach(function (p) {
      var w = p.w, r = 4 + 3 * (w.magnitude || 0.8);
      var g = s('g', { class: 'wstar', tabindex: '0', role: 'button', 'aria-label': w.title + (w.when ? ', ' + w.when : '') + ' — open case study', 'data-id': w.id });
      g.appendChild(s('circle', { class: 'halo', cx: p.x, cy: p.y, r: r * 6, fill: 'url(#' + gid + ')' }));
      g.appendChild(s('circle', { class: 'ring', cx: p.x, cy: p.y, r: r + 7 }));
      g.appendChild(s('circle', { class: 'core', cx: p.x, cy: p.y, r: r }));
      g.appendChild(s('circle', { cx: p.x, cy: p.y, r: 22, fill: 'transparent' }));
      if (compact) {
        var fs = 14, lx = p.x + r + 14, lines = wrap(w.short || w.title, VW - lx - 6, fs);
        var t = s('text', { x: lx, y: p.y + 5 - (lines.length - 1) * 8, 'font-size': fs });
        lines.forEach(function (ln, i) { t.appendChild(s('tspan', { x: lx, dy: i ? 17 : 0, text: ln })); });
        // a wide invisible hit area over the label too
        g.appendChild(s('rect', { x: p.x - 20, y: p.y - 22, width: VW - p.x + 14, height: 44, fill: 'transparent' }));
        g.appendChild(t);
      } else {
        var right = p.x < VW * 0.72;
        g.appendChild(s('text', { x: right ? p.x + r + 12 : p.x - r - 12, y: p.y + 4, 'text-anchor': right ? 'start' : 'end', text: w.short || w.title }));
      }
      var hot = function (on) { edgeEls.forEach(function (l) { if (l.dataset.a === w.id || l.dataset.b === w.id) l.classList.toggle('is-hot', on); }); };
      g.addEventListener('mouseenter', function () { hot(true); });
      g.addEventListener('mouseleave', function () { hot(false); });
      g.addEventListener('focus', function () { hot(true); });
      g.addEventListener('blur', function () { hot(false); });
      g.addEventListener('click', function () { RJY.route.go('#projects/' + w.id); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); RJY.route.go('#projects/' + w.id); } });
      svg.appendChild(g);
    });
    return svg;
  }

  RJY.renderWork = function (root) {
    var sky = h('div', { class: 'sky' });
    var boxes = [];
    SITE.constellations.forEach(function (c, ci) {
      var items = SITE.work.filter(function (w) { return w.constellation === c.id; });
      if (!items.length) return;
      var wide = ci === 0;
      var box = h('div', { class: 'cons reveal', style: wide ? { gridColumn: '1 / -1' } : null },
        h('h3', { class: 'cons__name', text: c.name }), has(c.note) ? h('p', { class: 'cons__note', text: c.note }) : null);
      box._c = c; box._items = items; box._wide = wide;
      sky.appendChild(box); boxes.push(box);
    });
    root.appendChild(sky);
    var modeNow = null;
    function draw() {
      // full: two columns · narrow: one column, everything drawn at its normal size · compact: phones
      var cw = sky.clientWidth || window.innerWidth;
      var mode = cw < 700 ? 'compact' : cw < 860 ? 'narrow' : 'full';
      if (mode === modeNow) return;
      modeNow = mode;
      boxes.forEach(function (box) {
        var old = box.querySelector('svg'); if (old) old.remove();
        box.appendChild(drawConstellation(box._c, box._items, box._wide && mode === 'full', mode === 'compact'));
      });
    }
    draw();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(draw, 200); });
    // Constellations draw themselves the first time they are seen
    var cons = root.querySelectorAll('.cons');
    if (RJY.reducedMotion || !('IntersectionObserver' in window)) cons.forEach(function (c) { c.classList.add('is-drawn'); });
    else {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); } }); }, { threshold: 0.3 });
      cons.forEach(function (c) { io.observe(c); });
    }

    // Index — every project in one scannable list
    var consName = {}; SITE.constellations.forEach(function (c) { consName[c.id] = c.name; });
    var list = h('ol', null, SITE.work.map(function (w) {
      return h('li', null, h('button', { type: 'button', onclick: function () { RJY.route.go('#projects/' + w.id); } },
        h('span', { class: 'ix-cons', text: consName[w.constellation] }),
        h('span', { class: 'ix-title', text: w.title }),
        h('span', { class: 'ix-when', text: w.when || '' })));
    }));
    root.appendChild(h('div', { class: 'index reveal' },
      h('div', { class: 'index__head' }, h('h3', { text: 'All projects' }), h('span', { class: 'muted', style: { fontSize: '.8125rem' }, text: SITE.work.length + ' case studies' })),
      list));

    RJY.route.on('projects', open);
  };

  function section(title, content) {
    return [h('h3', { text: title }), h('div', null, content)];
  }
  function bullets(list) { return h('ul', { class: 'jd__list' }, list.map(function (x) { return h('li', { text: x }); })); }

  function open(id) {
    var w = RJY.findWork(id); if (!w) return;
    var cons = SITE.constellations.filter(function (c) { return c.id === w.constellation; })[0] || {};
    var all = SITE.work, i = all.indexOf(w);
    RJY.sheet.open({
      kind: 'chapter',
      label: w.title,
      render: function (body) {
        var grid = h('div', { class: 'chapter__grid' });
        function add(title, val, render, hint) {
          if (has(val)) {
            grid.appendChild(h('h3', { text: title }));
            grid.appendChild(h('div', null, render(val)));
          } else if (RJY.draft) {
            grid.appendChild(h('h3', { text: title }));
            grid.appendChild(h('div', null, RJY.ph(hint)));
          }
        }
        add('The opportunity', w.context, function (v) { return h('p', { text: v }); }, 'the problem or opportunity — context');
        add('Objective', w.objective, function (v) { return h('p', { text: v }); }, 'what the work set out to do — objective');
        add('My role', w.role, function (v) { return h('p', { text: v }); }, 'your role and contribution — role');
        add('Approach', w.approach, bullets, 'the methods and steps — approach');
        add('Tools', w.tools, function (v) { return h('div', { class: 'chapter__tools' }, v.map(function (t) { return h('span', { text: t }); })); }, 'tools you used — tools');
        add('Insights', w.insights, bullets, 'what you found — insights');
        add('Results & deliverables', w.results, bullets, 'documented results — results (no estimates)');
        add('Images', w.images, function (v) {
          return h('div', { class: 'chapter__images' }, v.map(function (im) { return h('figure', null, h('img', { src: im.src, alt: im.alt || '', loading: 'lazy' }), has(im.caption) ? h('figcaption', { text: im.caption }) : null); }));
        }, 'screenshots, charts or slides — images');
        add('Links', w.links, function (v) {
          return h('div', { class: 'btn-row' }, v.map(function (l) { return h('a', { class: 'btn', href: l.url, target: '_blank', rel: 'noopener', text: l.label }); }));
        }, 'a live demo, repository or deck — links');
        var prev = all[(i - 1 + all.length) % all.length], next = all[(i + 1) % all.length];
        body.appendChild(h('p', { class: 'chapter__eyebrow', text: [cons.name, w.when].filter(has).join(', ') }));
        body.appendChild(h('h2', { class: 'chapter__title', text: w.title }));
        body.appendChild(h('p', { class: 'chapter__meta', text: [w.org].filter(has).join('') }));
        body.appendChild(grid);
        var c = RJY.connections(w.related); if (c) body.appendChild(c);
        body.appendChild(h('div', { class: 'jd__nav', style: { marginTop: '48px' } },
          h('a', { class: 'link', href: '#projects/' + prev.id }, '← ' + prev.short),
          h('a', { class: 'link', href: '#projects/' + next.id }, next.short + ' →')));
      }
    });
  }
  RJY.openWork = open;
})();
