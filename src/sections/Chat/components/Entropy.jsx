import { useEffect, useRef } from 'react';

const N = 200; // dense full-screen coverage
function lerp(a, b, t) { return a + (b - a) * t; }

export function Entropy({ phase = 'idle' }) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = window.innerWidth, H = window.innerHeight;

    const setupCanvas = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    };
    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    // Scatter particles across the full viewport
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: 1.2 + Math.random() * 1.2,
    }));

    // Smooth state floats — driven by phaseRef, no React re-renders
    let energy = 0;  // 0=idle → 1=loading
    let errLvl = 0;  // 0=white → 1=all-red, frozen
    let raf;

    const tick = () => {
      const p = phaseRef.current;
      const isActive = p === 'loading';

      // Interpolate state values toward targets
      energy = lerp(energy, isActive ? 1 : 0, isActive ? 0.055 : 0.018);
      errLvl = lerp(errLvl, p === 'error' ? 1 : 0, p === 'error' ? 0.032 : 0.02);

      // ── Canvas setup ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // ── Update particles ──
      const maxSpd = lerp(0.4, 3.0, energy);
      const turb   = lerp(0.007, 0.20, energy);

      pts.forEach(pt => {
        if (errLvl > 0.05) {
          pt.vx *= (1 - 0.05 * errLvl);
          pt.vy *= (1 - 0.05 * errLvl);
        } else {
          pt.vx += (Math.random() - 0.5) * turb;
          pt.vy += (Math.random() - 0.5) * turb;
          const spd = Math.hypot(pt.vx, pt.vy);
          if (spd > maxSpd) { pt.vx *= maxSpd / spd; pt.vy *= maxSpd / spd; }
        }
        pt.x += pt.vx; pt.y += pt.vy;
        if (pt.x < -20) pt.x = W + 20; else if (pt.x > W + 20) pt.x = -20;
        if (pt.y < -20) pt.y = H + 20; else if (pt.y > H + 20) pt.y = -20;
      });

      // ── Draw connections ──
      const threshold = lerp(80, 170, energy);
      const maxAlpha  = lerp(0.10, 0.55, energy);
      const lw        = lerp(0.4, 1.2, energy);
      const cG = Math.round(lerp(255, 43,  errLvl));
      const cB = Math.round(lerp(255, 58,  errLvl));

      ctx.lineWidth = lw;
      for (let i = 0; i < N - 1; i++) {
        const a = pts[i];
        for (let j = i + 1; j < N; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= threshold * threshold) continue;
          const alpha = maxAlpha * (1 - Math.sqrt(d2) / threshold);
          ctx.strokeStyle = `rgba(255,${cG},${cB},${alpha.toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      // ── Draw particles ──
      const ptAlpha = lerp(0.42, 0.95, energy);
      pts.forEach(pt => {
        ctx.fillStyle = `rgba(255,${cG},${cB},${ptAlpha.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', setupCanvas);
    };
  }, []); // runs once — phaseRef keeps it live

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
