import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function PageHeader({ title, subtitle, right }) {
  const location = useLocation()
  const crumbs = location.pathname.split('/').filter(Boolean)

  const breadcrumb = crumbs.map((segment, index) => {
    const path = `/${crumbs.slice(0, index + 1).join('/')}`
    const label = segment.replace(/-/g, ' ')
    const text = label.charAt(0).toUpperCase() + label.slice(1)
    const isLast = index === crumbs.length - 1

    return (
      <span key={path} className="inline-flex items-center gap-2 text-xs text-textMuted">
        {index > 0 ? <span>/</span> : null}
        {isLast ? (
          <span className="font-semibold text-textStrong">{text}</span>
        ) : (
          <Link className="hover:text-brandBlue" to={path}>
            {text}
          </Link>
        )}
      </span>
    )
  })

  return (
    <section className="page-header rounded-2xl border border-lineSoft/60 bg-white/70 p-4 shadow-card">
      <div>
        <div className="mb-2 flex flex-wrap gap-1.5">{breadcrumb}</div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </section>
  )
}
