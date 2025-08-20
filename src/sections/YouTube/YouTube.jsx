import React, { useEffect, useState } from 'react'
import { Section } from '../../shared/components/Primitives'
import { BookOpen } from 'lucide-react'
import { getYTid } from '../../shared/utils/yt' // keep if you prefer URLs array
import { YT_VIDEOS as STATIC_YT_VIDEOS } from '../../data'

const API_BASE = ('https://veronica-proxy-vercel.vercel.app').replace(/\/$/, '')

const ExternalVideoCard = ({ url, title }) => {
  const domain = (() => { try { return new URL(url).hostname.replace(/^www\./,'') } catch { return url } })()
  const thumb = /youtube\.com|youtu\.be/.test(domain) ? `https://i.ytimg.com/vi/${getYTid(url)}/hqdefault.jpg` : ''
  return (
    <a href={url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10">
      <div className="aspect-video w-full bg-black/40">
        {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center text-zinc-400">Preview</div>}
      </div>
      <div className="p-4">
        <div className="text-xs text-zinc-400">{domain}</div>
        <div className="mt-1 font-medium text-zinc-100">{title}</div>
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-200 opacity-80 group-hover:opacity-100"><span>Watch</span></div>
      </div>
    </a>
  )
}

export default function YouTube() {
  const [videos, setVideos] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const apiUrl =  API_BASE + '/api/youtube-feed'
        const r = await fetch(`${apiUrl}?d=${Date.now()}`)
        if (r.ok) {
          const data = await r.json()
          if (Array.isArray(data.items) && data.items.length) {
            setVideos(data.items.map(v => v.url))
            return
          }
        }
      } catch {}

      // Fallback: your static list
      setVideos(STATIC_YT_VIDEOS)
      setError('Using cached/static list (RSS not available).')
    }
    load()
  }, [])

  return (
    <Section id="videos" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-zinc-300"/>
        <h2 className="text-xl font-semibold text-zinc-100">Talks & Videos</h2>
      </div>
      {!videos && !error && <div className="text-zinc-400 mb-4">Loading videos...</div>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {videos && videos.map((u) => {
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
}
