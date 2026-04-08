const CART_KEY = 'bookops-cart'
const CHECKOUT_SELECTION_KEY = 'bookops-cart-checkout-selection'

export function getCartItems() {
  try {
    const raw = window.sessionStorage.getItem(CART_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCartItems(items) {
  window.sessionStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function getCheckoutSelection() {
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_SELECTION_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : []
  } catch {
    return []
  }
}

export function saveCheckoutSelection(ids) {
  const normalized = Array.isArray(ids) ? ids.map((id) => String(id)) : []
  window.sessionStorage.setItem(CHECKOUT_SELECTION_KEY, JSON.stringify(normalized))
}

export function clearCheckoutSelection() {
  window.sessionStorage.removeItem(CHECKOUT_SELECTION_KEY)
}

export function addToCart(book) {
  const items = getCartItems()
  const existing = items.find((item) => String(item.id) === String(book.id))

  const nextItems = existing
    ? items.map((item) => (String(item.id) === String(book.id) ? { ...item, qty: item.qty + 1 } : item))
    : [...items, { id: book.id, name: book.name, qty: 1, price: Number(book.price || 25) }]

  saveCartItems(nextItems)
  return nextItems
}
