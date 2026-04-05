import React from 'react'

const styleByStatus = {
  ok: 'bg-ok/15 text-ok',
  healthy: 'bg-ok/15 text-ok',
  up: 'bg-ok/15 text-ok',
  down: 'bg-danger/15 text-danger',
  error: 'bg-danger/15 text-danger',
  failed: 'bg-danger/15 text-danger',
  unknown: 'bg-slate-200 text-slate-700',
}

export default function Badge({ status = 'unknown', children }) {
  const normalized = String(status || 'unknown').toLowerCase()
  const classes = styleByStatus[normalized] || styleByStatus.unknown

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${classes}`}>
      {children || normalized}
    </span>
  )
}
