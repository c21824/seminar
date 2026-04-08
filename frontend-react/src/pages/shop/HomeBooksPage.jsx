import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { getBooks } from '../../services/api'
import { cleanDescription, getBookCatalog, getBookCover, getBookPrice } from '../../mocks/parseMetadata'

const PAGE_SIZE = 5

export default function HomeBooksPage() {
  const [books, setBooks] = useState([])
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getBooks()
      .then(setBooks)
      .catch(() => {
        setBooks([])
        setError('Could not load books from book-service.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredBooks = useMemo(() => {
    if (!query.trim()) {
      return books
    }
    const keyword = query.toLowerCase()
    return books.filter((book) => {
      const name = String(book.name || '').toLowerCase()
      const description = cleanDescription(book.description).toLowerCase()
      return name.includes(keyword) || description.includes(keyword)
    })
  }, [books, query])

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE))
  const pagedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredBooks.slice(start, start + PAGE_SIZE)
  }, [filteredBooks, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="storefront-stack catalog-page home-books-page">
      <section className="storefront-section-head compact home-books-head">
        <div>
          <p className="storefront-kicker">Home</p>
          <h1>All books in store</h1>
          <p>Search by title or keyword and explore your full inventory.</p>
        </div>
        <div className="storefront-filter-box home-search-box">
          <Input
            className="search"
            placeholder="Search title or keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </section>

      {loading ? <Spinner label="Loading books..." /> : null}
      {!loading && error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && filteredBooks.length === 0 ? (
        <EmptyState
          title="No books available"
          message="No books match your keyword. Try another search."
        />
      ) : null}

      {!loading && !error && filteredBooks.length > 0 ? (
        <>
          <section className="storefront-product-grid">
            {pagedBooks.map((book) => (
              <article key={book.id} className="storefront-product-card">
                <div className="storefront-cover-wrap">
                  {getBookCover(book) ? (
                    <img
                      src={getBookCover(book)}
                      alt={book.name}
                      className="storefront-cover"
                    />
                  ) : (
                    <div className="storefront-cover placeholder">No image</div>
                  )}
                </div>
                <div className="storefront-product-meta">
                  <p className="storefront-chip">{getBookCatalog(book) || 'General'}</p>
                  <h3>{book.name}</h3>
                  <p className="storefront-desc">{cleanDescription(book.description)}</p>
                </div>
                <div className="storefront-product-foot">
                  <strong>{getBookPrice(book) ? `$${getBookPrice(book)}` : '$25'}</strong>
                  <Link to={`/customer/books/${book.id}`} className="storefront-cta compact">
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </section>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={filteredBooks.length}
            onPageChange={setCurrentPage}
          />
        </>
      ) : null}
    </div>
  )
}