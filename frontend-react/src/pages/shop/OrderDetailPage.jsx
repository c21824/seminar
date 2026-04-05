import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { getOrders } from '../../services/api'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    getOrders()
      .then((rows) => rows.find((item) => String(item.id) === String(id)))
      .then((selected) => setOrder(selected || null))
      .catch(() => setOrder(null))
  }, [id])

  const timeline = ['Order created', 'Payment completed', 'Shipment prepared', 'Delivered']

  return (
    <>
      <PageHeader title={`Order #${id}`} subtitle="Order and shipment timeline." />
      <section className="panel-grid">
        <article className="panel">
          <h3>Order Information</h3>
          <p><strong>Name:</strong> {order?.name || '-'}</p>
          <p><strong>Description:</strong> {order?.description || '-'}</p>
        </article>
        <article className="panel">
          <h3>Shipment Timeline</h3>
          <ol className="timeline">
            {timeline.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </section>
    </>
  )
}
