import { cn } from '../lib/utils'

export const Pill = ({ children, className }) => (
  <span className={cn("inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 backdrop-blur", className)}>
    {children}
  </span>
)
