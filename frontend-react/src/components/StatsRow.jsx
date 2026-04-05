import React from 'react'

export default function StatsRow({ stats }) {
  return (
    <section className="stats-row">
      {stats.map((item) => (
        <article className="stat-card" key={item.label}>
          <p>{item.label}</p>
          <h3>{item.value}</h3>
          {item.hint ? <span>{item.hint}</span> : null}
          <div className="mt-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-brandCyan to-brandCoral" aria-hidden="true" />
        </article>
      ))}
    </section>
  )
}
