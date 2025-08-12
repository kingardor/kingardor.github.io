import React from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'

import { Section } from './Section'
import { YT_VIDEOS } from '../lib/data'

const ExternalVideoCard = ({ url, title }) => {
  const [img, setImg] = React.useState('')
  const [desc, setDesc] = React.useState('')
  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('https://r.jina.ai/http/' + url.replace(/^https?:\/\//,''))
        if (res.ok) {
          const html = await res.text()
          const imgMatch = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
          const descMatch = html.match(/property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || html.match(/name=["']description["'][^>]*content=["']([^"']+)["']/i)
          if (active) {
            if (imgMatch) setImg(imgMatch[1])
            if (descMatch) setDesc(descMatch[1])
          }
        }
      } catch {}
    })()
    return () => { active = false }
  }, [url])
  const domain = (() => { try { return new URL(url).hostname.replace(/^www\./,'') } catch { return url } })()
  return (
    <a href={url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10">
      <div className="aspect-video w-full bg-black/40">
        {img ? <img src={img} alt="" className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center text-zinc-400">Preview</div>}
      </div>
      <div className="p-4">
        <div className="text-xs text-zinc-400">{domain}</div>
        <div className="mt-1 font-medium text-zinc-100">{title}</div>
        {desc && <p className="mt-1 text-sm text-zinc-400">{desc}</p>}
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-200 opacity-80 group-hover:opacity-100"><span>Watch</span><ExternalLink className="h-4 w-4"/></div>
      </div>
    </a>
  )
}

const getYTid = (u) => { try { const url = new URL(u); return url.searchParams.get('v') || url.pathname.split('/').pop() } catch { return '' } }

const YouTube = () => (
  <Section id="videos" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <BookOpen className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Talks & Videos</h2>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {YT_VIDEOS.map((u) => {
        const id = getYTid(u)
        return (
          <div key={u} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="aspect-video w-full">
              <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${id}`}
              title="YouTube video"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            </div>
          </div>
        )
      })}
      <ExternalVideoCard url="https://www.nvidia.com/en-us/on-demand/session/gtc25-s74465/" title="NVIDIA GTC 2025 — Session S74465" />
    </div>
  </Section>
)

export default YouTube
