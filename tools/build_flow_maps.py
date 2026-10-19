#!/usr/bin/env python3
"""
build_flow_maps.py — regenerate the motion maps behind the living painting.

The homepage animates the painting with three small images in assets/painting/:
  flow-sky.png  R,G = direction the sky paint flows (along its brushstrokes), B = where the sky is
  flow-sea.png  R,G = direction the ocean strokes drift,                     B = where the sea is
  masks.png     R = driftwood/rocks (light shimmer only), G = foam, B = golden reflections

How it works: a colour structure tensor measures the direction of the brushstrokes at every pixel.
Those directions are oriented to follow the painting's large-scale currents (the two spirals, the
halos around each star and the moon, the flowing bands), smoothed, and given a speed that is slow in
the spiral's eye, zero at star cores and faster in the outer currents. The seated figure, driftwood,
rocks, headland and the horizon are masked out so they never move.

Everything below is tuned to THIS painting (coordinates are pixels in the 1024 x 765 original).
If you replace the painting, update STARS / MOON / SPIRALS / HORIZON and the polygons, then run:

    pip install numpy opencv-python-headless pillow
    python3 tools/build_flow_maps.py tools/source/painting-original.jpg assets/painting/

and update the star/moon list at the top of assets/js/painting.js to match.
"""
import sys, pathlib
import numpy as np, cv2
from PIL import Image


def orientation_field(im, sigma_g=1.0, sigma_t=6.0):
    """Return stroke direction angle phi (along strokes) and coherence from color structure tensor."""
    f = cv2.GaussianBlur(im, (0,0), sigma_g)
    Jxx = np.zeros(im.shape[:2], np.float32); Jxy = Jxx.copy(); Jyy = Jxx.copy()
    for c in range(3):
        gx = cv2.Scharr(f[...,c], cv2.CV_32F, 1, 0)/32.0
        gy = cv2.Scharr(f[...,c], cv2.CV_32F, 0, 1)/32.0
        Jxx += gx*gx; Jxy += gx*gy; Jyy += gy*gy
    Jxx = cv2.GaussianBlur(Jxx,(0,0),sigma_t); Jxy = cv2.GaussianBlur(Jxy,(0,0),sigma_t); Jyy = cv2.GaussianBlur(Jyy,(0,0),sigma_t)
    theta = 0.5*np.arctan2(2*Jxy, Jxx-Jyy)  # dominant gradient direction
    phi = theta + np.pi/2                    # along-stroke direction
    tr = Jxx+Jyy; det = np.sqrt(((Jxx-Jyy)/2)**2 + Jxy**2)
    l1 = tr/2+det; l2 = tr/2-det
    coh = ((l1-l2)/(l1+l2+1e-8))**2
    return phi.astype(np.float32), coh.astype(np.float32)


def warm_regions(im):
    """Driftwood and rocks are the only warm (red > blue) areas below the horizon."""
    H, W = im.shape[:2]
    R, B = im[..., 0], im[..., 2]
    warm = cv2.GaussianBlur(R - B, (0, 0), 2)
    wm = (warm > -0.03).astype(np.uint8)
    wm[:400] = 0
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    closed = cv2.morphologyEx(wm, cv2.MORPH_CLOSE, k)
    n, lab, stats, cent = cv2.connectedComponentsWithStats(closed, 8)
    keep = np.zeros_like(closed)
    for i in range(1, n):
        if stats[i, 4] > 3000:
            keep[lab == i] = 1
    return keep


