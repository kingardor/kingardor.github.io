import { motion } from 'framer-motion'

const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: 1.4 } } }

export default function HUD() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 4 }}
    >
      {/* Corner brackets */}
      <div className="absolute top-16 left-4 w-5 h-5 border-t border-l" style={{ borderColor: 'rgba(220,38,38,0.4)' }} />
      <div className="absolute top-16 right-4 w-5 h-5 border-t border-r" style={{ borderColor: 'rgba(220,38,38,0.4)' }} />
      <div className="absolute bottom-6 left-4 w-5 h-5 border-b border-l" style={{ borderColor: 'rgba(220,38,38,0.4)' }} />
      <div className="absolute bottom-6 right-4 w-5 h-5 border-b border-r" style={{ borderColor: 'rgba(220,38,38,0.4)' }} />

      {/* Top-left data */}
      <div className="absolute top-20 left-6 hud-text text-[0.58rem] leading-[1.9]" style={{ color: 'rgba(220,38,38,0.55)' }}>
        <div>PORTFOLIO_v3.0</div>
        <div>SYS &gt; ONLINE</div>
        <div style={{ color: 'rgba(34,197,94,0.7)' }}>AVAIL &gt; OPEN</div>
      </div>

      {/* Top-right data */}
      <div className="absolute top-20 right-6 hud-text text-[0.58rem] leading-[1.9] text-right" style={{ color: 'rgba(220,38,38,0.45)' }}>
        <div>STACK &gt; GENAI · VISION</div>
        <div>MODE &gt; AGENTIC</div>
        <div>VER &gt; 2026</div>
      </div>

      {/* Live status chip — top center */}
      <div
        className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 flex items-center gap-1.5 hud-text text-[0.58rem] px-3 py-1 rounded-full"
        style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(220,38,38,0.25)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}
      >
        <span className="w-[5px] h-[5px] rounded-full bg-green-400 animate-pulse-glow" style={{ flexShrink: 0 }} />
        Available for opportunities
      </div>

      {/* Data stream — right side (hidden on mobile) */}
      <div
        className="absolute right-6 top-1/2 -translate-y-1/2 hud-text text-[0.55rem] leading-[2.2] text-right hidden lg:block"
        style={{ color: 'rgba(220,38,38,0.22)' }}
      >
        <div>[INFERENCE]</div>
        <div>token_rate=<span style={{ color: 'rgba(220,38,38,0.65)' }}>142/s</span></div>
        <div>model=<span style={{ color: 'rgba(220,38,38,0.65)' }}>multimodal</span></div>
        <div>latency=<span style={{ color: 'rgba(220,38,38,0.65)' }}>12ms</span></div>
        <div>RAG=<span style={{ color: 'rgba(220,38,38,0.65)' }}>active</span></div>
        <div>agents=<span style={{ color: 'rgba(220,38,38,0.65)' }}>3</span></div>
      </div>

      {/* Reticle on photo */}
      <div
        className="absolute top-[11%] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full"
        style={{ border: '1px solid rgba(220,38,38,0.3)' }}
      >
        <div
          className="absolute inset-[10px] rounded-full"
          style={{ border: '1px solid rgba(220,38,38,0.15)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500"
          style={{ boxShadow: '0 0 8px rgba(220,38,38,0.9)', animation: 'pulseGlow 2s ease-in-out infinite' }}
        />
      </div>

      {/* Red chromatic top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #dc2626 30%, #db2777 70%, transparent)', opacity: 0.75 }}
      />
    </motion.div>
  )
}
