/*
 * painting.js — the living painting.
 *
 * Renders the Starry Night ocean artwork with WebGL and animates it in place:
 *  - the sky flows along its own brushstrokes (a flow map computed from the painting's
 *    structure tensor, so motion follows the painted curves, spirals and star halos)
 *  - the ocean has its own field: strokes drift along the foam, and swells roll toward the viewer
 *  - the person, driftwood, rocks, horizon and headland are masked out and never move
 *  - stars and the moon stay where they are painted and pulse softly
 *
 * No libraries. WebGL 1 so it runs nearly everywhere. Falls back to a still image (handled by main.js).
 */
(function () {
  'use strict';

  // Painting features in image-normalised coordinates (x / width, y / height of the 1024x765 source).
  // core / halo radii are in units of image width.
  var META = {
    aspect: 1024 / 765,
    horizon: 376 / 765,
    stars: [
      [117, 24, 18, 48], [251, 15, 9, 26], [371, 18, 10, 34], [441, 35, 11, 27],
      [650, 48, 18, 46], [257, 107, 22, 44], [744, 141, 12, 42], [355, 202, 9, 28],
      [147, 301, 20, 37], [50, 284, 9, 22], [385, 329, 17, 58]
    ].map(function (s) { return { x: s[0] / 1024, y: s[1] / 765, core: s[2] / 1024, halo: s[3] / 1024 }; }),
    moon: { x: 928 / 1024, y: 107 / 765, core: 72 / 1024, halo: 118 / 1024 }
  };

  var VERT = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';

  var FRAG = [
    'precision highp float;',
    'uniform sampler2D uImage;uniform sampler2D uSky;uniform sampler2D uSea;uniform sampler2D uMask;uniform sampler2D uNoise;uniform sampler2D uBlur;',
    'uniform vec2 uRes;uniform vec4 uMap;uniform float uAspect;uniform float uHorizon;',
    'uniform float uFlowT;uniform float uClock;uniform float uIntro;uniform float uScroll;uniform vec2 uMouse;',
    'uniform vec4 uStars[11];uniform vec2 uTwinkle[11];uniform vec4 uMoon;uniform float uMoonPulse;uniform vec4 uParams;uniform vec4 uFx;uniform vec4 uSpiral1;uniform vec4 uSpiral2;',
    'vec3 img(vec2 uv){return texture2D(uImage,uv).rgb;}',
    // Blend two flow phases without washing out the brushwork: keep the local contrast of the paint
    'vec3 blend2(vec3 ca,vec3 cb,float w0,vec2 uv,float shift){',
    '  float w1=1.0-w0; vec3 m=texture2D(uBlur,uv).rgb;',
    // only compensate when the two samples are far enough apart to be different strokes
    '  float k=pow(w0*w0+w1*w1,0.36*smoothstep(0.0012,0.007,shift));',
    '  return clamp(m+(ca*w0+cb*w1-m)/k,0.0,1.0);',
    '}',
    'void main(){',
    '  vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);',
    '  vec2 uv=(p-uMap.xy)/uMap.zw;',
    '  vec3 skyT=texture2D(uSky,uv).rgb;',
    '  vec3 seaT=texture2D(uSea,uv).rgb;',
    '  vec3 msk=texture2D(uMask,uv).rgb;',
    '  vec3 nz=texture2D(uNoise,uv*vec2(1.6,1.2)).rgb;',
    '  float skyW=skyT.b; float seaW=seaT.b;',
    '  vec2 par=uMouse*vec2(0.0032,0.0032*uAspect);',
    '  vec3 col;',
    '  if(skyW>0.003){',
    // sky 1: the two great spirals breathe — a slow, gentle wind/unwind around their eyes
    '    vec2 uvS=uv+par*skyW;',
    '    vec2 d1=(uvS-uSpiral1.xy)*vec2(1.0,1.0/uAspect); float r1=dot(d1,d1);',
    '    vec2 d2=(uvS-uSpiral2.xy)*vec2(1.0,1.0/uAspect); float r2=dot(d2,d2);',
    '    float a1=uSpiral1.z*exp(-r1/(uSpiral1.w*uSpiral1.w)); float a2=uSpiral2.z*exp(-r2/(uSpiral2.w*uSpiral2.w));',
    '    uvS+=(vec2(-d1.y,d1.x)*a1+vec2(-d2.y,d2.x)*a2)*vec2(1.0,uAspect)*skyW;',
    // sky 2: two-phase flow map — paint slides along its own brushstrokes; currents surge and calm
    '    vec2 f=(texture2D(uSky,uvS).rg*2.0-1.0)*vec2(1.0,uAspect)*uParams.x;',
    '    f*=0.62+0.76*texture2D(uNoise,uvS*vec2(1.1,0.8)+vec2(uClock*0.009,-uClock*0.006)).r;',
    '    float t=uFlowT/4.0+nz.r*2.0;',
    '    float p0=fract(t); float p1=fract(t+0.5);',
    '    float w0=smoothstep(0.0,1.0,1.0-abs(1.0-2.0*p0));',
    '    vec2 a=uvS-f*(p0-0.5); vec2 b=uvS-f*(p1-0.5);',
    '    vec3 o=img(uvS);',
    '    vec3 ca=mix(o,img(a),smoothstep(0.05,0.6,texture2D(uSky,a).b));',
    '    vec3 cb=mix(o,img(b),smoothstep(0.05,0.6,texture2D(uSky,b).b));',
    '    col=blend2(ca,cb,w0,uvS,length(f)*0.5);',
    // sky 3: light running along the currents, strongest on the pale strokes
    '    float lt=uFlowT/3.0+nz.g*2.0; float q0=fract(lt); float q1=fract(lt+0.5); float wq=1.0-abs(1.0-2.0*q0);',
    '    vec2 ls=uvS*vec2(2.6,2.0);',
    '    float n0=texture2D(uNoise,ls-f*2.2*(q0-0.5)).g; float n1=texture2D(uNoise,ls-f*2.2*(q1-0.5)).g;',
    '    float lum=dot(col,vec3(0.3,0.5,0.2));',
    '    col*=1.0+(mix(n1,n0,wq)-0.5)*0.22*smoothstep(0.25,0.75,lum)*skyW*uFx.w;',
    '  } else if(seaW>0.003){',
    // ocean: swells travelling toward the viewer + strokes drifting along the foam
    '    float depth=clamp((uv.y-uHorizon)/(1.0-uHorizon),0.0,1.0);',
    '    float ph=15.0*log(depth+0.12)-uClock*0.55+sin(uv.x*2.3+0.6)*0.7+(nz.g-0.5)*0.8;',
    '    float ph2=7.0*log(depth+0.3)-uClock*0.33+uv.x*1.7;',
    '    float A=(0.8+3.2*depth)/1024.0*uParams.z;',
    '    vec2 sw=vec2(0.30*sin(ph2),(sin(ph)+0.30*sin(ph*2.0+1.9))*uAspect)*A*seaW;',
    '    vec2 uvW=uv+sw;',
    '    vec2 f=(texture2D(uSea,uvW).rg*2.0-1.0)*vec2(1.0,uAspect)*uParams.y;',
    '    float t=uFlowT/4.6+nz.g*2.0;',
    '    float p0=fract(t); float p1=fract(t+0.5);',
    '    float w0=smoothstep(0.0,1.0,1.0-abs(1.0-2.0*p0));',
    '    vec2 a=uvW-f*(p0-0.5); vec2 b=uvW-f*(p1-0.5);',
    '    vec3 o=img(uv);',
    '    vec3 ca=mix(o,img(a),smoothstep(0.05,0.6,texture2D(uSea,a).b));',
    '    vec3 cb=mix(o,img(b),smoothstep(0.05,0.6,texture2D(uSea,b).b));',
    '    col=blend2(ca,cb,w0,uvW,length(f)*0.5);',
    '    float sh=texture2D(uNoise,uv*vec2(2.0,3.5)+vec2(-uClock*0.010,uClock*0.016)).b;',
    '    col+=msk.g*(sh-0.5)*0.16;',
    '    float gl=texture2D(uNoise,uv*vec2(3.0,12.0)+vec2(uClock*0.004,-uClock*0.022)).g;',
    '    float spark=smoothstep(0.62,0.86,gl)*msk.b;',
    '    col+=vec3(1.0,0.82,0.42)*spark*0.30*uParams.w;',
    '    col+=vec3(1.0,0.85,0.5)*msk.b*0.03*(0.6+0.4*sin(uClock*0.5));',
    '  } else {',
    '    col=img(uv);',
    '  }',
    // foreground: very subtle moving moonlight on driftwood and rock (light only, no movement)
    '  float cw=texture2D(uNoise,uv*vec2(4.0,7.0)+vec2(uClock*0.006,uClock*0.004)).r;',
    '  col*=1.0+msk.r*(cw-0.5)*0.09*uFx.y;',
    // stars & moon: stay in place, glow and pulse at their own pace
    '  vec2 q=vec2(uv.x,uv.y/uAspect);',
    '  vec2 sp=vec2(par.x,par.y/uAspect);',
    '  vec3 glow=vec3(0.0); float sm=0.0;',
    '  for(int i=0;i<11;i++){',
    '    vec4 s=uStars[i];',
    '    vec2 c=vec2(s.x,s.y/uAspect)-sp;',
    '    vec2 dv=q-c; float d2=dot(dv,dv);',
    '    if(d2<s.w*s.w*5.0){',
    '      vec2 tw=uTwinkle[i];',
    '      float h=exp(-d2/(s.w*s.w*0.55));',
    '      float k=exp(-d2/(s.z*s.z*0.9));',
    '      glow+=vec3(1.0,0.80,0.36)*h*(0.05+0.11*tw.x)+vec3(1.0,0.95,0.80)*k*(0.04+0.10*tw.y);',
    '      sm=max(sm,k);',
    '    }',
    '  }',
    '  vec2 mc=vec2(uMoon.x,uMoon.y/uAspect)-sp; float md=length(q-mc);',
    '  if(md<uMoon.w*2.2) glow+=vec3(1.0,0.86,0.50)*exp(-(md*md)/(uMoon.w*uMoon.w*0.9))*(0.05+0.04*uMoonPulse);',
    '  sm=max(sm,smoothstep(uMoon.z*1.05,uMoon.z*0.7,md));',
    '  float ist=smoothstep(0.25,0.75,uIntro);',
    '  col*=1.0-(1.0-ist)*0.55*sm;',
    '  glow*=ist*uParams.w;',
    '  col=1.0-(1.0-col)*(1.0-glow);',
    // atmosphere: vignette, scroll dimming, intro fade, film grain
    '  vec2 sc=p/uRes-0.5;',
    '  col*=mix(1.0-0.30*uFx.z,1.0,smoothstep(0.95,0.25,length(sc*vec2(1.05,1.25))));',
    '  col*=1.0-0.38*uScroll;',
    '  col*=smoothstep(0.0,0.42,uIntro);',
    '  float g=texture2D(uNoise,p/256.0+vec2(0.37,0.71)*floor(uClock*24.0)).b;',
    '  col+=(g-0.5)*0.035*uFx.x;',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('Shader compile failed: ' + log);
    }
    return sh;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { resolve(im); };
      im.onerror = function () { reject(new Error('Could not load ' + src)); };
      im.src = src;
    });
  }

  // Try each candidate URL in order (e.g. webp, then jpg).
  function loadFirst(list) {
    var i = 0;
    return new Promise(function (resolve, reject) {
      (function next() {
        if (i >= list.length) { reject(new Error('No image could be loaded: ' + list.join(', '))); return; }
        loadImage(list[i++]).then(resolve, next);
      })();
    });
  }

  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  /**
   * new Painting(canvas, options)
   * options.sources: { painting: [urls], sky, sea, mask, noise }
   * options.reducedMotion: boolean
   * options.introDuration: seconds (0 to skip)
   */
  function Painting(canvas, options) {
    this.canvas = canvas;
    this.opts = options || {};
    this.meta = META;
    this.running = false;
    this.visible = true;
    this.mouse = [0, 0];
    this.mouseTarget = [0, 0];
    this.scroll = 0;
    this.flowT = 0;
    this.clock = 0;
    this.intro = this.opts.introDuration > 0 ? 0 : 1;
    this.introStart = null;
    this.quality = 1;
    this.frameTimes = [];
    this.focal = { x: 0.5, y: 0.5 };
    this.map = [0, 0, 1, 1];
    this.view = null;
    this.budget = { scale: 1, fps: 60 };
    this._lastDraw = 0;
    this.params = [0.036, 0.022, 1.1, 1.0];   // sky flow, sea flow, swell, glow
    this.fx = [1, 1, 1, 1];                   // grain, light on wood, vignette, light along the currents
    this._raf = 0;
    this._last = 0;
    this._frame = this._frame.bind(this);
  }

  Painting.prototype.init = function () {
    var self = this, gl;
    var attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: !!this.opts.preserveDrawingBuffer, powerPreference: 'high-performance' };
    try { gl = this.canvas.getContext('webgl', attrs) || this.canvas.getContext('experimental-webgl', attrs); } catch (e) { gl = null; }
    if (!gl) return Promise.reject(new Error('WebGL unavailable'));
    if (!this.opts.allowSoftware) {
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      var renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return Promise.reject(new Error('Software WebGL (' + renderer + ')'));
    }
    this.gl = gl;

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    var fragSrc = FRAG;
    var hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    if (!hp || hp.precision === 0) fragSrc = fragSrc.replace('precision highp float;', 'precision mediump float;');
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return Promise.reject(new Error('Program link failed: ' + gl.getProgramInfoLog(prog)));
    gl.useProgram(prog);
    this.prog = prog;

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var names = ['uImage', 'uSky', 'uSea', 'uMask', 'uNoise', 'uBlur', 'uRes', 'uMap', 'uAspect', 'uHorizon', 'uFlowT', 'uClock', 'uIntro', 'uScroll', 'uMouse', 'uStars', 'uTwinkle', 'uMoon', 'uMoonPulse', 'uParams', 'uFx', 'uSpiral1', 'uSpiral2'];
    this.u = {};
    names.forEach(function (n) { self.u[n] = gl.getUniformLocation(prog, n); });

    var src = this.opts.sources;
    return Promise.all([
      loadFirst(src.painting), loadFirst([src.sky]), loadFirst([src.sea]), loadFirst([src.mask]), loadFirst([src.noise]), loadFirst([src.blur])
    ]).then(function (imgs) {
      if (gl.isContextLost()) throw new Error('WebGL context lost');
      self.imageSize = [imgs[0].naturalWidth, imgs[0].naturalHeight];
      self.tex = [
        self._texture(imgs[0], 0, false, false),
        self._texture(imgs[1], 1, true, false),
        self._texture(imgs[2], 2, true, false),
        self._texture(imgs[3], 3, true, false),
        self._texture(imgs[4], 4, true, true),
        self._texture(imgs[5], 5, false, false)
      ];
      gl.uniform1i(self.u.uImage, 0); gl.uniform1i(self.u.uSky, 1); gl.uniform1i(self.u.uSea, 2);
      gl.uniform1i(self.u.uMask, 3); gl.uniform1i(self.u.uNoise, 4); gl.uniform1i(self.u.uBlur, 5);
      gl.uniform1f(self.u.uAspect, META.aspect);
      gl.uniform1f(self.u.uHorizon, META.horizon);
      var stars = new Float32Array(11 * 4);
      META.stars.forEach(function (s, i) { stars.set([s.x, s.y, s.core, s.halo], i * 4); });
      gl.uniform4fv(self.u.uStars, stars);
      gl.uniform4f(self.u.uMoon, META.moon.x, META.moon.y, META.moon.core, META.moon.halo);
      self.resize();
      self._draw();
      if (gl.getError() !== gl.NO_ERROR) throw new Error('WebGL draw error');
      self.ready = true;
      canvas_onLost(self);
      return self;
    });
  };

  function canvas_onLost(self) {
    self.canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      self.stop();
      if (self.opts.onContextLost) self.opts.onContextLost();
    }, false);
  }

  Painting.prototype._texture = function (img, unit, data, repeat) {
    var gl = this.gl;
    var t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, data ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    var wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  };

  // Where to anchor the crop so the important parts of the painting stay in view.
  Painting.focalFor = function (w, h) {
    var a = w / h, ia = META.aspect;
    if (a < ia) {           // narrower than the painting: crop the sides, keep the figure + bright star
      var k = Math.min(1, Math.max(0, (a - 0.46) / (ia - 0.46)));
      return { x: 0.2 + 0.3 * k, y: 0.5 };
    }
    return { x: 0.5, y: 0.18 }; // wider: crop top/bottom, keep the moon and stars
  };

  Painting.coverMap = function (cw, ch, focal) {
    var ia = META.aspect;
    var s = Math.max(cw / ia, ch); // displayed image height
    var dh = s, dw = s * ia;
    return [(cw - dw) * focal.x, (ch - dh) * focal.y, dw, dh];
  };

  Painting.prototype.resize = function () {
    var c = this.canvas;
    var cssW = c.clientWidth || window.innerWidth, cssH = c.clientHeight || window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, this.opts.maxDpr || 1.75) * this.quality * this.budget.scale;
    var w = Math.max(2, Math.round(cssW * dpr)), h = Math.max(2, Math.round(cssH * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.cssSize = [cssW, cssH];
    this.focal = Painting.focalFor(cssW, cssH);
    this._applyMap();
  };

  // Camera: zoom z around image point (cx, cy) placed at the screen centre, always covering the screen.
  Painting.viewMap = function (w, h, focal, view) {
    var base = Painting.coverMap(w, h, focal);
    if (!view) return base;
    var dw = base[2] * view.z, dh = base[3] * view.z;
    var ox = w / 2 - view.cx * dw, oy = h / 2 - view.cy * dh;
    ox = Math.min(0, Math.max(w - dw, ox)); oy = Math.min(0, Math.max(h - dh, oy));
    return [ox, oy, dw, dh];
  };
  // The hero framing expressed as a camera, so other views can be blended with it.
  Painting.heroView = function (w, h) {
    var m = Painting.coverMap(w, h, Painting.focalFor(w, h));
    return { z: 1, cx: (w / 2 - m[0]) / m[2], cy: (h / 2 - m[1]) / m[3] };
  };

  Painting.prototype._applyMap = function () {
    var c = this.canvas, gl = this.gl;
    this.map = Painting.viewMap(c.width, c.height, this.focal, this.view);
    this.cssMap = Painting.viewMap(this.cssSize[0], this.cssSize[1], this.focal, this.view);
    if (gl) {
      gl.viewport(0, 0, c.width, c.height);
      gl.uniform2f(this.u.uRes, c.width, c.height);
      gl.uniform4f(this.u.uMap, this.map[0], this.map[1], this.map[2], this.map[3]);
    }
  };

  Painting.prototype.setView = function (view) {
    this.view = view;
    if (this.gl && this.cssSize) this._applyMap();
    if (this.ready && !this.running) this._draw();
  };

  // Lower resolution / frame rate while the painting sits behind a dark veil.
  Painting.prototype.setBudget = function (scale, fps) {
    var changed = scale !== this.budget.scale;
    this.budget = { scale: scale, fps: fps };
    if (changed && this.gl) { this.resize(); if (this.ready && !this.running) this._draw(); }
  };

  // Image-normalised point -> CSS pixel position inside the canvas (for star hotspots)
  Painting.prototype.toScreen = function (x, y) {
    var m = this.cssMap || Painting.coverMap(window.innerWidth, window.innerHeight, Painting.focalFor(window.innerWidth, window.innerHeight));
    return { x: m[0] + x * m[2], y: m[1] + y * m[3], scale: m[2] };
  };

  Painting.prototype.setMouse = function (x, y) { this.mouseTarget = [x, y]; };
  Painting.prototype.setScroll = function (v) { this.scroll = v; if (!this.running && this.ready) this._draw(); };
  Painting.prototype.skipIntro = function () { this.intro = 1; this.introStart = -1e9; };

  Painting.prototype._draw = function () {
    var gl = this.gl, u = this.u;
    gl.uniform1f(u.uFlowT, this.flowT);
    gl.uniform1f(u.uClock, this.clock);
    gl.uniform1f(u.uIntro, this.intro);
    gl.uniform1f(u.uScroll, this.scroll);
    gl.uniform2f(u.uMouse, this.mouse[0], this.mouse[1]);
    gl.uniform4f(u.uParams, this.params[0], this.params[1], this.params[2], this.params[3]);
    gl.uniform4f(u.uFx, this.fx[0], this.fx[1], this.fx[2], this.fx[3]);
    // each star twinkles at its own pace (computed here once per frame, not per pixel)
    var t = this.clock, tw = this._tw || (this._tw = new Float32Array(22));
    for (var i = 0; i < 11; i++) {
      tw[i * 2] = 0.5 + 0.5 * Math.sin(t * (0.55 + ((i * 0.618) % 1) * 0.8) + i * 2.3);
      tw[i * 2 + 1] = 0.5 + 0.5 * Math.sin(t * (1.3 + ((i * 0.381) % 1) * 1.1) + i * 1.1);
    }
    gl.uniform2fv(u.uTwinkle, tw);
    // the two spirals wind and unwind slowly, in opposite senses and out of step
    var amp = this.intro * 0.05;
    gl.uniform4f(u.uSpiral1, 545 / 1024, 212 / 765, amp * Math.sin(this.flowT * 0.21), 0.13);
    gl.uniform4f(u.uSpiral2, 735 / 1024, 292 / 765, -amp * 0.8 * Math.sin(this.flowT * 0.27 + 1.3), 0.085);
    gl.uniform1f(u.uMoonPulse, 0.5 + 0.5 * Math.sin(t * 0.33));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Render one deterministic frame at a given time (used for stills, reduced motion and tests).
  Painting.prototype.renderAt = function (seconds, intro) {
    this.clock = seconds;
    this.flowT = seconds;
    this.intro = intro == null ? 1 : intro;
    this.mouse = this.mouseTarget.slice();
    this._draw();
  };

  Painting.prototype.start = function () {
    if (this.running || !this.ready) return;
    this.running = true;
    this._last = performance.now();
    this._raf = requestAnimationFrame(this._frame);
  };

  Painting.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this._raf);
  };

  Painting.prototype._frame = function (now) {
    if (!this.running) return;
    var dt = Math.min(0.1, (now - this._last) / 1000);
    this._last = now;
    var dur = this.opts.introDuration || 0;
    if (this.introStart === null) this.introStart = now;
    if (dur > 0 && this.intro < 1) this.intro = Math.min(1, (now - this.introStart) / 1000 / dur);
    // the sky and sea start moving during the second half of the intro
    var flowSpeed = smooth(0.45, 1.0, this.intro);
    this.clock += dt;
    this.flowT += dt * flowSpeed;
    this.mouse[0] += (this.mouseTarget[0] - this.mouse[0]) * Math.min(1, dt * 2.2);
    this.mouse[1] += (this.mouseTarget[1] - this.mouse[1]) * Math.min(1, dt * 2.2);
    if (this.visible && (this.budget.fps >= 60 || now - this._lastDraw >= 1000 / this.budget.fps - 4)) {
      this._lastDraw = now;
      this._draw();
      if (this.budget.fps >= 60) this._adapt(dt);
    }
    if (this.opts.onFrame) this.opts.onFrame(this);
    this._raf = requestAnimationFrame(this._frame);
  };

  // Lower the internal resolution on slow devices so the animation stays smooth.
  Painting.prototype._adapt = function (dt) {
    var ft = this.frameTimes;
    ft.push(dt);
    if (ft.length < 90) return;
    var avg = ft.reduce(function (a, b) { return a + b; }, 0) / ft.length;
    ft.length = 0;
    if (avg > 1 / 40 && this.quality > 0.5) { this.quality = Math.max(0.5, this.quality - 0.15); this.resize(); }
    else if (avg < 1 / 57 && this.quality < 1) { this.quality = Math.min(1, this.quality + 0.1); this.resize(); }
    // still under ~18 fps at the lowest quality, twice in a row: hand over to the still painting
    this._slow = (avg > 1 / 18 && this.quality <= 0.5) ? (this._slow || 0) + 1 : 0;
    if (this._slow >= 2 && this.opts.onTooSlow) { this.stop(); this.opts.onTooSlow(); }
  };

  Painting.META = META;
  window.RJY = window.RJY || {};
  window.RJY.Painting = Painting;
})();
