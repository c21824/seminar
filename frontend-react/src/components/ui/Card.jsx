import React from 'react'

export default function Card({ className = '', as: Tag = 'article', children }) {
  return <Tag className={`card-surface ${className}`.trim()}>{children}</Tag>
}
