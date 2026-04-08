import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import { getBooks } from '../../services/api'
import { addToCart } from '../../services/cart'
import { useToast } from '../../contexts/ToastContext'
import { cleanDescription, getBookCatalog, getBookCover, getBookPrice } from '../../mocks/parseMetadata'

export default function BookDetailPage() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    setLoading(true)
    getBooks()
      .then((rows) => rows.find((item) => String(item.id) === String(id)))
      .then((selected) => setBook(selected || null))
      .catch(() => setBook(null))
      .finally(() => setLoading(false))
  }, [id])

  function handleAddToCart() {
    if (!book) {
      return
    }
    addToCart(book)
    showToast('Book added to cart.', 'success')
  }

  if (loading) {
    return <Spinner label="Loading book details..." />
  }

  if (!book) {
    return (
      <div className="storefront-stack">
        <section className="storefront-section-head compact">
          <div>
            <p className="storefront-kicker">Book detail</p>
            <h1>No book found</h1>
          </div>
        </section>
        <EmptyState
          title="Book not found"
          message="The selected item may have been removed or does not exist."
          actionLabel="Back to Catalog"
          onAction={() => navigate('/customer/catalog')}
        />
      </div>
    )
  }

  return (
    <div className="storefront-stack">
      <section className="storefront-section-head compact">
        <div>
          <p className="storefront-kicker">Book detail</p>
          <h1>{book.name}</h1>
          <p>Review details and add this title to your cart.</p>
        </div>
      </section>
      <section className="book-detail-layout">
        <article className="book-detail-card">
          {getBookCover(book) ? (
            <img className="cover-large" src={getBookCover(book)} alt={book.name} />
          ) : (
            <p>No cover image available.</p>
          )}
        </article>
        <article className="book-detail-card">
          <h3>Overview</h3>
          <p><strong>Catalog:</strong> {getBookCatalog(book) || '-'}</p>
          <p><strong>Price:</strong> {getBookPrice(book) ? `$${getBookPrice(book)}` : '-'}</p>
          <p>{cleanDescription(book.description) || 'No description available.'}</p>
          <div className="actions-row">
            <Button onClick={handleAddToCart}>Add to Cart</Button>
            <Button variant="ghost" onClick={() => navigate('/customer/cart')}>
              Open Cart
            </Button>
          </div>
        </article>
      </section>
    </div>
  )
}
