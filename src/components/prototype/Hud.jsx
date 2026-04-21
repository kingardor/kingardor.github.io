import { useEffect, useState, useRef } from 'react';

export function Hud() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const upd = () => {
      const d = new Date();
      const pad = n => String(n).padStart(2,'0');
      setTime(`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`);
    };
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hud" aria-hidden>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div className="tick-row top">
        <span><span className="tick">●</span> VERONICA · STANDBY</span>
        <span>AJ//PORTFOLIO · v02.26</span>
        <span>{time}</span>
      </div>
      <div className="tick-row bot">
        <span>LAT 37.7749° · LON -122.4194°</span>
        <span>SIGNAL · <span className="tick">STRONG</span></span>
        <span>SCROLL TO DECODE</span>
      </div>
      <div className="scanline" />
    </div>
  );
}

export function Reticle() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(max-width: 900px)').matches) return;
    const el = ref.current;
    if (!el) return;
    let raf;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const move = e => {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      cx += (tx - cx) * 0.25;
      cy += (ty - cy) * 0.25;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      if (Math.abs(tx-cx) > 0.5 || Math.abs(ty-cy) > 0.5) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    const over = e => {
      const t = e.target;
      const hot = t && (t.closest('a,button,.hot,[data-hot]'));
      el.classList.toggle('hot', !!hot);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className="reticle" aria-hidden>
      <span className="ring" />
      <span className="dot" />
    </div>
  );
}

export function Boot({ onDone }) {
  const [gone, setGone] = useState(false);
  const [lines, setLines] = useState([]);
  useEffect(() => {
    const seq = [
      { t: '> init VERONICA.core', d: 80, cls: 'muted' },
      { t: '> decrypting dossier....... ', d: 400, cls: '' },
      { t: '> persona .................. LOCKED', d: 120, cls: 'ok' },
      { t: '> telemetry ................ ONLINE', d: 120, cls: 'ok' },
      { t: '> greetings, visitor. stand by.', d: 500, cls: '' },
    ];
    let i = 0;
    const push = () => {
      if (i >= seq.length) {
        setTimeout(() => {
          setGone(true);
          setTimeout(onDone, 700);
        }, 400);
        return;
      }
      const item = seq[i++];
      setLines(l => [...l, item]);
      setTimeout(push, item.d);
    };
    const start = setTimeout(push, 200);
    return () => clearTimeout(start);
  }, [onDone]);

  return (
    <div className={`boot ${gone ? 'gone' : ''}`}>
      <div className="boot-log">
        {lines.map((l, i) => (
          <div key={i} className={l.cls}>{l.t}</div>
        ))}
        <div><span className="cursor-blink">▌</span></div>
      </div>
      <div className="boot-bar"><div className="boot-bar-fill" /></div>
    </div>
  );
}
