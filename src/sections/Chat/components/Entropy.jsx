import { useEffect, useRef } from 'react';

export function Entropy({ className = '', size = 400, orderColor = '#ffffff', chaosColor = '#ef2b3a' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    class Particle {
      constructor(x, y, order) {
        this.x = x; this.y = y;
        this.originalX = x; this.originalY = y;
        this.size = 2;
        this.order = order;
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        this.influence = 0;
        this.neighbors = [];
      }

      update() {
        if (this.order) {
          const dx = this.originalX - this.x, dy = this.originalY - this.y;
          const ci = { x: 0, y: 0 };
          this.neighbors.forEach(n => {
            if (!n.order) {
              const dist = Math.hypot(this.x - n.x, this.y - n.y);
              const s = Math.max(0, 1 - dist / 100);
              ci.x += n.velocity.x * s; ci.y += n.velocity.y * s;
              this.influence = Math.max(this.influence, s);
            }
          });
          this.x += dx * 0.05 * (1 - this.influence) + ci.x * this.influence;
          this.y += dy * 0.05 * (1 - this.influence) + ci.y * this.influence;
          this.influence *= 0.99;
        } else {
          this.velocity.x += (Math.random() - 0.5) * 0.5;
          this.velocity.y += (Math.random() - 0.5) * 0.5;
          this.velocity.x *= 0.95; this.velocity.y *= 0.95;
          this.x += this.velocity.x; this.y += this.velocity.y;
          if (this.x < size / 2 || this.x > size) this.velocity.x *= -1;
          if (this.y < 0 || this.y > size) this.velocity.y *= -1;
          this.x = Math.max(size / 2, Math.min(size, this.x));
          this.y = Math.max(0, Math.min(size, this.y));
        }
      }

      draw() {
        const alpha = this.order ? 0.8 - this.influence * 0.5 : 0.8;
        const color = this.order ? orderColor : chaosColor;
        const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = `${color}${hex}`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const gridSize = 25, spacing = size / gridSize;
    const particles = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = spacing * i + spacing / 2, y = spacing * j + spacing / 2;
        particles.push(new Particle(x, y, x < size / 2));
      }
    }

    const updateNeighbors = () => {
      particles.forEach(p => {
        p.neighbors = particles.filter(o => o !== p && Math.hypot(p.x - o.x, p.y - o.y) < 100);
      });
    };
    updateNeighbors();

    let time = 0, animId;
    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      if (time % 30 === 0) updateNeighbors();

      particles.forEach(p => {
        p.update(); p.draw();
        p.neighbors.forEach(n => {
          const d = Math.hypot(p.x - n.x, p.y - n.y);
          if (d < 50) {
            const alpha = 0.18 * (1 - d / 50);
            const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
            ctx.strokeStyle = `#ffffff${hex}`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          }
        });
      });

      // divider line
      ctx.strokeStyle = '#ffffff20';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();

      time++;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, [size, orderColor, chaosColor]);

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
}
