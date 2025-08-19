import React from 'react'
import { ExternalLink } from 'lucide-react'

export const cn = (...c) => c.filter(Boolean).join(' ')

export const Section = ({ id, className, children }) => (
  <section id={id} className={cn("relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 sm:px-6 md:px-8", className)}>
    {children}
  </section>
)

export const K = ({ children }) => <span className="text-zinc-200/90">{children}</span>

export const Pill = ({ children, className }) => (
  <span className={cn("inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 backdrop-blur", className)}>
    {children}
  </span>
)

export const A = ({ href, children, className }) => {
  const isInternal = typeof href === 'string' && href.startsWith('#')
  return (
    <a
      href={href}
      {...(isInternal ? {} : { target: '_blank', rel: 'noreferrer' })}
      className={cn('group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 transition hover:translate-y-[-1px] hover:bg-white/10', className)}
    >
      {children}
      {!isInternal && <ExternalLink className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5"/>}
    </a>
  )
}

export const BrandIcon = ({ icon, className }) => (
  <svg className={cn('h-4 w-4', className)} role="img" viewBox="0 0 24 24" aria-hidden="true">
    <path d={icon?.path} fill="currentColor" />
  </svg>
)

export const SocialButton = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    style={{ '--brand': icon ? `#${icon.hex}` : undefined }}
    className="group rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-200 hover:bg-white/10 hover:text-[var(--brand)]"
  >
    <BrandIcon icon={icon} />
    <span className="sr-only">{label}</span>
  </a>
)
