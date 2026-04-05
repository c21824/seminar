import React from 'react'
import Button from './Button'

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <section className="rounded-2xl border border-dashed border-lineStrong bg-white/90 p-8 text-center">
      <p className="mb-2 font-heading text-xl font-semibold text-textStrong">{title}</p>
      <p className="mx-auto mb-4 max-w-xl text-sm text-textMuted">{message}</p>
      {actionLabel && onAction ? (
        <Button variant="ghost" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  )
}
