import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoAccounts } from '../../auth/accounts'
import { defaultRouteByRole, getSession, setSession } from '../../auth/session'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const activeSession = getSession()
    if (activeSession) {
      navigate(defaultRouteByRole[activeSession.role], { replace: true })
    }
  }, [navigate])

  function onSubmit(event) {
    event.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    if (!String(email).includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    const account = demoAccounts.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password &&
        item.role === role,
    )

    if (!account) {
      setError('Invalid account, password, or role.')
      return
    }

    setError('')
    setSession({
      email: account.email,
      name: account.name,
      role: account.role,
    })
    navigate(defaultRouteByRole[account.role], { replace: true })
  }

  return (
    <div className="auth-page">
      <section className="auth-layout">
        <aside className="auth-showcase">
          <p className="storefront-kicker">BookVerse</p>
          <h1>Welcome back to your next reading journey.</h1>
          <p>
            Sign in to browse curated books, manage your cart, and track every order with
            a customer-first experience.
          </p>
          <ul>
            <li>Personalized catalog discovery</li>
            <li>Fast checkout flow</li>
            <li>Clear order tracking timeline</li>
          </ul>
        </aside>

        <form className="auth-card" onSubmit={onSubmit}>
          <p className="eyebrow">Authentication</p>
          <h2>Sign in to BookOps</h2>
          <label>
            Email
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Password
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>
          <label>
            Role
            <Select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </Select>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <Button className="w-full" type="submit">Continue</Button>
        </form>
      </section>
    </div>
  )
}
