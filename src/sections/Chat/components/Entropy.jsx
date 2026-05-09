import { useEffect, useRef } from 'react';

const N           = 200;
const SYNAPSE_PX  = 140;  // blue trailing zone behind wavefront
const SWEEP_S     = 5.0;  // seconds to sweep from edges to centre (idle speed)
const HOLD_S      = 0.5;  // seconds to hold full connection after complete
const FADE_S      = 1.4;  // seconds to dissolve connections back to idle

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
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    };
    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    // Particles
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: 1.2 + Math.random() * 1.2,
      flash: 0, flashDir: 0, // random idle spark
    }));

    // ── Internal state machine ──────────────────────────────────────────────
    // mode: 'idle' | 'sweeping' | 'completing' | 'fading'
    let mode       = 'idle';
    let sweep      = 0;      // 0→1 (0=edges, 1=centre met)
    let compTimer  = 0;      // time spent in completing/fading
    let energy     = 0;      // 0=idle speed → 1=loading speed (particle movement)
    let errLvl     = 0;
    let prevPhase  = phase;
    let lastT      = performance.now();
    let raf;

    const tick = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      const p       = phaseRef.current;
      const isError = p === 'error';

      // ── Phase transitions ─────────────────────────────────────────────────
      if (p !== prevPhase) {
        if (p === 'loading') {
          mode = 'sweeping'; sweep = 0; compTimer = 0;
        } else if (prevPhase === 'loading' && !isError) {
          // complete or idle after loading → snap to center then fade
          mode = 'completing'; sweep = 1; compTimer = 0;
        }
        prevPhase = p;
      }

      // ── Mode progression ──────────────────────────────────────────────────
      if (mode === 'sweeping') {
        sweep = Math.min(sweep + dt / SWEEP_S, 1);
        // if loading ended (detected above), completing takes over next tick
      } else if (mode === 'completing') {
        compTimer += dt;
        if (compTimer >= HOLD_S) { mode = 'fading'; compTimer = 0; }
      } else if (mode === 'fading') {
        compTimer += dt;
        if (compTimer >= FADE_S) { mode = 'idle'; sweep = 0; compTimer = 0; }
      }

      // Fade multiplier for dissolving connections
      const connOpacity = mode === 'fading'
        ? 1 - compTimer / FADE_S
        : (mode === 'completing' || mode === 'sweeping') ? 1 : 0;

      // Lerp energy (particle speed) toward target
      energy = lerp(energy, p === 'loading' ? 1 : 0, p === 'loading' ? 0.05 : 0.02);
      errLvl = lerp(errLvl, isError ? 1 : 0, isError ? 0.032 : 0.02);

      const errG = Math.round(lerp(255, 43,  errLvl));
      const errB = Math.round(lerp(255, 58,  errLvl));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // ── Random idle sparks ────────────────────────────────────────────────
      if (mode === 'idle' && !isError) {
        if (Math.random() < 0.05) {
          const idx = Math.floor(Math.random() * N);
          if (pts[idx].flash <= 0.05) { pts[idx].flash = 0.01; pts[idx].flashDir = 1; }
        }
      }
      pts.forEach(pt => {
        if (pt.flashDir === 1) {
          pt.flash += dt * 4;       // rise in ~0.25s
          if (pt.flash >= 1) pt.flashDir = -1;
        } else if (pt.flash > 0) {
          pt.flash -= dt * 2;       // fade in ~0.5s
          if (pt.flash < 0) pt.flash = 0;
        }
      });

      // ── Update particle positions ─────────────────────────────────────────
      const maxSpd = lerp(0.5, 3.0, energy);
      const turb   = lerp(0.01, 0.22, energy);
      pts.forEach(pt => {
        if (isError && errLvl > 0.05) {
          pt.vx *= 1 - 0.04 * errLvl; pt.vy *= 1 - 0.04 * errLvl;
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

      // ── Draw connections (only when sweeping / completing / fading) ───────
      if (connOpacity > 0.005) {
        const leftFront  = sweep * (W / 2);
        const rightFront = W - sweep * (W / 2);
        const thresh     = 130;
        const maxA       = 0.50 * connOpacity;

        ctx.lineWidth = 0.7;
        for (let i = 0; i < N - 1; i++) {
          const a = pts[i];
          for (let j = i + 1; j < N; j++) {
            const b = pts[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            if (dx*dx + dy*dy >= thresh*thresh) continue;
            const midX = (a.x + b.x) / 2;
            const fromL = midX < leftFront;
            const fromR = midX > rightFront;
            if (!fromL && !fromR) continue;
            const d     = Math.sqrt(dx*dx + dy*dy);
            const baseA = maxA * (1 - d / thresh);

            // Distance behind nearest wavefront
            let behind = fromL ? leftFront - midX : midX - rightFront;
            if (fromL && fromR) behind = Math.min(leftFront - midX, midX - rightFront);

            if (!isError && mode === 'sweeping' && behind < SYNAPSE_PX) {
              const t  = 1 - behind / SYNAPSE_PX;
              const sR = Math.round(lerp(255, 30,  t));
              const sG = Math.round(lerp(255, 220, t));
              const sB = Math.round(lerp(255, 255, t));
              ctx.strokeStyle = `rgba(${sR},${sG},${sB},${(baseA * (0.7 + t * 0.3)).toFixed(3)})`;
            } else {
              ctx.strokeStyle = `rgba(255,${errG},${errB},${baseA.toFixed(3)})`;
            }
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // ── Draw particles ────────────────────────────────────────────────────
      const leftFront  = sweep * (W / 2);
      const rightFront = W - sweep * (W / 2);

      pts.forEach(pt => {
        let pR = 255, pG = errG, pB = errB;
        let pA = 0.38;
        let r  = pt.r;

        if (mode === 'idle' && !isError && pt.flash > 0) {
          // ── Idle synapse spark ──────────────────────────────────────────
          pR = Math.round(lerp(255, 30,  pt.flash));
          pG = Math.round(lerp(255, 220, pt.flash));
          pB = Math.round(lerp(255, 255, pt.flash));
          pA = lerp(0.42, 1.0, pt.flash);
          r  = pt.r + pt.flash * 2;

        } else if (connOpacity > 0.005 && !isError) {
          // ── Sweep / complete / fading ───────────────────────────────────
          const fromL = pt.x < leftFront;
          const fromR = pt.x > rightFront;

          if (!fromL && !fromR) {
            pA = 0.18; // ghost dot ahead of wavefront
          } else {
            let behind = fromL ? leftFront - pt.x : pt.x - rightFront;
            if (fromL && fromR) behind = Math.min(leftFront - pt.x, pt.x - rightFront);

            if (mode === 'sweeping' && behind < SYNAPSE_PX) {
              const t = 1 - behind / SYNAPSE_PX;
              pR = Math.round(lerp(255, 30,  t));
              pG = Math.round(lerp(255, 220, t));
              pB = Math.round(lerp(255, 255, t));
              pA = lerp(0.55, 1.0, t);
              r  = pt.r + t * 1.5;
            } else {
              pA = 0.80 * connOpacity; // settled: bright while connected, fades with opacity
            }
          }
        } else {
          // Normal idle dot (no flash)
          pA = 0.38;
        }

        ctx.fillStyle = `rgba(${pR},${pG},${pB},${Math.max(0, pA).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2); ctx.fill();
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', setupCanvas); };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
  );
}
