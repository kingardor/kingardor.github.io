import React from 'react'
import { Award, ExternalLink } from 'lucide-react'

import { Section } from './Section'
import { HONOURS } from '../lib/data'

const Honours = () => (
  <Section id="honours" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <Award className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Honours</h2>
    </div>
    <ul className="space-y-2">
      {HONOURS.map((x) => (
        <li key={x.url}>
          <a className="inline-flex items-center gap-2 text-zinc-200 hover:underline" href={x.url} target="_blank" rel="noreferrer">
            {x.title}
            <ExternalLink className="h-4 w-4"/>
          </a>
        </li>
      ))}
    </ul>
  </Section>
)

export default Honours
