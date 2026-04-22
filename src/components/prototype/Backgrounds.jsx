import { useRef } from 'react';
import { useCanvasEffect } from './hooks.js';

/* ── BG 1 · GRID MESH + PARTICLES (for hero) ───────────────── */
export function GridMeshBG({ enabled = true, density = 32, accent = '#ef2b3a' }) {
  const ref = useRef(null);
  const particles = useRef([]);

  useCanvasEffect(ref, (ctx, s, t, reduced) => {
    if (!enabled) { ctx.clearRect(0, 0, s.w, s.h); return; }
    ctx.clearRect(0, 0, s.w, s.h);

    if (particles.current.length === 0 || particles.current._w !== s.w) {
      const n = Math.min(60, Math.floor(s.w * s.h / 24000));
      const arr = [];
      for (let i = 0; i < n; i++) {
        arr.push({
          x: Math.random() * s.w,
          y: Math.random() * s.h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 0.8 + Math.random() * 1.6,
        });
      }
      arr._w = s.w;
      particles.current = arr;
    }

    const step = s.w / density;
    const rows = Math.ceil(s.h / step) + 1;
    const cols = Math.ceil(s.w / step) + 1;
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * step;
        const y = r * step;
        let dx = 0, dy = 0, influence = 0;
        if (s.hover) {
          const ddx = x - s.mx, ddy = y - s.my;
          const dist = Math.sqrt(ddx*ddx + ddy*ddy);
          const R = 180;
          if (dist < R) {
            influence = (1 - dist / R);
            const force = influence * 22;
            dx = (ddx / (dist + 0.001)) * force;
            dy = (ddy / (dist + 0.001)) * force;
          }
        }
        const bob = reduced ? 0 : Math.sin(t * 0.6 + r * 0.4 + c * 0.25) * 1.2;
        const px = x + dx;
        const py = y + dy + bob;

        const a = 0.08 + influence * 0.6;
        ctx.fillStyle = influence > 0.1 ? accent : 'rgba(255,255,255,1)';
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(px, py, influence > 0.3 ? 1.6 : 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    const arr = particles.current;
    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = s.w; if (p.x > s.w) p.x = 0;
      if (p.y < 0) p.y = s.h; if (p.y > s.h) p.y = 0;

      if (s.hover) {
        const ddx = s.mx - p.x, ddy = s.my - p.y;
        const d = Math.sqrt(ddx*ddx + ddy*ddy);
        if (d < 160) {
          p.vx += (ddx / d) * 0.008;
          p.vy += (ddy / d) * 0.008;
        }
      }
      p.vx *= 0.985; p.vy *= 0.985;

      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < arr.length; j++) {
        const q = arr[j];
        const ddx = p.x - q.x, ddy = p.y - q.y;
        const d2 = ddx*ddx + ddy*ddy;
        if (d2 < 110*110) {
          const a = (1 - Math.sqrt(d2) / 110) * 0.35;
          ctx.strokeStyle = accent;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }, [enabled, accent]);

  return <canvas ref={ref} className="bg-canvas" aria-hidden />;
}

/* ── BG 2 · DATA RAIN + SCANLINES (for career) ───────────────── */
export function DataRainBG({ enabled = true, accent = '#ef2b3a' }) {
  const ref = useRef(null);
  const cols = useRef([]);

  useCanvasEffect(ref, (ctx, s, t, reduced) => {
    if (!enabled) { ctx.clearRect(0, 0, s.w, s.h); return; }
    ctx.fillStyle = 'rgba(10,10,13,0.15)';
    ctx.fillRect(0, 0, s.w, s.h);

    const fontSize = 12;
    const nCols = Math.ceil(s.w / fontSize);
    if (cols.current.length !== nCols) {
      cols.current = new Array(nCols).fill(0).map(() => ({
        y: Math.random() * -s.h,
        speed: 1.5 + Math.random() * 3,
      }));
    }

    ctx.font = `${fontSize}px JetBrains Mono, monospace`;
    const glyphs = '01ABCDEF·+-×';
    for (let i = 0; i < nCols; i++) {
      const col = cols.current[i];
      col.y += col.speed * (reduced ? 0.3 : 1);
      if (col.y > s.h + 60) col.y = -60;

      const x = i * fontSize;
      const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.9;
      ctx.fillText(ch, x, col.y);
      for (let k = 1; k < 8; k++) {
        const y = col.y - k * fontSize;
        if (y < -20) break;
        ctx.fillStyle = accent;
        ctx.globalAlpha = (0.5 - k * 0.06);
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], x, y);
      }
    }
    ctx.globalAlpha = 1;
  }, [enabled, accent]);

  return <canvas ref={ref} className="bg-canvas" aria-hidden />;
}

/* ── BG 3 · AURORA (for transmission/contact) ───────── */
export function AuroraBG({ enabled = true, accent = '#ef2b3a' }) {
  const ref = useRef(null);

  useCanvasEffect(ref, (ctx, s, t, reduced) => {
    if (!enabled) { ctx.clearRect(0, 0, s.w, s.h); return; }
    ctx.clearRect(0, 0, s.w, s.h);

    const blobs = 3;
    for (let i = 0; i < blobs; i++) {
      const phase = t * (reduced ? 0.1 : 0.3) + i * 2.1;
      const cx = s.w * (0.3 + 0.4 * Math.sin(phase + i)) + (s.hover ? (s.mx - s.w/2) * 0.15 : 0);
      const cy = s.h * (0.7 + 0.2 * Math.cos(phase * 1.2)) + (s.hover ? (s.my - s.h/2) * 0.1 : 0);
      const rad = s.w * (0.28 + 0.08 * Math.sin(phase * 1.6));
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const hue = i === 1 ? '255, 77, 122' : '239, 43, 58';
      grd.addColorStop(0, `rgba(${hue},${0.4 - i * 0.08})`);
      grd.addColorStop(1, `rgba(${hue},0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, s.w, s.h);
    }

    if (s.hover) {
      const r = 120;
      const grd = ctx.createRadialGradient(s.mx, s.my, 0, s.mx, s.my, r);
      grd.addColorStop(0, 'rgba(255,255,255,0.08)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(s.mx, s.my, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [enabled, accent]);

  return <canvas ref={ref} className="bg-canvas" aria-hidden />;
}
