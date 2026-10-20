/*
 * painting.js — the living painting.
 *
 * Renders the Starry Night ocean artwork with WebGL and animates it in place:
 *  - the sky flows along its own brushstrokes (a flow map computed from the painting's
 *    structure tensor, so motion follows the painted curves, spirals and star halos)
 *  - the ocean has its own field: strokes drift along the foam, and swells roll toward the viewer
 *  - the person, driftwood, rocks, horizon and headland are masked out and never move
 *  - every star (and the moon) is alive: its golden strokes swirl slowly around its centre, it
 *    pulses at its own pace and now and then flares
 *  - interactive stars respond to the visitor: as the cursor approaches, the star's light and the
 *    surrounding strokes lean toward it (the star stays anchored); on hover the star itself grows
 *    ~12%, swirls faster, breathes, glows and sends a small ripple through the sky around it
 *  - a star can open a portal: it flares, spirals open, the view flies into it while the painted
 *    currents stream past, and the night of the destination section appears
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
  // All lights: the 11 stars, then the moon (index 11).
  var LIGHTS = META.stars.concat([META.moon]);
  var MOON = 11;
  // The direction each light's strokes are painted to swirl (+1 clockwise on screen).
  var SENSE = [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1];
  // Radius of the area a light's effects reach (the moon's halo is huge; use its disc instead).
  function effectRadius(i) { return i === MOON ? LIGHTS[i].core * 1.15 : LIGHTS[i].halo; }

  var VERT = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';

  function f(n) { return (+n).toFixed(6); }

  // Per-light warp: lens, ripple and magnetic pull, then remember the light whose halo we're in.
  // the light's pull toward the pointer: (approach × direction to the pointer), worked out in JS
  function pullVec(i) { return 'vec2(uSF[' + i + '].y,uSD[' + (i >> 2) + '].' + 'xyzw'.charAt(i & 3) + ')'; }

  function warpBlock(i) {
    var s = LIGHTS[i], E = effectRadius(i);
    return [
      '  {',
      '    vec2 c=vec2(' + f(s.x) + ',' + f(s.y) + ');',
      '    vec2 d=(uvS-c)*vec2(1.0,1.0/uAspect); float r2=dot(d,d);',
      '    if(r2<' + f(E * E * 2.3 * 2.3) + '){',
      '      float r=sqrt(r2); vec4 fx=uSF[' + i + ']; vec4 gx=uSG[' + i + '];',
      '      vec2 nd=d*(1.0-(0.12*fx.x+gx.w)*ss(' + f(E * 1.3) + ',' + f(E * 0.55) + ',r));',
      // hovered: a ripple runs through the sky around the star
      '      if(fx.x>0.002){',
      '        float ring=ss(' + f(E * 0.8) + ',' + f(E * 1.3) + ',r)*ss(' + f(E * 2.3) + ',' + f(E * 1.5) + ',r);',
      '        nd-=(r>1e-5?d/r:vec2(0.0))*ring*fx.x*' + f(E * 0.05) + '*sin(r*' + f(9.0 / E) + '-uClock*3.0);',
      '      }',
      // the pointer is near: the strokes lean toward it, the centre stays put
      '      vec2 pv=' + pullVec(i) + ';',
      '      if(dot(pv,pv)>1e-7) nd-=pv*' + f(E * 0.10) + '*ss(0.0,' + f(E * 0.7) + ',r)*ss(' + f(E * 2.2) + ',' + f(E * 1.0) + ',r);',
      '      uvS+=(nd-d)*vec2(1.0,uAspect)*skyW;',
      '      if(r<' + f(E * 1.25) + '){zc=c;zr=' + f(E) + ';zamp=fx.w;zph=fx.z;zw=ss(' + f(E * 1.25) + ',' + f(E * 0.95) + ',r)*skyW;}',
      '    }',
      '  }'
    ].join('\n');
  }

  // Per-light glow: halo + core pulse, extra light when hovered or flaring, leaning toward the cursor.
  function glowBlock(i) {
    var s = LIGHTS[i], cy = s.y / META.aspect;
    if (i === MOON) {
      return [
        '  {',
        '    vec4 fx=uSF[' + i + ']; vec4 gx=uSG[' + i + '];',
        '    vec2 c=vec2(' + f(s.x) + ',' + f(cy) + ')-sp+' + pullVec(i) + '*' + f(s.core * 0.12) + ';',
        '    float md=length(q-c);',
        '    if(md<' + f(s.halo * 2.6) + '){',
        '      float b=1.0+0.9*fx.x+gx.z;',
        '      glow+=vec3(1.0,0.86,0.50)*exp(-(md*md)/' + f(s.halo * s.halo * 0.9) + ')*(0.05+0.04*gx.x)*b',
        '           +vec3(1.0,0.80,0.40)*exp(-(md*md)/' + f(s.halo * s.halo * 2.2) + ')*(0.08*fx.x+0.06*gx.z);',
        '      sm=max(sm,ss(' + f(s.core * 1.05) + ',' + f(s.core * 0.7) + ',md));',
        '    }',
        '  }'
      ].join('\n');
    }
    return [
      '  {',
      '    vec4 fx=uSF[' + i + ']; vec4 gx=uSG[' + i + '];',
      '    vec2 c=vec2(' + f(s.x) + ',' + f(cy) + ')-sp+' + pullVec(i) + '*' + f(s.halo * 0.14) + ';',
      '    vec2 dv=q-c; float d2=dot(dv,dv);',
      '    if(d2<' + f(s.halo * s.halo * 9.0) + '){',
      '      float b=1.0+0.95*fx.x+gx.z;',
      '      float h=exp(-d2/' + f(s.halo * s.halo * 0.55) + ');',
      '      float k=exp(-d2/' + f(s.core * s.core * 0.9) + ');',
      '      glow+=vec3(1.0,0.80,0.36)*h*(0.05+0.11*gx.x)*b+vec3(1.0,0.95,0.80)*k*(0.04+0.10*gx.y)*b;',
      // the wide golden halo opens only while the star is hovered, flaring or opening a portal
      '      float wk=0.09*fx.x+0.07*gx.z;',
      '      if(wk>0.0002) glow+=vec3(1.0,0.76,0.36)*exp(-d2/' + f(s.halo * s.halo * 2.8) + ')*wk;',
      '      sm=max(sm,k);',
      '    }',
      '  }'
    ].join('\n');
  }

  // The lights grouped by where they sit. Each group is wrapped in one bounding-box test, so a pixel
  // only works through the few lights whose effects could reach it (most of the sky reaches none).
  var GROUPS = [[9, 0, 8], [1, 5, 2, 7], [10, 3], [4, 6], [MOON]];
  function grouped(v, reach, block) {
    return GROUPS.map(function (g) {
      var x0 = 9, x1 = -9, y0 = 9, y1 = -9;
      g.forEach(function (i) {
        var s = LIGHTS[i], R = reach(i) + 0.012;   // margin for the parallax and the warps before it
        x0 = Math.min(x0, s.x - R); x1 = Math.max(x1, s.x + R);
        y0 = Math.min(y0, s.y - R * META.aspect); y1 = Math.max(y1, s.y + R * META.aspect);
      });
      return '  if(' + v + '.x>' + f(x0) + '&&' + v + '.x<' + f(x1) + '&&' + v + '.y>' + f(y0) + '&&' + v + '.y<' + f(y1) + '){\n' +
        g.map(block).join('\n') + '\n  }';
    }).join('\n');
  }
  function warpReach(i) { return effectRadius(i) * 2.3; }
  function glowReach(i) { var s = LIGHTS[i]; return i === MOON ? s.halo * 2.6 + s.core * 0.12 : s.halo * 3.14; }

  // A lighter painting for slower graphics: the same flowing sky, sea and glowing stars, without the
  // stars' lens, ripple and swirl, the light running along the currents, or the portal's streaks.
  function glowLite(i) {
    var s = LIGHTS[i], cy = s.y / META.aspect, moon = i === MOON;
    return [
      '  {',
      '    vec4 fx=uSF[' + i + ']; vec4 gx=uSG[' + i + '];',
      '    vec2 dv=q-vec2(' + f(s.x) + ',' + f(cy) + ')+sp; float d2=dot(dv,dv);',
      '    if(d2<' + f(s.halo * s.halo * (moon ? 6.76 : 9.0)) + '){',
      '      float b=1.0+0.95*fx.x+gx.z;',
      moon
        ? '      glow+=vec3(1.0,0.86,0.50)*exp(-d2/' + f(s.halo * s.halo * 0.9) + ')*(0.05+0.04*gx.x)*b; sm=max(sm,ss(' + f(s.core * s.core * 1.1025) + ',' + f(s.core * s.core * 0.49) + ',d2));'
        : '      float k=exp(-d2/' + f(s.core * s.core * 0.9) + '); glow+=vec3(1.0,0.80,0.36)*exp(-d2/' + f(s.halo * s.halo * 0.55) + ')*(0.05+0.11*gx.x)*b+vec3(1.0,0.95,0.80)*k*(0.04+0.10*gx.y)*b; sm=max(sm,k);',
      '    }',
      '  }'
    ].join('\n');
  }

  function fragSource(lite) {
    return [
    'precision highp float;',
    'uniform sampler2D uImage;uniform sampler2D uSky;uniform sampler2D uSea;uniform sampler2D uMask;uniform sampler2D uNoise;uniform sampler2D uBlur;',
    'uniform vec2 uRes;uniform vec4 uMap;uniform float uAspect;uniform float uHorizon;',
    'uniform float uFlowT;uniform float uClock;uniform float uIntro;uniform float uScroll;uniform vec2 uMouse;',
    'uniform vec4 uParams;uniform vec4 uFx;uniform vec4 uSpiral1;uniform vec4 uSpiral2;',
    // per light: uSF = (hover, approach, swirl phase, swirl amplitude); uSG = (halo pulse, core pulse, flare, breath)
    // uSD packs the second component of each light's pull toward the pointer (uSF.y is the first)
    'uniform vec4 uSF[12];uniform vec4 uSG[12];uniform vec4 uSD[3];',
    // portal: uPortal = (centre x, centre y, progress, style); uPortal2 = (night amount, mix, sparkle, swirl sense)
    'uniform vec4 uPortal;uniform vec4 uPortal2;',
    'float ss(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',
    'vec2 rot(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}',
    'float hash(vec2 v){return fract(sin(dot(v,vec2(12.9898,78.233)))*43758.5453);}',
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
    // ---- portal: fly into the chosen star ----
    '  vec2 pc=uPortal.xy; float PP=uPortal.z; float PM=uPortal2.y;',
    // the camera flies toward the star: it drifts to the centre of the screen while we zoom in
    '  vec2 s0=uMap.xy+pc*uMap.zw;',
    '  vec2 scn=mix(s0,0.5*uRes,smoothstep(0.12,0.9,PP)*PM);',
    '  vec2 sd=(p-scn)/uRes.y; float sr=length(sd);',
    '  vec2 cc=(p-0.5*uRes)/uRes.y;',
    '  if(PM>0.0005){',
    '    float zt=smoothstep(0.18,1.0,PP);',
    '    uv=pc+(p-scn)/(uMap.zw*exp(2.1*zt*zt*PM));',
    '    vec2 q0=(uv-pc)*vec2(1.0,1.0/uAspect); float r0=length(q0);',
    '    q0=rot(q0,PM*smoothstep(0.06,0.7,PP)*2.8*exp(-r0/(0.02+0.2*PP))*uPortal2.w);',
    '    uv=pc+q0*vec2(1.0,uAspect);',
    // parting: the painted currents are pushed aside from the middle of the screen
    '    if(uPortal.w>0.5&&uPortal.w<1.5) uv.x-=cc.x/(abs(cc.x)+0.08)*smoothstep(0.55,1.0,PP)*0.06*PM/exp(2.1*zt*zt*PM);',
    '  }',
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
    // sky 2: stars react — magnify, ripple the sky around them, lean toward the cursor
    lite ? '' : '    vec2 zc=vec2(0.0); float zr=1.0; float zamp=0.0; float zph=0.0; float zw=0.0;',
    lite ? '' : grouped('uvS', warpReach, warpBlock),
    // sky 3: two-phase flow map — paint slides along its own brushstrokes; currents surge and calm
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
    // sky 4: inside a halo, the star's own golden strokes swirl around its centre (two-phase, never tears)
    lite ? '' : [
    '    if(zw>0.001){',
    '      vec2 L=(uvS-zc)*vec2(1.0,1.0/uAspect); float lr=length(L);',
    '      float ang=zamp*ss(zr*1.2,zr*0.2,lr);',
    '      float s0=fract(zph); float s1=fract(zph+0.5);',
    '      float ws=smoothstep(0.0,1.0,1.0-abs(1.0-2.0*s0));',
    '      vec2 A=zc+rot(L,ang*(s0-0.5))*vec2(1.0,uAspect);',
    '      vec2 B=zc+rot(L,ang*(s1-0.5))*vec2(1.0,uAspect);',
    '      col=mix(col,blend2(img(A),img(B),ws,uvS,lr*abs(ang)*0.5),zw);',
    '    }',
    // sky 5: light running along the currents, strongest on the pale strokes
    '    float lt=uFlowT/3.0+nz.g*2.0; float q0=fract(lt); float q1=fract(lt+0.5); float wq=1.0-abs(1.0-2.0*q0);',
    '    vec2 ls=uvS*vec2(2.6,2.0);',
    '    float n0=texture2D(uNoise,ls-f*2.2*(q0-0.5)).g; float n1=texture2D(uNoise,ls-f*2.2*(q1-0.5)).g;',
    '    float lum=dot(col,vec3(0.3,0.5,0.2));',
    '    col*=1.0+(mix(n1,n0,wq)-0.5)*0.22*smoothstep(0.25,0.75,lum)*skyW*uFx.w;'
    ].join('\n'),
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
    // stars & moon: stay in place, glow and pulse at their own pace, brighter when hovered or flaring
    '  vec2 q=vec2(uv.x,uv.y/uAspect);',
    '  vec2 sp=vec2(par.x,par.y/uAspect);',
      '  vec3 glow=vec3(0.0); float sm=0.0;',
    grouped('uv', glowReach, lite ? glowLite : glowBlock),
    '  float ist=smoothstep(0.25,0.75,uIntro);',
    '  col*=1.0-(1.0-ist)*0.55*sm;',
    '  glow*=ist*uParams.w;',
    '  col=1.0-(1.0-col)*(1.0-glow);',
    // ---- portal: currents stream past, light floods out, then the destination's night opens ----
    '  if(PM>0.0005){',
    '    float st=PM*smoothstep(0.14,0.5,PP)*(1.0-0.5*smoothstep(0.82,1.0,PP));',
    lite ? '' : [
    '    if(st>0.002){',
    '      vec3 acc=col; float jt=hash(p)*0.9;',
    '      for(int k=1;k<7;k++){acc+=img(pc+(uv-pc)*(1.0-st*0.2*(float(k)+jt)/6.6));}',
    '      col=mix(col,acc/7.0,min(1.0,st*1.3));',
    '    }'
    ].join('\n'),
    '    float R=mix(0.02,1.2,smoothstep(0.04,0.8,PP));',
    '    col+=vec3(1.0,0.83,0.46)*exp(-sr*sr/(R*R*0.3))*PM*smoothstep(0.0,0.28,PP)*(1.0-smoothstep(0.5,0.9,PP))*0.9;',
    '    col=mix(col,col*vec3(0.85,0.92,1.15),PM*smoothstep(0.3,0.8,PP)*0.5);',
    '    float tt=smoothstep(0.56,1.0,PP);',
    // the edge of the opening is painterly: swirling strokes around the star, vertical strokes for the parting
    '    float an=atan(sd.y,sd.x+1e-5)/6.2832;',
    '    float ns=texture2D(uNoise,vec2(an*2.0+sr*0.7,sr*3.0)).r*0.6+texture2D(uNoise,vec2(an*7.0+sr*1.5,sr*8.0)).g*0.4;',
    '    float nb=texture2D(uNoise,vec2(cc.x*0.5,cc.y*1.4)+vec2(0.31,0.17)).g*0.7+texture2D(uNoise,vec2(cc.x*0.9,cc.y*4.0)+vec2(0.6,0.2)).b*0.3;',
    '    float n=texture2D(uNoise,p/uRes.y*1.6+vec2(0.13,0.41)).g;',
    '    float nv;',
    '    if(uPortal.w<0.5){float Rn=tt*3.2-0.25+(ns-0.5)*0.55;nv=ss(Rn+0.06,Rn-0.06,sr);}',
    '    else if(uPortal.w<1.5){float Rn=tt*1.9-0.15+(nb-0.5)*0.4;nv=ss(Rn+0.07,Rn-0.07,abs(cc.x));}',
    '    else{float Rn=tt*3.6-0.6+(ns-0.5)*0.3;nv=ss(Rn+0.45,Rn-0.45,sr);}',
    '    nv*=uPortal2.x*PM;',
    '    vec3 night=vec3(0.020,0.039,0.180)+(n-0.5)*0.025;',
    '    float spk=uPortal2.z*nv*(1.0-smoothstep(0.9,1.0,PP))*step(0.997,hash(floor(p/2.0)))*(0.6+0.4*sin(uClock*9.0+p.x));',
    '    col=mix(col,night,nv)+vec3(1.0,0.85,0.5)*spk;',
    '  }',
    // atmosphere: vignette, scroll dimming, intro fade, film grain
    '  vec2 sc=p/uRes-0.5;',
    '  col*=mix(1.0-0.30*uFx.z,1.0,smoothstep(0.95,0.25,length(sc*vec2(1.05,1.25))));',
    '  col*=1.0-0.38*uScroll;',
    '  col*=smoothstep(0.0,0.42,uIntro);',
    '  float g=texture2D(uNoise,p/256.0+vec2(0.37,0.71)*floor(uClock*24.0)).b;',
    '  col+=(g-0.5)*0.035*uFx.x;',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
    ].filter(function (line) { return line !== ''; }).join('\n');
  }

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
  // small deterministic random, so each star keeps its own character between visits
  function seeded(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /**
   * new Painting(canvas, options)
   * options.sources: { painting: [urls], sky, sea, mask, noise, blur }
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
    this.gentle = false;          // reduced motion: a slower, calmer painting (see setGentle)
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
    // every light has its own pace and character
    this.lights = LIGHTS.map(function (s, i) {
      return {
        h: 0, ht: 0, a: 0,
        phase: seeded(i + 1),
        speed: (0.20 + 0.22 * seeded(i + 21)) * SENSE[i],
        ampIdle: 0.08 + 0.07 * seeded(i + 41),
        breathF: 1.5 + 1.0 * seeded(i + 61), breathP: seeded(i + 81) * 6.283,
        flare: 0, flareStart: -1
      };
    });
    this.interactive = [];
    this.cursor = null;           // image coordinates of the pointer, or null
    this.portalState = null;
    this.nextFlare = 5 + 4 * Math.random();
    this._sf = new Float32Array(48);
    this._sg = new Float32Array(48);
    this._sd = new Float32Array(12);
    this._raf = 0;
    this._last = 0;
    this._frame = this._frame.bind(this);
  }

  var UNIFORMS = ['uImage', 'uSky', 'uSea', 'uMask', 'uNoise', 'uBlur', 'uRes', 'uMap', 'uAspect', 'uHorizon', 'uFlowT', 'uClock', 'uIntro', 'uScroll', 'uMouse',
    'uParams', 'uFx', 'uSpiral1', 'uSpiral2', 'uSF', 'uSG', 'uSD', 'uPortal', 'uPortal2'];

  Painting.prototype.init = function () {
    try { return this._init(); } catch (e) { return Promise.reject(e); }
  };
  Painting.prototype._init = function () {
    var self = this, gl;
    var attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: !!this.opts.preserveDrawingBuffer, powerPreference: 'high-performance' };
    try { gl = this.canvas.getContext('webgl', attrs) || this.canvas.getContext('experimental-webgl', attrs); } catch (e) { gl = null; }
    if (!gl) return Promise.reject(new Error('WebGL unavailable (graphics acceleration may be off in this browser)'));
    var dbg = gl.getExtension('WEBGL_debug_renderer_info');
    var renderer = this.renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    if (!this.opts.allowSoftware && /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
      return Promise.reject(new Error('Software WebGL (' + renderer + ')'));
    }
    this.gl = gl;
    var hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    this._highp = !!(hp && hp.precision > 0);
    this._progs = {};

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // the full painting, or straight to the lighter one if this device can't build it
    try { this._use(!!this.opts.lite); } catch (e) {
      if (this.opts.lite) throw e;
      console.info('Using the lighter painting: ' + (e && e.message));
      this._use(true);
    }

    var src = this.opts.sources;
    return Promise.all([
      loadFirst(src.painting), loadFirst([src.sky]), loadFirst([src.sea]), loadFirst([src.mask]), loadFirst([src.noise]), loadFirst([src.blur])
    ]).then(function (imgs) {
      if (gl.isContextLost()) throw new Error('WebGL context lost');
      self.imageSize = [imgs[0].naturalWidth, imgs[0].naturalHeight];
      self._imgs = imgs;           // kept to rebuild the textures if the graphics context is lost and restored
      self._textures();
      self.resize();
      self._updateLights(0);
      self._draw();
      if (gl.getError() !== gl.NO_ERROR) throw new Error('WebGL draw error');
      self.ready = true;
      canvas_onLost(self);
      return self;
    });
  };

  // Build (once) and switch to the full or the lite program.
  Painting.prototype._program = function (lite) {
    var key = lite ? 'lite' : 'full';
    if (this._progs[key]) return this._progs[key];
    var gl = this.gl, prog = gl.createProgram(), src = fragSource(!!lite);
    if (!this._highp) src = src.replace('precision highp float;', 'precision mediump float;');
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, src));
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('Program link failed: ' + gl.getProgramInfoLog(prog));
    var u = {};
    UNIFORMS.forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });
    gl.useProgram(prog);
    gl.uniform1i(u.uImage, 0); gl.uniform1i(u.uSky, 1); gl.uniform1i(u.uSea, 2);
    gl.uniform1i(u.uMask, 3); gl.uniform1i(u.uNoise, 4); gl.uniform1i(u.uBlur, 5);
    gl.uniform1f(u.uAspect, META.aspect);
    gl.uniform1f(u.uHorizon, META.horizon);
    return (this._progs[key] = { prog: prog, u: u });
  };
  Painting.prototype._use = function (lite) {
    var P = this._program(lite);
    this.gl.useProgram(P.prog);
    this.prog = P.prog; this.u = P.u; this.lite = !!lite;
    if (this.cssSize) this._applyMap();
  };

  // A graphics context can be lost (a driver reset, waking from sleep). Ask for it back and rebuild.
  function canvas_onLost(self) {
    self.canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      self.stop();
      self.ready = false;
      if (self.opts.onContextLost) self.opts.onContextLost();
    }, false);
    self.canvas.addEventListener('webglcontextrestored', function () {
      try {
        var gl = self.gl, lite = self.lite;
        self._progs = {};
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        self._use(lite);
        self._textures();
        self.resize();
        self._updateLights(0);
        self._draw();
        self.ready = true;
        if (self.opts.onRestored) self.opts.onRestored();
      } catch (err) { console.info('The painting could not be restored: ' + (err && err.message)); }
    }, false);
  }

  Painting.prototype._textures = function () {
    var imgs = this._imgs;
    this.tex = [
      this._texture(imgs[0], 0, false, false),
      this._texture(imgs[1], 1, true, false),
      this._texture(imgs[2], 2, true, false),
      this._texture(imgs[3], 3, true, false),
      this._texture(imgs[4], 4, true, true),
      this._texture(imgs[5], 5, false, false)
    ];
  };

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
    this._redraw();
  };
  // When the painting is not animating (reduce motion, a still frame), changes are drawn once on
  // the next frame, however many arrive together (scrolling sets the view, the dimming and the budget).
  Painting.prototype._redraw = function () {
    if (!this.ready || this.running || this._redrawQueued) return;
    var self = this;
    this._redrawQueued = true;
    requestAnimationFrame(function () {
      self._redrawQueued = false;
      if (self.ready && !self.running && self.gl && !self.gl.isContextLost()) self._draw();
    });
  };

  // Lower resolution / frame rate while the painting sits behind a dark veil.
  Painting.prototype.setBudget = function (scale, fps) {
    var changed = scale !== this.budget.scale;
    this.budget = { scale: scale, fps: fps };
    if (changed && this.gl) { this.resize(); this._redraw(); }
  };

  // Image-normalised point -> CSS pixel position inside the canvas
  Painting.prototype.toScreen = function (x, y) {
    var m = this.cssMap || Painting.coverMap(window.innerWidth, window.innerHeight, Painting.focalFor(window.innerWidth, window.innerHeight));
    return { x: m[0] + x * m[2], y: m[1] + y * m[3], scale: m[2] };
  };

  Painting.prototype.setMouse = function (x, y) { this.mouseTarget = [x, y]; };
  Painting.prototype.setScroll = function (v) { this.scroll = v; this._redraw(); };
  Painting.prototype.skipIntro = function () { this.intro = 1; this.introStart = -1e9; };
  // Calmer motion for visitors who ask their device to reduce motion: the paint keeps flowing, at
  // under half the speed, the spirals hold still, no stars flare, and a star brightens instead of
  // swelling and swirling when pointed at.
  Painting.prototype.setGentle = function (on) { this.gentle = !!on; };

  /* ---------- interaction with the stars ---------- */

  // Which lights respond to the pointer (indices into LIGHTS; 11 = moon).
  Painting.prototype.setInteractive = function (list) { this.interactive = list || []; };

  // Pointer position in CSS pixels (or null when it leaves).
  Painting.prototype.setCursor = function (x, y) {
    if (x == null) { this.cursor = null; return; }
    var m = this.cssMap;
    if (!m) return;
    this.cursor = [(x - m[0]) / m[2], (y - m[1]) / m[3]];
  };

  Painting.prototype.setHover = function (i, on) {
    var L = this.lights[i];
    if (!L) return;
    L.ht = on ? 1 : 0;
    if (!this.running && this.ready) { L.h = L.ht; this._updateLights(0); this._redraw(); }
  };

  // A light brightens for a moment; delay in seconds lets several flare in sequence.
  Painting.prototype.flare = function (i, delay) {
    var L = this.lights[i];
    if (L) L.flareStart = this.clock + (delay || 0);
  };
  Painting.prototype.flareSequence = function (list, gap) {
    var self = this;
    (list || []).forEach(function (i, k) { self.flare(i, k * (gap || 0.3)); });
  };

  /* ---------- portal ---------- */

  // Fly into light i. o: { style: 0 iris | 1 parting | 2 soft, night: 0..1, sparkle: 0..1, duration (s),
  //   coverAt: progress at which onCover fires (the screen no longer shows the start), onCover, onEnd }
  Painting.prototype.startPortal = function (i, o) {
    var s = LIGHTS[i];
    o = o || {};
    this.portalState = {
      index: i, p: 0, dur: o.duration || 1.05, style: o.style || 0, night: o.night == null ? 1 : o.night,
      sparkle: o.sparkle || 0, mix: 1, cx: s.x, cy: s.y, sense: SENSE[i],
      coverAt: o.coverAt || 0.8, onCover: o.onCover, onEnd: o.onEnd, covered: false, ended: false, fade: 0
    };
    this.lights[i].ht = 1;
  };
  // Let the portal fade away (after the destination is in place).
  Painting.prototype.endPortal = function (seconds, done) {
    var P = this.portalState;
    if (!P) { if (done) done(); return; }
    P.fade = Math.max(0.05, seconds || 0.45);
    P.fadeStart = this.clock;
    P.onDone = done;
  };

  Painting.prototype._stepPortal = function () {
    var P = this.portalState;
    if (!P) return;
    if (!P.fade) {
      if (!P.covered && P.p >= P.coverAt) { P.covered = true; if (P.onCover) P.onCover(); }
      if (!P.ended && P.p >= 1) { P.ended = true; if (P.onEnd) P.onEnd(); }
    } else {
      var t = (this.clock - P.fadeStart) / P.fade;
      P.mix = 1 - smooth(0, 1, t);
      if (t >= 1) {
        this.lights[P.index].ht = 0;
        var done = P.onDone;
        this.portalState = null;
        if (done) done();
      }
    }
  };

  // Advance every light: hover easing, cursor approach, swirl phase, flares, breathing, twinkle.
  Painting.prototype._updateLights = function (dt) {
    var P = this.portalState, t = this.clock, sf = this._sf, sg = this._sg, sd = this._sd;
    for (var i = 0; i < 12; i++) {
      var L = this.lights[i], s = LIGHTS[i], E = effectRadius(i);
      L.h += (L.ht - L.h) * Math.min(1, dt * (L.ht > L.h ? 7 : 2.4));
      var at = 0;
      if (this.cursor && this.interactive.indexOf(i) !== -1) {
        var dx = this.cursor[0] - s.x, dy = (this.cursor[1] - s.y) / META.aspect, dl = Math.sqrt(dx * dx + dy * dy);
        at = 1 - smooth(E * 1.1, E * 4.2, dl);
        if (dl > 1e-5) L.dir = [dx / dl, dy / dl];   // kept when the pointer leaves, so the lean eases back
      }
      L.a += (at - L.a) * Math.min(1, dt * 5);
      var pb = P && P.index === i ? smooth(0, 0.35, P.p) * P.mix : 0;
      L.phase += dt * L.speed * (this.gentle ? 0.5 : 1 + 2.6 * L.h + 7 * pb);
      if (L.flareStart >= 0) {
        var ft = (t - L.flareStart) / 1.8;
        if (ft >= 1) { L.flare = 0; L.flareStart = -1; } else L.flare = ft > 0 ? Math.pow(Math.sin(Math.PI * ft), 2) : 0;
      }
      var ph = L.phase - Math.floor(L.phase);
      var hv = this.gentle ? 0 : L.h;   // gentle: the hover shows as light (below), not as movement
      sf[i * 4] = Math.min(1, hv + pb);
      var dir = L.dir || [0, 0], pull = this.gentle ? 0 : L.a;
      sf[i * 4 + 1] = pull * dir[0];     // the pull toward the pointer (x); its y goes in uSD
      sd[i] = pull * dir[1];
      sf[i * 4 + 2] = ph;
      sf[i * 4 + 3] = L.ampIdle + 0.32 * hv + 0.6 * pb;
      if (i === MOON) {
        sg[i * 4] = 0.5 + 0.5 * Math.sin(t * 0.33);
        sg[i * 4 + 1] = 0;
      } else {
        sg[i * 4] = 0.5 + 0.5 * Math.sin(t * (0.55 + ((i * 0.618) % 1) * 0.8) + i * 2.3);
        sg[i * 4 + 1] = 0.5 + 0.5 * Math.sin(t * (1.3 + ((i * 0.381) % 1) * 1.1) + i * 1.1);
      }
      sg[i * 4 + 2] = 0.35 * L.flare + 1.4 * pb + (this.gentle || this.lite ? 0.9 * L.h : 0);
      sg[i * 4 + 3] = this.gentle ? 0 : 0.010 * Math.sin(t * L.breathF + L.breathP) * (0.3 + L.h) + 0.03 * L.flare;
    }
  };

  Painting.prototype._draw = function () {
    var gl = this.gl, u = this.u;
    gl.uniform1f(u.uFlowT, this.flowT);
    gl.uniform1f(u.uClock, this.clock);
    gl.uniform1f(u.uIntro, this.intro);
    gl.uniform1f(u.uScroll, this.scroll);
    gl.uniform2f(u.uMouse, this.mouse[0], this.mouse[1]);
    gl.uniform4f(u.uParams, this.params[0], this.params[1], this.params[2], this.params[3]);
    gl.uniform4f(u.uFx, this.fx[0], this.fx[1], this.fx[2], this.fx[3]);
    gl.uniform4fv(u.uSF, this._sf);
    gl.uniform4fv(u.uSG, this._sg);
    gl.uniform4fv(u.uSD, this._sd);
    var P = this.portalState;
    if (P) {
      gl.uniform4f(u.uPortal, P.cx, P.cy, P.p, P.style);
      gl.uniform4f(u.uPortal2, P.night, P.mix, P.sparkle, P.sense);
    } else {
      gl.uniform4f(u.uPortal2, 0, 0, 0, 1);
    }
    // the two spirals wind and unwind slowly, in opposite senses and out of step
    var amp = this.gentle ? 0 : this.intro * 0.05;
    gl.uniform4f(u.uSpiral1, 545 / 1024, 212 / 765, amp * Math.sin(this.flowT * 0.21), 0.13);
    gl.uniform4f(u.uSpiral2, 735 / 1024, 292 / 765, -amp * 0.8 * Math.sin(this.flowT * 0.27 + 1.3), 0.085);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Render one deterministic frame at a given time (used for stills, reduced motion and tests).
  Painting.prototype.renderAt = function (seconds, intro) {
    this.clock = seconds;
    this.flowT = seconds;
    this.intro = intro == null ? 1 : intro;
    this.mouse = this.mouseTarget.slice();
    this._updateLights(0);
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
    this.frames = (this.frames || 0) + 1;
    var dt = Math.min(0.1, (now - this._last) / 1000);
    this._last = now;
    var dur = this.opts.introDuration || 0;
    if (this.introStart === null) this.introStart = now;
    if (dur > 0 && this.intro < 1) this.intro = Math.min(1, (now - this.introStart) / 1000 / dur);
    // the sky and sea start moving during the second half of the intro
    var flowSpeed = smooth(0.45, 1.0, this.intro);
    this.clock += dt * (this.gentle ? 0.6 : 1);
    this.flowT += dt * flowSpeed * (this.gentle ? 0.45 : 1);
    this.mouse[0] += (this.mouseTarget[0] - this.mouse[0]) * Math.min(1, dt * 2.2);
    this.mouse[1] += (this.mouseTarget[1] - this.mouse[1]) * Math.min(1, dt * 2.2);
    // now and then one star shimmers a little brighter than the rest
    if (this.clock > this.nextFlare && this.intro >= 1 && !this.gentle) {
      this.flare(Math.floor(Math.random() * 12));
      this.nextFlare = this.clock + 5 + Math.random() * 7;
    }
    var P = this.portalState;
    if (P && !P.fade) P.p = Math.min(1, P.p + dt / P.dur);
    this._updateLights(dt);
    this._stepPortal();
    var portalActive = !!this.portalState;
    if (this.visible && (portalActive || this.budget.fps >= 60 || now - this._lastDraw >= 1000 / this.budget.fps - 4)) {
      this._lastDraw = now;
      this._draw();
      if (this.budget.fps >= 60 && !portalActive) this._adapt(dt);
    }
    if (this.opts.onFrame) this.opts.onFrame(this);
    this._raf = requestAnimationFrame(this._frame);
  };

  // Lower the internal resolution on slow devices so the animation stays smooth.
  // Steps, as needed: lower resolution → the lighter painting → (only if even that can't keep up) the
  // still image. Short measuring windows at first, so a slow device finds its level within seconds.
  Painting.prototype._adapt = function (dt) {
    var ft = this.frameTimes;
    ft.push(dt);
    this._windows = this._windows || 0;
    if (ft.length < (this._windows < 3 ? 24 : 80)) return;
    this._windows++;
    var avg = ft.reduce(function (a, b) { return a + b; }, 0) / ft.length;
    ft.length = 0;
    if (avg > 1 / 40 && this.quality > 0.5) {
      this.quality = Math.max(0.5, this.quality - (avg > 1 / 25 ? 0.25 : 0.12));
      this.resize();
      return;
    }
    if (avg < 1 / 57 && this.quality < 1) { this.quality = Math.min(1, this.quality + 0.1); this.resize(); return; }
    if (avg > 1 / 28 && this.quality <= 0.5 && !this.lite) {
      try { this._use(true); this.quality = 0.75; this.resize(); this._slow = 0; return; } catch (e) { /* fall through */ }
    }
    // still under ~16 fps at the lowest quality of the lighter painting, twice in a row: hand over to the still image
    this._slow = (avg > 1 / 16 && this.quality <= 0.5 && this.lite) ? (this._slow || 0) + 1 : 0;
    if (this._slow >= 2 && this.opts.onTooSlow) { this.stop(); this.opts.onTooSlow(); }
  };

  Painting.META = META;
  Painting.LIGHTS = LIGHTS;
  Painting.MOON = MOON;
  Painting.effectRadius = effectRadius;
  window.RJY = window.RJY || {};
  window.RJY.Painting = Painting;
})();
