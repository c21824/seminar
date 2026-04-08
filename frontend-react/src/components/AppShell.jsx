import React, { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../auth/session'
import Button from './ui/Button'

const navByRole = {
  customer: [
    { to: '/customer/home', label: 'Home' },
    { to: '/customer/catalog', label: 'Catalog' },
    { to: '/customer/chat', label: 'AI Chat' },
    { to: '/customer/cart', label: 'Cart' },
    { to: '/customer/checkout', label: 'Checkout' },
    { to: '/customer/orders', label: 'Orders' },
    { to: '/customer/reviews', label: 'Reviews' },
  ],
  staff: [
    { to: '/staff/books', label: 'Books Management' },
    { to: '/staff/catalog', label: 'Catalog Management' },
    { to: '/staff/orders', label: 'Orders Management' },
    { to: '/staff/health', label: 'Service Health' },
  ],
  manager: [
    { to: '/manager/approvals', label: 'Approvals' },
    { to: '/manager/reports', label: 'Reports' },
    { to: '/manager/health', label: 'Service Health' },
  ],
}

export default function AppShell({ role }) {
  const session = getSession()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const workspaceTitle = useMemo(() => `${role?.toUpperCase()} workspace`, [role])

  function logout() {
    clearSession()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <button
        type="button"
        aria-expanded={mobileNavOpen}
        aria-controls="mobile-main-navigation"
        className="mobile-nav-toggle btn-ghost"
        onClick={() => setMobileNavOpen((prev) => !prev)}
      >
        {mobileNavOpen ? 'Close Menu' : 'Open Menu'}
      </button>

      <aside className={`sidebar role-${role} ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="brand-block">
          <span className="brand-dot" aria-hidden="true" />
          <h1>BookOps UI</h1>
        </div>
        <p className="sidebar-sub">{workspaceTitle}</p>
        <div className="nav-group">
          <h2>{role}</h2>
          <nav id="mobile-main-navigation" role="navigation" aria-label="Main Navigation">
            {(navByRole[role] || []).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={() => setMobileNavOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Book Commerce Platform</p>
            <strong>{session?.name || 'User'}</strong>
          </div>
          <span className={`role-chip role-${session?.role || role}`}>{session?.role || role}</span>
          <Button onClick={logout} variant="ghost">Logout</Button>
        </header>
        <main className="page-content" role="main" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
