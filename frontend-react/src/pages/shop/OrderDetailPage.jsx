import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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

  const timeline = [
    { label: 'Order created', note: 'Your order request was received.' },
    { label: 'Payment completed', note: 'Payment details were verified.' },
    { label: 'Shipment prepared', note: 'Warehouse is preparing your package.' },
    { label: 'Delivered', note: 'Package arrived at destination.' },
  ]

  return (
    <div className="storefront-stack">
      <section className="storefront-section-head compact">
        <div>
          <p className="storefront-kicker">Order detail</p>
          <h1>Order #{id}</h1>
          <p>Follow each stage from payment confirmation to delivery.</p>
        </div>
        <Link to="/customer/orders" className="storefront-cta ghost compact">Back to orders</Link>
      </section>

      <section className="order-detail-layout">
        <article className="order-detail-card">
          <h2>Order information</h2>
          <p><strong>Name:</strong> {order?.name || '-'}</p>
          <p><strong>Description:</strong> {order?.description || '-'}</p>
        </article>

        <article className="order-detail-card">
          <h2>Shipment timeline</h2>
          <ol className="timeline-modern">
            {timeline.map((step, index) => (
              <li key={step.label} className={index < 3 ? 'done' : ''}>
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </div>
  )
}
