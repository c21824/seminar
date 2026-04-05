import React from 'react'

export default function Select({ className = '', children, ...props }) {
  return (
    <select className={`field ${className}`.trim()} {...props}>
      {children}
    </select>
  )
}
