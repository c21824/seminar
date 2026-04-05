import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'

export default function PaymentResultPage() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const status = params.get('status') || 'success'

  return (
    <>
      <PageHeader title="Payment Result" subtitle="Final checkout state from pay-service." />
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
    </>
  )
}
