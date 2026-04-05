import React, { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import StatsRow from '../../components/StatsRow'
import Button from '../../components/ui/Button'
import { getBooks, getOrders, getReviews } from '../../services/api'

export default function ReportsPage() {
  const [books, setBooks] = useState(0)
  const [orders, setOrders] = useState(0)
  const [reviews, setReviews] = useState(0)

  useEffect(() => {
    getBooks().then((rows) => setBooks(rows.length)).catch(() => setBooks(0))
    getOrders().then((rows) => setOrders(rows.length)).catch(() => setOrders(0))
    getReviews().then((rows) => setReviews(rows.length)).catch(() => setReviews(0))
  }, [])

  return (
    <>
      <PageHeader title="Reports" subtitle="Manager KPIs aggregated from core services." />
      <StatsRow
        stats={[
          { label: 'Books', value: books },
          { label: 'Orders', value: orders },
          { label: 'Reviews', value: reviews },
        ]}
      />
      <section className="panel-grid">
        <article className="panel">
          <h3>Weekly Insight</h3>
          <p>Order volume and review signals are stable. Consider retraining recommendation model weekly.</p>
        </article>
        <article className="panel">
          <h3>Export</h3>
          <p>Use reporting-service integration to export CSV and executive summaries.</p>
          <Button>Export CSV</Button>
        </article>
      </section>
    </>
  )
}