# ---- hand-traced shapes that must never move (pixels in the 1024 x 765 original) ----
person = [(282,303),(296,305),(305,313),(307,330),(303,346),(308,354),(322,357),(337,363),(347,375),(353,391),(357,407),(361,430),(363,455),(362,480),(357,493),(349,499),(347,511),(330,515),(300,516),(262,515),(250,513),(231,511),(235,497),(240,470),(240,430),(242,405),(245,385),(251,370),(261,360),(267,353),(261,345),(257,334),(257,318),(263,309),(272,304)]
wood = [(0,540),(40,536),(90,530),(140,524),(190,517),(228,510),(250,512),(300,513),(345,508),(370,500),(385,478),(398,458),(412,448),(430,440),(452,438),(472,440),(492,436),(515,434),(540,438),(560,446),(585,458),(610,468),(635,480),(650,494),(652,510),(640,520),(600,528),(560,533),(520,536),(470,540),(420,548),(380,556),(330,566),(280,575),(230,584),(180,594),(130,604),(80,616),(40,626),(0,636)]
rockpoly = [(725,590),(760,582),(800,568),(840,555),(880,540),(920,527),(960,512),(1000,500),(1024,492),(1024,642),(980,640),(940,636),(900,630),(860,622),(820,614),(780,606),(740,602)]
stick = [(598,596),(625,592),(662,596),(664,604),(630,608),(598,606)]
headland = [(846,390),(858,378),(874,367),(890,354),(904,347),(918,343),(930,333),(942,325),(955,319),(968,319),(980,323),(992,319),(1008,315),(1024,311),(1024,392)]
hills = [(0,338),(40,335),(90,337),(140,341),(190,345),(240,351),(262,356),(258,378),(0,378)]


def build_masks(im):
    H, W = im.shape[:2]
    def poly_mask(pts):
        m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, [np.array(pts, np.int32)], 1); return m
    P = poly_mask(person)
    auto = warm_regions(im)
    # fill holes in auto mask
    ff = auto.copy(); h,w = ff.shape; m2 = np.zeros((h+2,w+2),np.uint8)
    inv = (1-ff).astype(np.uint8); cv2.floodFill(inv, m2, (0,H-1), 0)
    auto_f = np.maximum(auto, inv)
    Wd = np.maximum(poly_mask(wood), auto_f*(np.arange(W)[None,:] < 700))  # left log
    Rk = np.maximum(np.maximum(auto_f*(np.arange(W)[None,:] >= 700), poly_mask(stick)), poly_mask(rockpoly))
    Hd = poly_mask(headland); Hl = poly_mask(hills)
    strip = np.zeros((H,W),np.uint8); strip[369:384,:] = 1
    k3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7))
    P = cv2.dilate(P,k3); Wd = cv2.dilate(Wd,k3); Rk = cv2.dilate(Rk,k3)
    k5 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(11,11))
    Wd = cv2.morphologyEx(Wd, cv2.MORPH_CLOSE, k5); Rk = cv2.morphologyEx(Rk, cv2.MORPH_CLOSE, k5)
    stable = np.clip(P+Wd+Rk+Hd+Hl+strip,0,1)
    yy = np.arange(H)[:,None]*np.ones((1,W))
    sky = ((yy < 369) & (stable==0)).astype(np.uint8)
    sea = ((yy >= 384) & (stable==0)).astype(np.uint8)
    return dict(person=P, wood=Wd, rock=Rk, headland=Hd, hills=Hl, strip=strip, stable=stable, sky=sky, sea=sea)


