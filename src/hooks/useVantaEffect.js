import React from 'react'

export default function useVantaEffect(loading) {
    const bgRef = React.useRef(null)
    const vRef = React.useRef(null)
    const chaosRef = React.useRef(1.2)
    const BASE = 4.0, PEAK = 10.0

    React.useEffect(() => {
        let mounted = true, ro = null, resizeHandler = null, waitId = null
        const ready = () => typeof window !== 'undefined' && window.VANTA && window.VANTA.TRUNK && window.p5
        const start = () => {
            if (!mounted || vRef.current || !bgRef.current) return
            const w = bgRef.current.clientWidth, h = bgRef.current.clientHeight
            if (!w || !h) return
            vRef.current = window.VANTA.TRUNK({
                el: bgRef.current,
                p5: window.p5,
                mouseControls: true,
                touchControls: true,
                gyroControls: true,
                minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1,
                backgroundColor: 0x0b0b0e, color: 0xcc0000, spacing: 0,
                chaos: chaosRef.current
            })
            resizeHandler = () => vRef.current?.resize?.()
            window.addEventListener('resize', resizeHandler)
            ro?.disconnect?.()
        }
        const boot = () => {
            if (!ready()) { waitId = window.setTimeout(boot, 50); return }
            start()
            if (!vRef.current && bgRef.current) { ro = new ResizeObserver(start); ro.observe(bgRef.current) }
        }
        boot()
        return () => { mounted = false; if (waitId) clearTimeout(waitId); ro?.disconnect?.(); if (resizeHandler) window.removeEventListener('resize', resizeHandler); vRef.current?.destroy?.(); vRef.current = null }
    }, [])

    React.useEffect(() => {
        const fx = vRef.current
        if (!fx) return
        let rafId
        const target = loading ? PEAK : BASE
        const step = () => {
            const cur = Number.isFinite(chaosRef.current) ? chaosRef.current : (loading ? BASE : PEAK)
            const next = cur + (target - cur) * 0.35
            const safe = Math.min(10, Math.max(0, next))
            chaosRef.current = safe
            fx.setOptions?.({ chaos: safe })
            if (Math.abs(safe - target) > 0.02) { rafId = requestAnimationFrame(step) }
        }
        rafId = requestAnimationFrame(step)
        return () => cancelAnimationFrame(rafId)
    }, [loading])

    return bgRef
}
