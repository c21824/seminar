import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { getOrders } from '../../services/api'

const PAGE_SIZE = 5

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

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
    <>
      <PageHeader title="My Orders" subtitle="Order list from order-service." />
      {loading ? <Spinner label="Loading your orders..." /> : null}
      {!loading && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Complete checkout to see your order history here."
        />
      ) : null}

      {!loading && orders.length > 0 ? (
      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.name}</td>
                <td>{order.description || '-'}</td>
                <td>
                  <Link className="link-inline" to={`/customer/orders/${order.id}`}>
                    Track
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={orders.length}
          onPageChange={setCurrentPage}
        />
      </section>
      ) : null}
    </>
  )
}
