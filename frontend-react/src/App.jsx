import React from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import AppShell from './components/AppShell'
import CustomerShell from './components/CustomerShell'
import LoginPage from './pages/auth/LoginPage'
import HomeBooksPage from './pages/shop/HomeBooksPage'
import CatalogPage from './pages/shop/CatalogPage'
import BookDetailPage from './pages/shop/BookDetailPage'
import CartPage from './pages/shop/CartPage'
import CheckoutPage from './pages/shop/CheckoutPage'
import PaymentResultPage from './pages/shop/PaymentResultPage'
import OrdersPage from './pages/shop/OrdersPage'
import OrderDetailPage from './pages/shop/OrderDetailPage'
import ReviewsPage from './pages/shop/ReviewsPage'
import ChatSupportPage from './pages/shop/ChatSupportPage'
import BooksManagementPage from './pages/staff/BooksManagementPage'
import CatalogManagementPage from './pages/staff/CatalogManagementPage'
import OrdersManagementPage from './pages/staff/OrdersManagementPage'
import ApprovalsPage from './pages/manager/ApprovalsPage'
import ReportsPage from './pages/manager/ReportsPage'
import HealthPage from './pages/system/HealthPage'
import NotFoundPage from './pages/NotFoundPage'
import { defaultRouteByRole, getSession } from './auth/session'
import ErrorBoundary from './components/ErrorBoundary'

function RootRedirect() {
  const session = getSession()
  if (!session) {
    return <Navigate to="/auth/login" replace />
  }
  return <Navigate to={defaultRouteByRole[session.role] || '/auth/login'} replace />
}

function RequireRole({ roles, children }) {
  const session = getSession()
  if (!session) {
    return <Navigate to="/auth/login" replace />
  }
  if (!roles.includes(session.role)) {
    return <Navigate to={defaultRouteByRole[session.role]} replace />
  }
  return children
}

const router = createBrowserRouter([
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/', element: <RootRedirect /> },
  { path: '/shop/home', element: <Navigate to="/customer/home" replace /> },
  { path: '/shop/catalog', element: <Navigate to="/customer/catalog" replace /> },
  { path: '/shop/books/:id', element: <Navigate to="/customer/catalog" replace /> },
  { path: '/shop/cart', element: <Navigate to="/customer/cart" replace /> },
  { path: '/shop/checkout', element: <Navigate to="/customer/checkout" replace /> },
  { path: '/shop/payment-result', element: <Navigate to="/customer/payment-result" replace /> },
  { path: '/shop/orders', element: <Navigate to="/customer/orders" replace /> },
  { path: '/shop/orders/:id', element: <Navigate to="/customer/orders" replace /> },
  { path: '/shop/reviews', element: <Navigate to="/customer/reviews" replace /> },
  {
    path: '/customer',
    element: (
      <RequireRole roles={['customer']}>
        <CustomerShell />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="/customer/home" replace /> },
      { path: 'home', element: <HomeBooksPage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'payment-result', element: <PaymentResultPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'chat', element: <ChatSupportPage /> },
    ],
  },
  {
    path: '/staff',
    element: (
      <RequireRole roles={['staff']}>
        <AppShell role="staff" />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="/staff/books" replace /> },
      { path: 'books', element: <BooksManagementPage /> },
      { path: 'catalog', element: <CatalogManagementPage /> },
      { path: 'orders', element: <OrdersManagementPage /> },
      { path: 'health', element: <HealthPage /> },
    ],
  },
  {
    path: '/manager',
    element: (
      <RequireRole roles={['manager']}>
        <AppShell role="manager" />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="/manager/approvals" replace /> },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'health', element: <HealthPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
