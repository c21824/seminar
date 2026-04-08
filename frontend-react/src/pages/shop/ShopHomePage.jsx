import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBooks, getOrders } from '../../services/api'

export default function ShopHomePage() {
  const [bookCount, setBookCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    getBooks().then((rows) => setBookCount(rows.length)).catch(() => setBookCount(0))
    getOrders().then((rows) => setOrderCount(rows.length)).catch(() => setOrderCount(0))
  }, [])

  return (
    <div className="storefront-stack">
      <section className="storefront-hero">
        <p className="storefront-kicker">Your personal bookstore</p>
        <h1>Find your next favorite book in minutes.</h1>
        <p>
          Explore curated collections, save items to cart, and complete checkout with a clear
          order tracking flow.
        </p>
        <div className="storefront-hero-actions">
          <Link to="/customer/catalog" className="storefront-cta">
            Browse Catalog
          </Link>
          <Link to="/customer/orders" className="storefront-cta ghost">
            Track My Orders
          </Link>
        </div>
      </section>

      <section className="storefront-metrics" aria-label="Storefront metrics">
        <article className="storefront-metric-card">
          <p>Books available</p>
          <h2>{bookCount}</h2>
          <small>Fresh listings from book service</small>
        </article>
        <article className="storefront-metric-card">
          <p>Orders completed</p>
          <h2>{orderCount}</h2>
          <small>Everything in one tracking timeline</small>
        </article>
        <article className="storefront-metric-card">
          <p>Support status</p>
          <h2>Online</h2>
          <small>AI recommendations ready</small>
        </article>
      </section>

      <section className="storefront-feature-grid">
        <article className="storefront-feature-card">
          <h3>Discover by topic</h3>
          <p>Filter by catalog and jump directly to detailed book pages with one click.</p>
          <Link to="/customer/catalog">Open catalog</Link>
        </article>
        <article className="storefront-feature-card">
          <h3>Checkout that feels simple</h3>
          <p>Review cart, confirm shipping details, and place order with a cleaner payment summary.</p>
          <Link to="/customer/cart">Go to cart</Link>
        </article>
        <article className="storefront-feature-card">
          <h3>Ask for recommendations</h3>
          <p>Use AI support when you want personalized suggestions for your reading goals.</p>
          <Link to="/customer/chat">Open AI support</Link>
        </article>
      </section>
    </div>
  )
}
