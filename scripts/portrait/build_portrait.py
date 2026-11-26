"""Portrait stage assets: one studio photo -> aligned layers for PortraitStage.

macOS only (the matte comes from Apple Vision via matte.swift). Run from the
repo root:

    swift scripts/portrait/matte.swift media-src/portrait/portrait-wide.png /tmp/portrait-matte.png
    python3 scripts/portrait/build_portrait.py /tmp/portrait-matte.person.png

Writes (all the same size as the photo, so they stack 1:1):
  public/portrait/plate.webp       background with the subject painted out
  public/portrait/subject.webp     the subject, RGBA, edge colours decontaminated
  public/portrait/rim-warm.webp    ember rim light on left-facing edges (RGBA)
  public/portrait/rim-cool.webp    blue rim light on right-facing edges (RGBA)
  public/portrait/slash-warm.webp  alpha mask of the orange background slashes
  public/portrait/slash-cool.webp  alpha mask of the blue background slashes
  public/portrait/lens.webp        alpha mask of the two sunglass lenses
  src/components/portrait/portrait.meta.json   geometry, in 0..1 image units
Only numpy + Pillow are needed.
"""
import json
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'media-src/portrait/portrait-wide.png'
OUT = ROOT / 'public/portrait'
META = ROOT / 'src/components/portrait/portrait.meta.json'

# Hand-measured on the 1672x941 master (glasses crop at 4x).
LENS_BOXES = [(742, 253, 808, 308), (834, 245, 902, 297)]  # x0, y0, x1, y1
CAMERA_DOT = (735, 262)   # capture camera, wearer's left temple
LED_DOT = (905, 251)      # capture LED, wearer's right temple


def blur(a, r):
    img = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


