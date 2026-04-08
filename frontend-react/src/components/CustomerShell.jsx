import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../auth/session'

const navItems = [
  { to: '/customer/home', label: 'Home' },
  { to: '/customer/catalog', label: 'Catalog' },
  { to: '/customer/cart', label: 'Cart' },
  { to: '/customer/checkout', label: 'Checkout' },
  { to: '/customer/orders', label: 'Orders' },
  { to: '/customer/chat', label: 'AI Support' },
]

export default function CustomerShell() {
  const session = getSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const greeting = useMemo(() => {
    if (!session?.name) {
      return 'Reader'
    }
    return session.name.split(' ')[0]
  }, [session?.name])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  function logout() {
    clearSession()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="customer-shell">
      <header className="customer-header">
        <div className="customer-header-main">
          <button
            type="button"
            className="customer-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="customer-nav"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
          <button type="button" className="customer-brand" onClick={() => navigate('/customer/home')}>
            <span className="customer-brand-mark" aria-hidden="true" />
            <span>
              <strong>BookVerse</strong>
              <small>Bookstore and reading space</small>
            </span>
          </button>

          <div className="customer-header-actions">
            <span className="customer-greeting">Hi, {greeting}</span>
            <button type="button" className="customer-icon-link danger" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav id="customer-nav" className={`customer-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Customer navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'customer-nav-link active' : 'customer-nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="customer-content" role="main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
