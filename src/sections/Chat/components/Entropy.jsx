import { useEffect, useRef } from 'react';

const N = 200;
const SYNAPSE_PX = 130; // blue synapse zone width behind each wavefront
const CYCLE_S   = 5.5;  // seconds for one full sweep cycle (idle)

function lerp(a, b, t) { return a + (b - a) * t; }

export function Entropy({ phase = 'idle' }) {
  const canvasRef = useRef(null);
  const phaseRef  = useRef(phase);

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
      canvas.width  = W * dpr; canvas.height = H * dpr;
      canvas.style.width  = `${W}px`; canvas.style.height = `${H}px`;
    };
    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    const pts = Array.from({ length: N }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r:  1.2 + Math.random() * 1.2,
    }));

    let energy  = 0;   // 0=idle → 1=loading
    let errLvl  = 0;   // 0=normal → 1=full-red, frozen
    let sweep   = 0;   // 0 → 1, repeating
    let lastT   = performance.now();
    let raf;

    const tick = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.05); // seconds, capped
      lastT = now;

      const p         = phaseRef.current;
      const isLoading = p === 'loading';
      const isError   = p === 'error';

      energy = lerp(energy, isLoading ? 1 : 0, isLoading ? 0.055 : 0.018);
      errLvl = lerp(errLvl, isError   ? 1 : 0, isError   ? 0.032 : 0.02);

      // Sweep advances faster during loading (2× speed)
      if (!isError) {
        const sweepRate = lerp(1 / CYCLE_S, 2 / CYCLE_S, energy);
        sweep += sweepRate * dt;
        if (sweep >= 1) sweep -= 1; // loop
      }

      // Wavefront positions: left starts at 0→W/2, right at W→W/2
      const leftFront  = sweep * (W / 2);
      const rightFront = W - sweep * (W / 2);

      // Fade-in ramp: avoids hard flash when sweep resets (first 8% of cycle)
      const fadeIn = Math.min(sweep / 0.08, 1);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // ── Update particles ──────────────────────────────────────────────────
      const maxSpd = lerp(0.4, 3.0, energy);
      const turb   = lerp(0.007, 0.20, energy);

      pts.forEach(pt => {
        if (errLvl > 0.05) {
          pt.vx *= 1 - 0.05 * errLvl;
          pt.vy *= 1 - 0.05 * errLvl;
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

      // ── Draw connections ──────────────────────────────────────────────────
      const thresh     = lerp(80, 160, energy);
      const maxConnAlpha = lerp(0.18, 0.60, energy) * fadeIn;
      const lw         = lerp(0.5, 1.3, energy);
      const errG = Math.round(lerp(255, 43, errLvl));
      const errB = Math.round(lerp(255, 58, errLvl));

      ctx.lineWidth = lw;

      for (let i = 0; i < N - 1; i++) {
        const a = pts[i];
        for (let j = i + 1; j < N; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= thresh * thresh) continue;

          const midX = (a.x + b.x) / 2;
          const fromLeft  = midX < leftFront;
          const fromRight = midX > rightFront;
          if (!fromLeft && !fromRight) continue; // not yet swept — skip

          const d     = Math.sqrt(d2);
          const baseA = maxConnAlpha * (1 - d / thresh);

          // Distance behind the nearest wavefront
          let behind = Infinity;
          if (fromLeft)  behind = Math.min(behind, leftFront  - midX);
          if (fromRight) behind = Math.min(behind, midX - rightFront);

          if (!isError && behind < SYNAPSE_PX) {
            // ── Blue synapse zone ──────────────────────────
            const t  = 1 - behind / SYNAPSE_PX; // 1=at front, 0=trailing edge
            const sR = Math.round(lerp(255, 30,  t));
            const sG = Math.round(lerp(255, 220, t));
            const sB = Math.round(lerp(255, 255, t));
            const sA = (baseA * (0.7 + t * 0.3)).toFixed(3);
            ctx.strokeStyle = `rgba(${sR},${sG},${sB},${sA})`;
          } else {
            // ── Settled connection ─────────────────────────
            ctx.strokeStyle = `rgba(255,${errG},${errB},${baseA.toFixed(3)})`;
          }

          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      // ── Draw particles ────────────────────────────────────────────────────
      pts.forEach(pt => {
        const fromLeft  = pt.x < leftFront;
        const fromRight = pt.x > rightFront;
        const activated = fromLeft || fromRight;

        if (!activated) {
          // Pre-sweep: dim ghost dot
          ctx.fillStyle = `rgba(255,255,255,${(0.18 * fadeIn).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * 0.7, 0, Math.PI * 2); ctx.fill();
          return;
        }

        let behind = Infinity;
        if (fromLeft)  behind = Math.min(behind, leftFront  - pt.x);
        if (fromRight) behind = Math.min(behind, pt.x - rightFront);

        if (!isError && behind < SYNAPSE_PX) {
          const t  = 1 - behind / SYNAPSE_PX;
          const pR = Math.round(lerp(255, 30,  t));
          const pG = Math.round(lerp(255, 220, t));
          const pB = Math.round(lerp(255, 255, t));
          const pA = (lerp(0.55, 1.0, energy) + t * 0.25).toFixed(3);
          ctx.fillStyle = `rgba(${pR},${pG},${pB},${pA})`;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r + t * 1.5, 0, Math.PI * 2); ctx.fill();
        } else {
          const pA = (lerp(0.42, 0.92, energy) * fadeIn).toFixed(3);
          ctx.fillStyle = `rgba(255,${errG},${errB},${pA})`;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', setupCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
