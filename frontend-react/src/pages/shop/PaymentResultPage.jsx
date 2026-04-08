import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function PaymentResultPage() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const status = params.get('status') || 'success'

  return (
    <div className="storefront-stack">
      <section className="storefront-section-head compact">
        <div>
          <p className="storefront-kicker">Checkout result</p>
          <h1>{status === 'success' ? 'Payment successful' : 'Payment failed'}</h1>
          <p>Final checkout state from pay service.</p>
        </div>
      </section>
      <section className="result-card">
        <h3>{status === 'success' ? 'Payment Successful' : 'Payment Failed'}</h3>
        <p>
          {status === 'success'
            ? 'Your order is confirmed and shipping flow will continue.'
            : 'Please retry payment from checkout.'}
        </p>
        <div className="actions-row">
          <Link className="link-btn" to="/customer/orders">
            View Orders
          </Link>
          <Link className="link-btn" to="/customer/checkout">
            Back to Checkout
          </Link>
        </div>
      </section>
    </div>
  )
}
