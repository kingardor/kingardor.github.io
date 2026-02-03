import React from 'react'

export default function BgFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Overlays for blur/gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0e] via-[#0b0b0e] to-[#0b1220]" />
      <div className="absolute -right-1/4 top-[-20%] h-[80vh] w-[80vw] rounded-full bg-[conic-gradient(at_70%_30%,rgba(239,68,68,0.25),rgba(190,18,60,0.22),rgba(244,63,94,0.20),rgba(239,68,68,0.25))] blur-3xl" />
      <div className="absolute -left-1/3 bottom-[-20%] h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(127,29,29,0.22),transparent_60%)] blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.05)_95%)] bg-[length:100%_4px] mix-blend-overlay opacity-30" />
    </div>
  )
}
