import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../contexts/ToastContext'
import { createOrder } from '../../services/api'

export default function CheckoutPage() {
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

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
      await createOrder({
        name: `Order for ${fullName || 'Customer'}`,
        description: `Address: ${address} | Payment: ${paymentMethod}`,
      })
      showToast('Order created successfully.', 'success')
      navigate('/customer/payment-result?status=success')
    } catch {
      showToast('Payment request failed. Please try again.', 'error')
      navigate('/customer/payment-result?status=failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Checkout" subtitle="Submit shipping and payment information." />
      <form className="form-card" onSubmit={submit}>
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
    </>
  )
}
