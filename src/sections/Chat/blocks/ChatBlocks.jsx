import React from 'react'
import VideoCarousel  from './VideoCarousel'
import ProjectGrid    from './ProjectGrid'
import SkillCharts    from './SkillCharts'
import CareerTimeline from './CareerTimeline'
import PublicationList from './PublicationList'
import HonoursList    from './HonoursList'

/**
 * ChatBlocks — renders an array of rich data blocks below an AI message.
 * Each block: { type: string (tool name), data: any }
 */
export default function ChatBlocks({ blocks }) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'get_youtube_videos':  return <VideoCarousel  key={i} data={block.data} />
          case 'get_projects':        return <ProjectGrid    key={i} data={block.data} />
          case 'get_skills':          return <SkillCharts    key={i} data={block.data} />
          case 'get_career_timeline': return <CareerTimeline key={i} data={block.data} />
          case 'get_publications':    return <PublicationList key={i} data={block.data} />
          case 'get_honours':         return <HonoursList    key={i} data={block.data} />
          default:                    return null
        }
      })}
    </>
  )
}
