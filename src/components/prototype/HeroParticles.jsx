import { useRef, useCallback, useEffect } from 'react';
import { useCanvasEffect } from './hooks.js';

const STRIDE = 9; // sxf, syf, x, y, r, g, b, delay, phase

function sampleImage(img, sw, sh) {
  const off = Object.assign(document.createElement('canvas'), { width: sw, height: sh });
  const octx = off.getContext('2d', { willReadFrequently: true });
  octx.drawImage(img, 0, 0, sw, sh);
  const { data } = octx.getImageData(0, 0, sw, sh);
  const pts = [];
  const cols = [];
  for (let sy = 0; sy < sh; sy++) {
    for (let sx = 0; sx < sw; sx++) {
      const i = (sy * sw + sx) * 4;
      const a = data[i + 3], r = data[i], g = data[i + 1], b = data[i + 2];
      if (a < 30 || 0.299 * r + 0.587 * g + 0.114 * b < 18) continue;
      pts.push(
        sx / (sw - 1), sy / (sh - 1), // fractional image coords
        0, 0,                          // x, y (scatter positions set on first draw)
        r, g, b,                       // color
        Math.random() * 0.45,          // stagger delay (0 – 0.45s)
        Math.random() * Math.PI * 2,   // ambient oscillation phase
      );
      cols.push(`rgb(${r},${g},${b})`);
    }
  }
  return { pts: new Float32Array(pts), cols };
}

// Replicates CSS background-size:cover + background-position:center 18%
function coverOffset(w, h) {
  const heroAR = w / h, imgAR = 4 / 3; // hero.webp is 1440×1080
  let dw, dh;
  if (heroAR >= imgAR) { dw = w; dh = w / imgAR; }
  else { dh = h; dw = h * imgAR; }
  return { dw, dh, ox: (w - dw) / 2, oy: (h - dh) * 0.18 };
}

export default function HeroParticles({ onAssembled }) {
  const canvasRef = useRef(null);
  const dataRef    = useRef(null);
  const startRef   = useRef(null);
  const initRef    = useRef(false);
  const cbRef      = useRef(false);
  const ambRef     = useRef(false);
  const onAsmRef   = useRef(onAssembled);

  // Keep callback ref current without re-initialising the RAF loop
  useEffect(() => { onAsmRef.current = onAssembled; }, [onAssembled]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onAsmRef.current?.();
      return;
    }

    // Three-tier sampling: xs → fewer particles for low-end phones
    const xs     = window.matchMedia('(max-width: 480px)').matches;
    const mobile = !xs && window.matchMedia('(max-width: 768px)').matches;
    const [sw, sh] = xs ? [160, 120] : mobile ? [200, 150] : [320, 240];

    let particleData = null;
    let imageReady = false;
    let loaderGone = false;

    const tryStart = () => {
      if (imageReady && loaderGone) dataRef.current = particleData;
    };

    // Prefetch image immediately so it's ready before the loader ends
    const img = new Image();
    img.src = '/hero.webp';
    img.onload = () => {
      particleData = sampleImage(img, sw, sh);
      imageReady = true;
      tryStart();
    };

    // Gate animation start on loader becoming invisible.
    // Listens for transitionend(opacity) first; falls back to DOM removal.
    const loaderEl = document.getElementById('loader');
    if (!loaderEl) {
      loaderGone = true;
      tryStart();
      return;
    }

    let fired = false;
    const trigger = () => {
      if (fired) return;
      fired = true;
      cleanup(); // eslint-disable-line no-use-before-define
      loaderGone = true;
      tryStart();
    };

    const onTransitionEnd = (e) => { if (e.propertyName === 'opacity') trigger(); };
    loaderEl.addEventListener('transitionend', onTransitionEnd);

    // Fallback: loader element removed from DOM
    const obs = new MutationObserver(() => {
      if (!document.getElementById('loader')) trigger();
    });
    obs.observe(document.body, { childList: true });

    const cleanup = () => {
      loaderEl.removeEventListener('transitionend', onTransitionEnd);
      obs.disconnect();
    };
    return cleanup;
  }, []);

  const draw = useCallback((ctx, state, t, prefersReduced) => {
    if (prefersReduced) return;
    const d = dataRef.current;
    if (!d || !state.w || !state.h) return;

    const { pts, cols } = d;
    const N = pts.length / STRIDE;
    const { dw, dh, ox, oy } = coverOffset(state.w, state.h);

    // On first valid frame: lock start time + scatter particles randomly
    if (!initRef.current) {
      initRef.current = true;
      startRef.current = t;
      for (let i = 0; i < N; i++) {
        const o = i * STRIDE;
        pts[o + 2] = Math.random() * state.w;
        pts[o + 3] = Math.random() * state.h;
      }
    }

    const rt = t - startRef.current; // time since reveal started
    ctx.clearRect(0, 0, state.w, state.h);

    for (let i = 0; i < N; i++) {
      const o = i * STRIDE;
      const tx = ox + pts[o]     * dw;
      const ty = oy + pts[o + 1] * dh;
      let x = pts[o + 2];
      let y = pts[o + 3];
      const delay = pts[o + 7];
      const phase = pts[o + 8];

      if (rt < 1.8) {
        // Assemble: lerp toward target after per-particle stagger delay
        if (rt >= delay) {
          x += (tx - x) * 0.065;
          y += (ty - y) * 0.065;
        }
      } else {
        // Ambient: gentle oscillation around target + cursor repulsion
        const ax = Math.sin(rt * 0.9  + phase)       * 1.6;
        const ay = Math.cos(rt * 0.7  + phase * 1.3) * 1.6;
        let fx = 0, fy = 0;
        if (state.hover) {
          const dx = x - state.mx, dy = y - state.my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12100 && d2 > 0.01) { // 110 px radius
            const dist = Math.sqrt(d2);
            const f = (110 - dist) / 110 * 3.5;
            fx = (dx / dist) * f;
            fy = (dy / dist) * f;
          }
        }
        x += (tx + ax + fx - x) * 0.04;
        y += (ty + ay + fy - y) * 0.04;
      }

      pts[o + 2] = x;
      pts[o + 3] = y;
      ctx.fillStyle = cols[i];
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Fire both at rt=1.5 so photo fades IN while canvas fades OUT simultaneously
    if (!cbRef.current && rt >= 1.5) {
      cbRef.current = true;
      onAsmRef.current?.();
      ambRef.current = true;
      canvasRef.current?.classList.add('ambient');
    }
  }, []); // stable — never recreated so RAF never resets

  useCanvasEffect(canvasRef, draw, []);

  return <canvas ref={canvasRef} className="hero-particles" aria-hidden="true" />;
}
