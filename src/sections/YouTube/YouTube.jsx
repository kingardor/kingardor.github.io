import React, { useEffect, useState } from 'react'
import { Section, A } from '../../shared/components/Primitives'
import { BookOpen } from 'lucide-react'
import { getYTid } from '../../shared/utils/yt' // keep if you prefer URLs array
import { YT_VIDEOS as STATIC_YT_VIDEOS } from '../../data'
import useIsMobile from '../../shared/hooks/useIsMobile'

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
  const isMobile = useIsMobile()
  const DEFAULT_MOBILE = 3
  const DEFAULT_DESKTOP = 6

  // Track how many videos are visible
  const [visibleCount, setVisibleCount] = useState(isMobile ? DEFAULT_MOBILE : DEFAULT_DESKTOP)

  // Update visibleCount if device type changes
  useEffect(() => {
    setVisibleCount(isMobile ? DEFAULT_MOBILE : DEFAULT_DESKTOP)
  }, [isMobile])

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

  // Videos to display (plus the external card)
  const shownVideos = videos ? videos.slice(0, visibleCount) : []

  // Show "See more" if there are more videos to show
  const canSeeMore = videos && visibleCount < videos.length

  // Split videos: latest and others
  const latestVideo = shownVideos.length > 0 ? shownVideos[0] : null
  const otherVideos = shownVideos.length > 1 ? shownVideos.slice(1) : []

  return (
    <Section id="videos" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-zinc-300"/>
        <h2 className="text-xl font-semibold text-zinc-100">Talks & Videos</h2>
      </div>
      {!videos && !error && <div className="text-zinc-400 mb-4">Loading videos...</div>}

      {/* Responsive layout: flex on desktop, column on mobile */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Latest video (left on desktop, top on mobile) */}
        {latestVideo && (
          <div className="md:w-1/2 w-full flex flex-col">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${getYTid(latestVideo)}`}
                  title="Latest YouTube video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                {/* Latest tag */}
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
                  Latest
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Other videos (right on desktop, below on mobile) */}
        <div className="md:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          {otherVideos.map((u) => {
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
        </div>
      </div>

      {canSeeMore && (
        <div className="mt-6 flex justify-center">
          <A as="button" className="px-6 py-2 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition" onClick={() => setVisibleCount(videos.length)}>
            See more
          </A>
        </div>
      )}
    </Section>
  )
}
