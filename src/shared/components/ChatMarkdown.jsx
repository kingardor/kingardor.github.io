import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ChatMarkdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
      {children || ''}
    </ReactMarkdown>
  )
}