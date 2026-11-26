import { motion } from 'framer-motion'
import { CLS, SIGHTING_BOXES } from '../lib/data.js'

/** A project image with hand-placed detections on it. */
export default function Cover({ project, image, boxes = true, layout = true, eager = false, sizes }) {
  const img = image || project.images[0]
  const list = boxes && img === project.images[0] ? SIGHTING_BOXES[project.slug] || [] : []
  return (
    <motion.div
      layoutId={layout ? `sj-cover-${project.slug}` : undefined}
      className="sj-cover"
      style={{ aspectRatio: `${img.w} / ${img.h}`, '--ar': img.w / img.h }}
      transition={{ type: 'spring', stiffness: 380, damping: 38 }}
    >
      <img src={img.src} alt={img.alt} width={img.w} height={img.h} loading={eager ? 'eager' : 'lazy'} decoding="async" sizes={sizes} />
      {list.map((b, i) => (
        <span key={i} className={`sj-box sj-on sj-cover-box${b.below ? ' sj-tab-below' : ''}`} aria-hidden="true"
          style={{ '--c': CLS[b.cls], left: `${b.b[0] * 100}%`, top: `${b.b[1] * 100}%`, width: `${b.b[2] * 100}%`, height: `${b.b[3] * 100}%`, '--i': i }}>
          <span className="sj-box-tab"><span className="sj-box-label">{b.label}</span></span>
        </span>
      ))}
    </motion.div>
  )
}
