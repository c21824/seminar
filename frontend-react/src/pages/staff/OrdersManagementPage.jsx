import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { getOrders } from '../../services/api'

const PAGE_SIZE = 5

export default function OrdersManagementPage() {
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
      <PageHeader title="Orders Management" subtitle="Monitor operational order pipeline." />
      {loading ? <Spinner label="Loading order pipeline..." /> : null}
      {!loading && orders.length === 0 ? (
        <EmptyState title="No orders" message="Orders will appear after customers check out." />
      ) : null}

      {!loading && orders.length > 0 ? (
      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.description || '-'}</td>
                <td>
                  <span className="badge badge-ok">open</span>
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
