import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import { getCartItems, saveCartItems } from '../../services/cart'

const PAGE_SIZE = 5

export default function CartPage() {
  const [items, setItems] = useState(() => getCartItems())
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()

  const total = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.price, 0), [items])
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function updateQty(id, qty) {
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, qty: Math.max(1, qty || 1) } : item,
    )
    setItems(nextItems)
    saveCartItems(nextItems)
  }

  function removeItem(id) {
    const nextItems = items.filter((item) => item.id !== id)
    setItems(nextItems)
    saveCartItems(nextItems)
  }

  return (
    <>
      <PageHeader
        title="Cart"
        subtitle="Review cart items before checkout."
        right={
          <Button onClick={() => navigate('/customer/checkout')} disabled={items.length === 0}>
            Go to Checkout
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Browse the catalog and add a few books to continue checkout."
          actionLabel="Open Catalog"
          onAction={() => navigate('/customer/catalog')}
        />
      ) : (
      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <Input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(event) => updateQty(item.id, Number(event.target.value))}
                    className="qty-input"
                  />
                </td>
                <td>${item.price}</td>
                <td>${item.qty * item.price}</td>
                <td>
                  <Button variant="ghost" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={items.length}
          onPageChange={setCurrentPage}
        />
      </section>
      )}
      <p className="cart-total">Grand Total: ${total}</p>
    </>
  )
}
