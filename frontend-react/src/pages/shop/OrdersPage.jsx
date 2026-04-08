import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { getOrders } from '../../services/api'

const PAGE_SIZE = 5

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const statusPool = ['Processing', 'Packing', 'In transit', 'Delivered']

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE))
  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return orders.slice(start, start + PAGE_SIZE)
  }, [orders, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [orders.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setLoading(true)
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="storefront-stack">
      <section className="storefront-section-head compact">
        <div>
          <p className="storefront-kicker">Orders</p>
          <h1>Track your purchases in one place.</h1>
          <p>Check fulfillment status and open detail timeline for each order.</p>
        </div>
      </section>

      {loading ? <Spinner label="Loading your orders..." /> : null}
      {!loading && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Complete checkout to see your order history here."
        />
      ) : null}

      {!loading && orders.length > 0 ? (
      <section className="orders-grid">
        {pagedOrders.map((order) => {
          const status = statusPool[Number(order.id) % statusPool.length]
          return (
            <article key={order.id} className="order-card">
              <p className="storefront-chip">Order #{order.id}</p>
              <h3>{order.name}</h3>
              <p>{order.description || 'No extra description provided.'}</p>
              <div className="order-card-footer">
                <span className="order-status">{status}</span>
                <Link className="storefront-cta compact" to={`/customer/orders/${order.id}`}>
                  View timeline
                </Link>
              </div>
            </article>
          )
        })}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={orders.length}
          onPageChange={setCurrentPage}
        />
      </section>
      ) : null}
    </div>
  )
}
