import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import StatsRow from '../../components/StatsRow'
import { getBooks, getOrders } from '../../services/api'

export default function ShopHomePage() {
  const [bookCount, setBookCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    getBooks().then((rows) => setBookCount(rows.length)).catch(() => setBookCount(0))
    getOrders().then((rows) => setOrderCount(rows.length)).catch(() => setOrderCount(0))
  }, [])

  return (
    <>
      <PageHeader
        title="Customer Storefront"
        subtitle="Discover books, manage cart, and follow your orders end-to-end."
      />
      <StatsRow
        stats={[
          { label: 'Books Available', value: bookCount },
          { label: 'My Orders', value: orderCount },
          { label: 'Checkout Status', value: 'Ready', hint: 'Gateway + services online' },
        ]}
      />

      <section className="panel-grid customer-home-grid">
        <article className="panel customer-home-card">
          <h3>Quick Start</h3>
          <p>Browse catalog, add to cart, then complete payment in a single flow.</p>
          <Link to="/customer/catalog" className="link-btn customer-home-link">
            Open Catalog
          </Link>
        </article>
        <article className="panel customer-home-card">
          <h3>Order Tracking</h3>
          <p>Track order and shipment updates from order-service and ship-service.</p>
          <Link to="/customer/orders" className="link-btn customer-home-link">
            View Orders
          </Link>
        </article>
        <article className="panel customer-home-card">
          <h3>Reviews and Recommendations</h3>
          <p>Rate books and improve AI suggestions over time.</p>
          <Link to="/customer/reviews" className="link-btn customer-home-link">
            Manage Reviews
          </Link>
        </article>
      </section>
    </>
  )
}
