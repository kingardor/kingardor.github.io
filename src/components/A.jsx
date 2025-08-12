import { ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'

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
