import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="result-card">
      <h3>Page not found</h3>
      <p>The route you requested does not exist in this frontend module.</p>
      <Link className="link-btn" to="/customer/home">
        Back to Home
      </Link>
    </section>
  )
}
