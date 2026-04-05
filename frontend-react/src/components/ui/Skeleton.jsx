import React from 'react'

export default function Skeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 rounded-2xl border border-lineSoft bg-white p-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-4 animate-pulse rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100"
          style={{ width: `${92 - idx * 10}%` }}
        />
      ))}
    </div>
  )
}