def push_pull(rgb, w):
    """Fill pixels with weight 0 from their surroundings (pyramid inpaint)."""
    if min(rgb.shape[:2]) <= 2:
        tot = w.sum()
        fill = (rgb * w[..., None]).sum((0, 1)) / max(tot, 1e-6)
        return np.where(w[..., None] > 0, rgb, fill)
    h, wd = w.shape
    ph, pw = h + (h & 1), wd + (wd & 1)
    rp = np.pad(rgb, ((0, ph - h), (0, pw - wd), (0, 0)), mode='edge')
    wp = np.pad(w, ((0, ph - h), (0, pw - wd)), mode='edge')
    ws = wp.reshape(ph // 2, 2, pw // 2, 2).sum((1, 3))
    rs = (rp * wp[..., None]).reshape(ph // 2, 2, pw // 2, 2, 3).sum((1, 3))
    small = rs / np.maximum(ws, 1e-6)[..., None]
    small = push_pull(small, np.minimum(ws, 1.0))
    up = small.repeat(2, 0).repeat(2, 1)[:h, :wd]
    up = np.asarray(Image.fromarray(np.clip(up * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1)), dtype=np.float32) / 255
    return rgb * w[..., None] + up * (1 - w[..., None])


def flood(mask, seed):
    h, w = mask.shape
    out = np.zeros_like(mask, dtype=bool)
    q = deque([seed])
    while q:
        y, x = q.popleft()
        if 0 <= y < h and 0 <= x < w and mask[y, x] and not out[y, x]:
            out[y, x] = True
            q.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    return out


def save_rgba(rgb, a, name, q=86):
    arr = np.dstack([np.clip(rgb * 255, 0, 255), np.clip(a * 255, 0, 255)]).astype(np.uint8)
    Image.fromarray(arr).save(OUT / name, 'WEBP', quality=q, method=6, exact=False)


def save_mask(a, name):
    h, w = a.shape
    save_rgba(np.ones((h, w, 3), np.float32), a, name, q=80)


def main(matte_path):
    OUT.mkdir(parents=True, exist_ok=True)
    META.parent.mkdir(parents=True, exist_ok=True)
    img = np.asarray(Image.open(SRC).convert('RGB'), dtype=np.float32) / 255
    H, W = img.shape[:2]
    a = np.asarray(Image.open(matte_path).convert('L').resize((W, H), Image.BICUBIC), dtype=np.float32) / 255

    # 1) Clean plate: paint the subject out (dilated so no hair survives).
    hole = blur((a > 0.02).astype(np.float32), 6) > 0.01
    plate = push_pull(img, (~hole).astype(np.float32))
    # The fill is smooth; give it back the backdrop's grain.
    rng = np.random.default_rng(7)
    grain = blur(rng.random((H, W)).astype(np.float32), 0.8) - 0.5
    plate = np.clip(plate + hole[..., None] * grain[..., None] * 0.035, 0, 1)
    Image.fromarray((plate * 255).astype(np.uint8)).save(OUT / 'plate.webp', 'WEBP', quality=84, method=6)

    # 2) Subject: decontaminate edge colours against the plate, so the dark
    #    backdrop doesn't fringe the hair when it sits over light type.
    # The person matte ramps over ~10 px; tighten it so hair over light type
    # reads as curls, not a grey haze.
    t = np.clip((a - 0.22) / 0.58, 0, 1)
    am = t * t * (3 - 2 * t)
    safe = np.maximum(am, 0.08)[..., None]
    fg = np.clip((img - (1 - safe) * plate) / safe, 0, 1)
    fg = np.where(am[..., None] > 0.97, img, fg)
    save_rgba(fg, am, 'subject.webp', q=88)

    # 3) Rim lights: an inner edge band, split by which way the edge faces.
    soft = blur(am, 5)
    gy, gx = np.gradient(soft)
    mag = np.sqrt(gx ** 2 + gy ** 2) + 1e-6
    nx, ny = -gx / mag, -gy / mag          # outward normal
    band = np.clip(am * (1 - blur(am, 9)) * 3.2, 0, 1)
    band = blur(band, 1.2)
    warm = band * np.clip(-nx * 0.85 - ny * 0.35, 0, 1) ** 0.8
    cool = band * np.clip(nx * 0.85 - ny * 0.2, 0, 1) ** 0.8
    ones = np.ones((H, W, 3), np.float32)
    save_rgba(ones * np.array([1.0, 0.42, 0.14]), np.clip(warm * 1.4, 0, 1), 'rim-warm.webp')
    save_rgba(ones * np.array([0.30, 0.62, 1.0]), np.clip(cool * 1.4, 0, 1), 'rim-cool.webp')

    # 4) Background slashes, from the plate's colour.
    r, g, b = plate[..., 0], plate[..., 1], plate[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    s_warm = np.clip((r - b - 0.10) * 4.5, 0, 1) * np.clip((lum - 0.08) * 5, 0, 1)
    s_cool = np.clip((b - r - 0.06) * 5.5, 0, 1) * np.clip((b - 0.14) * 5, 0, 1)
    save_mask(blur(s_warm, 2), 'slash-warm.webp')
    save_mask(blur(s_cool, 2), 'slash-cool.webp')

    # 5) Lenses: dark glass inside each hand-measured box, flood-filled from
    #    the centre so the frame and skin stay out.
    lum_img = 0.299 * img[..., 0] + 0.587 * img[..., 1] + 0.114 * img[..., 2]
    lens = np.zeros((H, W), np.float32)
    for (x0, y0, x1, y1) in LENS_BOXES:
        sub = lum_img[y0:y1, x0:x1] < 0.16
        cy, cx = (y1 - y0) // 2, (x1 - x0) // 2
        filled = flood(sub, (cy, cx))
        lens[y0:y1, x0:x1] = np.maximum(lens[y0:y1, x0:x1], filled.astype(np.float32))
    lens = blur(blur(lens, 1.5) > 0.5, 0.8)  # close pinholes, soften the edge
    save_mask(lens, 'lens.webp')

    # 6) Geometry for the component.
    ys, xs = np.nonzero(am > 0.5)
    bbox = [xs.min() / W, ys.min() / H, xs.max() / W, ys.max() / H]
    meta = {
        'width': W, 'height': H,
        'subject': [round(v, 4) for v in bbox],
        'face': [round(828 / W, 4), round(300 / H, 4)],
        'lenses': [[round(x0 / W, 4), round(y0 / H, 4), round(x1 / W, 4), round(y1 / H, 4)] for x0, y0, x1, y1 in LENS_BOXES],
        'camera': [round(CAMERA_DOT[0] / W, 4), round(CAMERA_DOT[1] / H, 4)],
        'led': [round(LED_DOT[0] / W, 4), round(LED_DOT[1] / H, 4)],
    }
    META.write_text(json.dumps(meta, indent=2) + '\n')

    # Report: how much of a centred two-line title the silhouette would hide.
    for vw, vh in [(1440, 900), (390, 844)]:
        s = max(vw / W, vh / H)
        ox, oy = (vw - W * s) / 2, (vh - H * s) / 2
        col = (am > 0.5)
        line_h = 0.13 * vw if vw > 700 else 64
        for label, top in [('line1', vh / 2 - line_h), ('line2', vh / 2)]:
            y0i, y1i = int((top - oy) / s), int((top + line_h - oy) / s)
            band_rows = col[max(0, y0i):min(H, y1i)]
            covered = band_rows.any(0)
            x_cov = np.nonzero(covered)[0]
            span = (x_cov.min() * s + ox, x_cov.max() * s + ox) if len(x_cov) else None
            print(f'{vw}x{vh} {label}: silhouette spans x={span and tuple(round(v) for v in span)} of {vw}px')
    for f in sorted(OUT.iterdir()):
        print(f'{f.name:18s} {f.stat().st_size // 1024:5d} KB')


if __name__ == '__main__':
    main(sys.argv[1])
