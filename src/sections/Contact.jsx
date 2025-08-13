import React from 'react'
import * as si from 'simple-icons'
import { Section, A, BrandIcon } from '../components/Primitives'
import { LINKS } from '../data'
import { Mail } from 'lucide-react'

export default function Contact() {
  return (
    <Section id="contact" className="pt-16 pb-20">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h2 className="text-xl font-semibold text-zinc-100">Let’s build something outrageous.</h2>
        <p className="mt-2 text-zinc-400">Speaking • Consulting • Collabs</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <A href={LINKS.email}><Mail className="h-4 w-4"/> Email</A>
          <A href={LINKS.github}><span style={{'--brand': `#${si.siGithub.hex}`}} className="group-hover:text-[var(--brand)]"><BrandIcon icon={si.siGithub}/></span> GitHub</A>
          <A href={LINKS.medium}><span style={{'--brand': `#${si.siMedium.hex}`}} className="group-hover:text-[var(--brand)]"><BrandIcon icon={si.siMedium}/></span> Medium</A>
          <A href={LINKS.twitter}><span style={{'--brand': `#${si.siX.hex}`}} className="group-hover:text-[var(--brand)]"><BrandIcon icon={si.siX}/></span> X</A>
          <A href={LINKS.instagram}><span style={{'--brand': `#${si.siInstagram.hex}`}} className="group-hover:text-[var(--brand)]"><BrandIcon icon={si.siInstagram}/></span> Instagram</A>
        </div>
      </div>
    </Section>
  )
}
