import React from 'react'

export default function Footer({ views }) {
    return (
        <footer className="pb-8 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} Akash James • Built on Tailwind • Deployed on GitHub Pages
            <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300 align-middle">
                {views == null ? 'visits — …' : `visits — ${views.toLocaleString()}`}
            </span>
        </footer>
    )
}
