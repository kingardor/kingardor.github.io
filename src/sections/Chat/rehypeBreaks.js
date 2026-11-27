/**
 * The model sometimes puts literal `<br>` inside markdown table cells (seen in
 * production). Without raw-HTML support that shows up as the text "<br>".
 * This turns exactly that tag into a real line break and leaves every other
 * piece of HTML as plain text, so nothing else from the model is rendered.
 */
const BR = /<br\s*\/?>/i
const BR_SPLIT = /(<br\s*\/?>)/gi

function convert(node) {
  if (!node.children) return
  const next = []
  for (const child of node.children) {
    if (child.type === 'raw' && BR.test(child.value) && child.value.trim().replace(BR, '') === '') {
      next.push({ type: 'element', tagName: 'br', properties: {}, children: [] })
    } else if (child.type === 'text' && BR.test(child.value)) {
      for (const part of child.value.split(BR_SPLIT)) {
        if (!part) continue
        next.push(BR.test(part) ? { type: 'element', tagName: 'br', properties: {}, children: [] } : { type: 'text', value: part })
      }
    } else {
      convert(child)
      next.push(child)
    }
  }
  node.children = next
}

export default function rehypeBreaks() {
  return (tree) => { convert(tree) }
}
