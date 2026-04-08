import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import {
  getCartItems,
  getCheckoutSelection,
  saveCartItems,
  saveCheckoutSelection,
} from '../../services/cart'

const PAGE_SIZE = 5

export default function CartPage() {
  const [items, setItems] = useState(() => getCartItems())
  const [selectedIds, setSelectedIds] = useState(() => {
    const selected = new Set(getCheckoutSelection())
    const currentItems = getCartItems()
    if (selected.size === 0) {
      return currentItems.map((item) => String(item.id))
    }
    return currentItems
      .map((item) => String(item.id))
      .filter((id) => selected.has(id))
  })
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()

  const total = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.price, 0), [items])
  const selectedTotal = useMemo(
    () => items
      .filter((item) => selectedIds.includes(String(item.id)))
      .reduce((sum, item) => sum + item.qty * item.price, 0),
    [items, selectedIds],
  )
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, currentPage])
  const selectedOnPage = useMemo(
    () => pagedItems
      .map((item) => String(item.id))
      .filter((id) => selectedIds.includes(id)),
    [pagedItems, selectedIds],
  )
  const allOnPageSelected = pagedItems.length > 0 && selectedOnPage.length === pagedItems.length

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    const availableIds = new Set(items.map((item) => String(item.id)))
    const nextSelected = selectedIds.filter((id) => availableIds.has(id))
    if (nextSelected.length !== selectedIds.length) {
      setSelectedIds(nextSelected)
      return
    }
    saveCheckoutSelection(nextSelected)
  }, [items, selectedIds])

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

  function toggleItem(id) {
    const stringId = String(id)
    setSelectedIds((prev) => (
      prev.includes(stringId)
        ? prev.filter((value) => value !== stringId)
        : [...prev, stringId]
    ))
  }

  function toggleAllOnPage(checked) {
    const pageIds = pagedItems.map((item) => String(item.id))
    setSelectedIds((prev) => {
      if (checked) {
        const merged = new Set([...prev, ...pageIds])
        return [...merged]
      }
      return prev.filter((id) => !pageIds.includes(id))
    })
  }

  function goToCheckout() {
    navigate('/customer/checkout', { state: { selectedIds } })
  }

  return (
    <div className="storefront-stack">
      <section className="storefront-section-head compact">
        <div>
          <p className="storefront-kicker">Cart</p>
          <h1>Review your selected books.</h1>
          <p>Choose items for checkout and adjust quantities before payment.</p>
        </div>
      </section>

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Browse the catalog and add a few books to continue checkout."
          actionLabel="Open Catalog"
          onAction={() => navigate('/customer/catalog')}
        />
      ) : (
      <section className="cart-layout">
        <article className="cart-list-card">
          <label className="cart-select-all">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={(event) => toggleAllOnPage(event.target.checked)}
              aria-label="Select all books on current page"
            />
            <span>Select all items on this page</span>
          </label>

          <div className="cart-items-list">
            {pagedItems.map((item) => (
              <article key={item.id} className="cart-item-row">
                <div className="cart-item-main">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(String(item.id))}
                    onChange={() => toggleItem(item.id)}
                    aria-label={`Select ${item.name} for checkout`}
                  />
                  <div>
                    <h3>{item.name}</h3>
                    <p>${item.price} each</p>
                  </div>
                </div>
                <div className="cart-item-controls">
                  <Input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(event) => updateQty(item.id, Number(event.target.value))}
                    className="qty-input"
                  />
                  <strong>${item.qty * item.price}</strong>
                  <Button variant="ghost" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={items.length}
            onPageChange={setCurrentPage}
          />
        </article>

        <aside className="cart-summary-card">
          <h2>Order summary</h2>
          <p>{selectedIds.length} selected items ready for checkout.</p>
          <div className="cart-summary-lines">
            <p><span>Selected total</span><strong>${selectedTotal}</strong></p>
            <p><span>Cart total</span><strong>${total}</strong></p>
          </div>
          <Button onClick={goToCheckout} disabled={selectedIds.length === 0}>
            Continue to Checkout
          </Button>
        </aside>
      </section>
      )}
    </div>
  )
}
