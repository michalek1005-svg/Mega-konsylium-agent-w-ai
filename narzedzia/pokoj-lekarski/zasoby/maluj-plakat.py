# Malarz pastelowy: przemalowuje szkic tysiącami kresek pastelu wzdłuż konturów, na papierze z ziarnem.
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
src_p, out_p = sys.argv[1], sys.argv[2]
rng = np.random.default_rng(1005)
src = Image.open(src_p).convert('RGB'); W, H = src.size
def rozmyj(im, r): return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32)
# papier: ciepły szary z włóknami
papier = np.ones((H, W, 3), np.float32) * np.array([214, 204, 186], np.float32)
szum = rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)
szum = np.asarray(Image.fromarray(((szum * 30) + 128).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(.8)), np.float32) / 255 - .5
papier += szum[..., None] * 26
ziarno = (szum > .06)  # „ząbek” papieru: wypukłości, na które pastel nie wchodzi przy lekkim nacisku
plotno = Image.fromarray(papier.clip(0, 255).astype(np.uint8)).convert('RGBA')

lum = rozmyj(src.convert('L'), 3)
gy, gx = np.gradient(lum)
for r, gest, dl, alfa, prog in [(16, .5, 3.2, 150, 0), (9, .8, 3.0, 165, 6), (5, 1.1, 2.6, 175, 7), (2.6, 1.3, 2.4, 185, 8), (1.4, .9, 2.2, 190, 10)]:
    ref = rozmyj(src, max(.6, r / 2.5))
    cur = np.asarray(plotno.convert('RGB'), np.float32)
    blad = np.abs(ref - cur).sum(2)
    n = int(W * H / (r * r) * gest)
    xs = rng.uniform(0, W - 1, n).astype(int); ys = rng.uniform(0, H - 1, n).astype(int)
    warstwa = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(warstwa)
    kol = (order := rng.permutation(n))
    for k in order:
        x, y = xs[k], ys[k]
        if blad[y, x] < prog * 3: continue
        g1, g2 = gx[y, x], gy[y, x]
        ang = np.arctan2(g2, g1) + np.pi / 2 if (g1 * g1 + g2 * g2) > .4 else rng.uniform(-.9, -.5)
        ang += rng.normal(0, .25)
        L = r * dl * rng.uniform(.6, 1.3)
        c = ref[y, x] + rng.normal(0, 7, 3)
        x2, y2 = x + np.cos(ang) * L, y + np.sin(ang) * L
        x0, y0 = x - np.cos(ang) * L / 2, y - np.sin(ang) * L / 2
        d.line([(x0, y0), (x2 - np.cos(ang) * L / 2, y2 - np.sin(ang) * L / 2)], fill=tuple(c.clip(0, 255).astype(int)) + (int(alfa * rng.uniform(.75, 1)),), width=max(1, int(r * rng.uniform(.8, 1.2))))
    # pigment nie wchodzi w ząbek papieru (mniej na drobnych przejściach)
    a = np.asarray(warstwa, np.float32)
    a[..., 3] *= np.where(ziarno, .55 if r > 4 else .8, 1)
    plotno = Image.alpha_composite(plotno, Image.fromarray(a.astype(np.uint8)))
# lekka tekstura papieru na wierzchu
wyn = np.asarray(plotno.convert('RGB'), np.float32)
wyn += szum[..., None] * 10
Image.fromarray(wyn.clip(0, 255).astype(np.uint8)).save(out_p, quality=86)
