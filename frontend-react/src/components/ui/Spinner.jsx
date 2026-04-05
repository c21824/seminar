import React from 'react'

export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-lineSoft bg-white p-4 text-textMuted">
      <span
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brandCyan/30 border-t-brandCyan"
        aria-hidden="true"
      />
      <span className="font-medium">{label}</span>
    </div>
  )
}
