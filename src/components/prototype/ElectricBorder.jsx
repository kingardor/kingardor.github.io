import { useEffect, useRef, useCallback } from 'react';

export function ElectricBorder({
  children,
  color = '#ef2b3a',
  speed = 1,
  chaos = 0.12,
  borderRadius = 12,
  className = '',
  style,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const lastRef = useRef(0);

  const random = useCallback(x => (Math.sin(x * 12.9898) * 43758.5453) % 1, []);

  const noise2D = useCallback((x, y) => {
    const i = Math.floor(x), j = Math.floor(y);
    const fx = x - i, fy = y - j;
    const a = random(i + j * 57), b = random(i + 1 + j * 57);
    const c = random(i + (j + 1) * 57), d = random(i + 1 + (j + 1) * 57);
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    return a*(1-ux)*(1-uy) + b*ux*(1-uy) + c*(1-ux)*uy + d*ux*uy;
  }, [random]);

  const octNoise = useCallback((x, oct, lac, gain, amp, freq, t, seed) => {
    let y = 0, a = amp, f = freq;
    for (let i = 0; i < oct; i++) {
      y += a * noise2D(f * x + seed * 100, t * f * 0.3);
      f *= lac; a *= gain;
    }
    return y;
  }, [noise2D]);

  const cornerPt = useCallback((cx, cy, r, sa, arc, p) => ({
    x: cx + r * Math.cos(sa + p * arc),
    y: cy + r * Math.sin(sa + p * arc),
  }), []);

  const rectPt = useCallback((t, l, top, w, h, r) => {
    const sw = w - 2*r, sh = h - 2*r, ca = (Math.PI * r) / 2;
    const perim = 2*sw + 2*sh + 4*ca;
    const d = t * perim;
    let acc = 0;
    if (d <= acc+sw) { const p=(d-acc)/sw; return {x:l+r+p*sw,y:top}; } acc+=sw;
    if (d <= acc+ca) { const p=(d-acc)/ca; return cornerPt(l+w-r,top+r,r,-Math.PI/2,Math.PI/2,p); } acc+=ca;
    if (d <= acc+sh) { const p=(d-acc)/sh; return {x:l+w,y:top+r+p*sh}; } acc+=sh;
    if (d <= acc+ca) { const p=(d-acc)/ca; return cornerPt(l+w-r,top+h-r,r,0,Math.PI/2,p); } acc+=ca;
    if (d <= acc+sw) { const p=(d-acc)/sw; return {x:l+w-r-p*sw,y:top+h}; } acc+=sw;
    if (d <= acc+ca) { const p=(d-acc)/ca; return cornerPt(l+r,top+h-r,r,Math.PI/2,Math.PI/2,p); } acc+=ca;
    if (d <= acc+sh) { const p=(d-acc)/sh; return {x:l,y:top+h-r-p*sh}; } acc+=sh;
    return cornerPt(l+r,top+r,r,Math.PI,Math.PI/2,(d-acc)/ca);
  }, [cornerPt]);

  useEffect(() => {
    const canvas = canvasRef.current, container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const OFFSET = 60, OCT = 10, LAC = 1.6, GAIN = 0.7, FREQ = 10, DISP = 60;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width + OFFSET*2, h = rect.height + OFFSET*2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w*dpr; canvas.height = h*dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      return { w, h };
    };
    let { w, h } = resize();

    const draw = now => {
      const dt = (now - lastRef.current) / 1000;
      timeRef.current += dt * speed;
      lastRef.current = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      const bw = w - 2*OFFSET, bh = h - 2*OFFSET;
      const r = Math.min(borderRadius, Math.min(bw, bh)/2);
      const count = Math.floor((2*(bw+bh) + 2*Math.PI*r) / 2);

      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const prog = i / count;
        const pt = rectPt(prog, OFFSET, OFFSET, bw, bh, r);
        const xN = octNoise(prog*8, OCT, LAC, GAIN, chaos, FREQ, timeRef.current, 0);
        const yN = octNoise(prog*8, OCT, LAC, GAIN, chaos, FREQ, timeRef.current, 1);
        const px = pt.x + xN*DISP, py = pt.y + yN*DISP;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
      animRef.current = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => { const s = resize(); w = s.w; h = s.h; });
    ro.observe(container);
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [color, speed, chaos, borderRadius, octNoise, rectPt]);

  return (
    <div
      ref={containerRef}
      className={`electric-border ${className}`}
      style={{ '--eb-color': color, borderRadius, ...style }}
    >
      <div className="eb-canvas-wrap">
        <canvas ref={canvasRef} className="eb-canvas" />
      </div>
      <div className="eb-layers">
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
        <div className="eb-bg-glow" />
      </div>
      <div className="eb-content">{children}</div>
    </div>
  );
}
