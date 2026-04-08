import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../contexts/ToastContext'
import { createOrder } from '../../services/api'
import {
  clearCheckoutSelection,
  getCartItems,
  getCheckoutSelection,
  saveCartItems,
} from '../../services/cart'

export default function CheckoutPage() {
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const cartItems = getCartItems()
  const stateSelected = Array.isArray(location.state?.selectedIds)
    ? location.state.selectedIds.map((id) => String(id))
    : []
  const storedSelected = getCheckoutSelection()
  const selectedIds = stateSelected.length > 0 ? stateSelected : storedSelected
  const selectedItems = cartItems.filter((item) => selectedIds.includes(String(item.id)))
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.qty * item.price, 0)

  async function submit(event) {
    event.preventDefault()
    if (fullName.trim().length < 2) {
      setFormError('Please enter a valid full name.')
      return
    }
    if (address.trim().length < 6) {
      setFormError('Shipping address is too short.')
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      const orderLines = selectedItems.map((item) => `${item.name} x${item.qty}`).join(', ')
      await createOrder({
        name: `Order for ${fullName || 'Customer'}`,
        description: `Address: ${address} | Payment: ${paymentMethod} | Items: ${orderLines} | Total: $${selectedTotal}`,
      })
      const purchased = new Set(selectedIds)
      const remainingItems = cartItems.filter((item) => !purchased.has(String(item.id)))
      saveCartItems(remainingItems)
      clearCheckoutSelection()
      showToast('Order created successfully.', 'success')
      navigate('/customer/payment-result?status=success')
    } catch {
      showToast('Payment request failed. Please try again.', 'error')
      navigate('/customer/payment-result?status=failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (selectedItems.length === 0) {
    return (
      <div className="storefront-stack">
        <section className="storefront-section-head compact">
          <div>
            <p className="storefront-kicker">Checkout</p>
            <h1>Complete your order</h1>
          </div>
        </section>
        <EmptyState
          title="No selected books"
          message="Please select at least one book in your cart before checkout."
          actionLabel="Back to Cart"
          onAction={() => navigate('/customer/cart')}
        />
      </div>
    )
  }

  return (
    <div className="storefront-stack">
      <section className="storefront-section-head compact">
        <div>
          <p className="storefront-kicker">Checkout</p>
          <h1>Shipping and payment details</h1>
          <p>Review selected books, then confirm your address and payment method.</p>
        </div>
      </section>

      <section className="checkout-layout">
        <aside className="checkout-summary">
          <h2>Order summary</h2>
          <p>{selectedItems.length} items selected</p>
          <ul>
            {selectedItems.map((item) => (
              <li key={item.id}>
                <span>{item.name} x{item.qty}</span>
                <strong>${item.qty * item.price}</strong>
              </li>
            ))}
          </ul>
          <div className="checkout-total-row">
            <span>Total to pay</span>
            <strong>${selectedTotal}</strong>
          </div>
        </aside>

        <form className="checkout-form" onSubmit={submit}>
          <label>
            Full Name
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </label>
          <label>
            Shipping Address
            <textarea className="field" value={address} onChange={(event) => setAddress(event.target.value)} required />
          </label>
          <label>
            Payment Method
            <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option value="card">Credit Card</option>
              <option value="banking">Online Banking</option>
              <option value="cod">Cash on Delivery</option>
            </Select>
          </label>
          {formError ? <p className="form-error">{formError}</p> : null}
          <Button className="w-full sm:w-auto" type="submit" disabled={submitting}>
            {submitting ? 'Processing...' : 'Place Order'}
          </Button>
        </form>
      </section>
    </div>
  )
}
