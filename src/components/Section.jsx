import { cn } from '../lib/utils'

export const Section = ({ id, className, children }) => (
  <section id={id} className={cn("relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 sm:px-6 md:px-8", className)}>
    {children}
  </section>
)