def main(src, out_dir):
    out_dir = pathlib.Path(out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(src).convert('RGB')
    if img.size != (1024, 765):
        img = img.resize((1024, 765), Image.LANCZOS)
    im = np.asarray(img).astype(np.float32) / 255
    H, W, _ = im.shape
    M = build_masks(im)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

    # ---------------- features of the painting (image pixel coords, 1024x765) ----------------
    # (cx, cy, core_r, halo_r, rotation sense)  sense +1 = clockwise on screen (top moves right)
    STARS = [
        (117, 24, 18, 48, +1), (251, 15, 9, 26, -1), (371, 18, 10, 34, +1), (441, 35, 11, 27, -1),
        (650, 48, 18, 46, +1), (257, 107, 22, 44, -1), (744, 141, 12, 42, +1), (355, 202, 9, 28, -1),
        (147, 301, 20, 37, +1), (50, 284, 9, 22, -1), (385, 329, 17, 58, +1),
    ]
    MOON = (928, 107, 72, 118, -1)
    SPIRALS = [  # cx, cy, sense, radius, strength
        (545, 212, +1, 118, 2.4),
        (735, 292, -1, 80, 2.4),
    ]

    def normalize(v, eps=1e-6):
        n = np.linalg.norm(v, axis=-1, keepdims=True)
        return v / np.maximum(n, eps), n[...,0]

    def vortex(cx, cy, sense, R, k):
        dx, dy = xx - cx, yy - cy
        r = np.sqrt(dx*dx + dy*dy) + 1e-3
        t = np.stack([-dy/r, dx/r], -1) * sense
        w = k * np.exp(-(r/R)**2)
        return t, w, r

    def norm_blur(v, mask, sigma):
        m = mask.astype(np.float32)
        num = np.stack([cv2.GaussianBlur(v[...,i]*m, (0,0), sigma) for i in range(v.shape[-1])], -1)
        den = cv2.GaussianBlur(m, (0,0), sigma)[...,None]
        return num / np.maximum(den, 1e-4)

    def orient(d, G):
        s = np.sign((d*G).sum(-1)); s[s == 0] = 1
        return d * s[...,None]

    phi, coh = orientation_field(im, 1.0, 5.0)
    d = np.stack([np.cos(phi), np.sin(phi)], -1).astype(np.float32)

    # ---------------- SKY ----------------
    def sky_vortex_terms():
        T = np.zeros((H, W, 2), np.float32)
        for (cx, cy, s, R, k) in SPIRALS:
            t, w, _ = vortex(cx, cy, s, R, k); T += t * w[...,None]
        for (cx, cy, rc, rh, s) in STARS:
            t, w, _ = vortex(cx, cy, s, rh*1.15, 3.0); T += t * w[...,None]
        cx, cy, rc, rh, s = MOON
        t, w, _ = vortex(cx, cy, s, rh*1.1, 2.2); T += t * w[...,None]
        return T

    base = np.zeros((H, W, 2), np.float32); base[...,0] = 1.0
    VT = sky_vortex_terms()
    G, _ = normalize(base + VT)
    skyR = M['sky'] > 0
    v = orient(d, G)
    for it in range(2):
        Gs = norm_blur(v, skyR, 16)
        G, _ = normalize(Gs + 0.8*VT + 0.25*base)
        v = orient(d, G)
    c2 = np.clip(coh*1.6, 0, 1)[...,None]
    v = c2*v + (1-c2)*G
    v = norm_blur(v, skyR, 2.5)          # cancels sign seams -> magnitude drops there
    vdir, vmag = normalize(v)
    seam = np.clip(vmag, 0, 1)

    # speed map
    speed = np.ones((H, W), np.float32)
    for (cx, cy, s, R, k) in SPIRALS:
        r = np.sqrt((xx-cx)**2 + (yy-cy)**2)
        speed *= 1 - 0.36*np.exp(-(r/(R*0.9))**2) - 0.22*np.exp(-(r/(R*0.35))**2)   # big swirl slower, eye slowest
    for (cx, cy, rc, rh, s) in STARS:
        r = np.sqrt((xx-cx)**2 + (yy-cy)**2)
        core = np.clip((r - rc) / (rc*0.7 + 4), 0, 1); core = core*core*(3-2*core)
        halo = 0.45 + 0.55*np.clip((r - rh*0.8) / (rh*0.5), 0, 1)
        speed *= core * halo
    cx, cy, rc, rh, s = MOON
    r = np.sqrt((xx-cx)**2 + (yy-cy)**2)
    core = np.clip((r - rc)/18, 0, 1); core = core*core*(3-2*core)
    speed *= core * (0.4 + 0.6*np.clip((r - rh*0.85)/(rh*0.4), 0, 1))
    # low frequency speed variation (deterministic)
    rng = np.random.default_rng(7)
    lf = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0,0), 40); lf /= lf.std()+1e-6
    speed *= np.clip(0.88 + 0.16*lf, 0.6, 1.2)
    speed *= (0.65 + 0.35*np.clip(coh*1.5, 0, 1))
    # region weight with feather (distance from non-sky)
    dist_sky = cv2.distanceTransform(skyR.astype(np.uint8), cv2.DIST_L2, 5)
    F = 12.0
    skyW = np.clip(dist_sky/F, 0, 1); skyW = skyW*skyW*(3-2*skyW)
    # image top/side edges: no special treatment (clamp sampling)
    sky_flow = vdir * (speed*seam*skyW)[...,None]

    # ---------------- SEA ----------------
    seaR = M['sea'] > 0
    sbase = np.zeros((H, W, 2), np.float32); sbase[...,0] = -1.0; sbase[...,1] = 0.22
    Gs_, _ = normalize(sbase)
    vs = orient(d, Gs_)
    for it in range(2):
        Gq = norm_blur(vs, seaR, 14)
        Gq, _ = normalize(Gq + 0.35*sbase)
        vs = orient(d, Gq)
    vs = c2*vs + (1-c2)*Gq
    vs = norm_blur(vs, seaR, 2.5)
    vsdir, vsmag = normalize(vs)
    depth = np.clip((yy - 384) / (H - 384), 0, 1)        # 0 at horizon, 1 at bottom
    sspeed = (0.45 + 0.55*depth) * np.clip(0.9 + 0.15*lf, 0.6, 1.2) * (0.65 + 0.35*np.clip(coh*1.5, 0, 1))
    dist_sea = cv2.distanceTransform(seaR.astype(np.uint8), cv2.DIST_L2, 5)
    seaW = np.clip(dist_sea/F, 0, 1); seaW = seaW*seaW*(3-2*seaW)
    sea_flow = vsdir * (sspeed*np.clip(vsmag,0,1)*seaW)[...,None]

    # fade motion near the image borders so clamped edge pixels never smear in
    ex = np.minimum(np.minimum(xx, W-1-xx), np.minimum(yy, H-1-yy))
    edge = np.clip(ex/10.0, 0, 1); edge = edge*edge*(3-2*edge)
    sky_flow *= edge[...,None]; sea_flow *= edge[...,None]
    # ---------------- extra masks ----------------
    woodish = np.clip(M['wood'] + M['rock'], 0, 1).astype(np.float32)
    wood_soft = cv2.GaussianBlur(woodish, (0,0), 2)
    hsv = cv2.cvtColor((im*255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)/255
    L = im.mean(-1)
    foam = np.clip((L - 0.62)/0.25, 0, 1) * np.clip((0.35 - hsv[...,1])/0.25, 0, 1) * seaW
    foam = cv2.GaussianBlur(foam, (0,0), 1.2)
    # glow column under the bright star / moon for golden reflections (sea only)
    refl = np.zeros((H, W), np.float32)
    for (cx, w0, amp) in [(385, 30, 1.0), (928, 55, 0.8)]:
        spread = w0 * (1 + 2.5*depth)
        refl = np.maximum(refl, amp*np.exp(-((xx-cx)/spread)**2) * np.exp(-depth*2.2))
    refl *= seaW


    def enc(f):  # flow -> 0..255
        return np.clip(f*0.5 + 0.5, 0, 1)
    out_w, out_h = 512, 383
    def rs(a): return cv2.resize(a, (out_w, out_h), interpolation=cv2.INTER_AREA)
    A = np.dstack([rs(enc(sky_flow[...,0])), rs(enc(sky_flow[...,1])), rs(skyW)])
    B = np.dstack([rs(enc(sea_flow[...,0])), rs(enc(sea_flow[...,1])), rs(seaW)])
    C = np.dstack([rs(wood_soft), rs(foam), rs(refl)])
    for name, arr in (('flow-sky.png', A), ('flow-sea.png', B), ('masks.png', C)):
        Image.fromarray((np.clip(arr,0,1)*255+0.5).astype(np.uint8)).save(out_dir / name, optimize=True)
    print('wrote flow-sky.png, flow-sea.png and masks.png to', out_dir)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(1)
    main(sys.argv[1], sys.argv[2])
