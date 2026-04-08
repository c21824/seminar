import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { getBooks, getCatalogItems } from '../../services/api'
import { cleanDescription, getBookCatalog, getBookCover, getBookPrice } from '../../mocks/parseMetadata'

const PAGE_SIZE = 5

export default function CatalogPage() {
  const [searchParams] = useSearchParams()
  const [books, setBooks] = useState([])
  const [catalogItems, setCatalogItems] = useState([])
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [catalogFilter, setCatalogFilter] = useState('all')
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
        setError('Could not load catalog from book-service.')
      })
      .finally(() => setLoading(false))

    getCatalogItems()
      .then((rows) => setCatalogItems(rows || []))
      .catch(() => setCatalogItems([]))
  }, [])

  const filtered = useMemo(() => {
    let rows = books

    if (catalogFilter !== 'all') {
      rows = rows.filter((book) => getBookCatalog(book) === catalogFilter)
    }

    if (!query) {
      return rows
    }

    const keyword = query.toLowerCase()
    return rows.filter((book) => {
      const name = String(book.name || '').toLowerCase()
      const description = cleanDescription(book.description).toLowerCase()
      return name.includes(keyword) || description.includes(keyword)
    })
  }, [books, query, catalogFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, catalogFilter, books.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="storefront-stack catalog-page">
      <section className="storefront-section-head">
        <div>
          <p className="storefront-kicker">Catalog</p>
          <h1>Explore books by topic and price.</h1>
          <p>Find titles quickly using keyword search and category filters.</p>
        </div>
        <div className="storefront-filter-box">
          <Input
            className="search"
            placeholder="Search title or keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="field search" value={catalogFilter} onChange={(event) => setCatalogFilter(event.target.value)}>
            <option value="all">All catalogs</option>
            {catalogItems.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
      </section>

      {loading ? <Spinner label="Loading catalog..." /> : null}
      {!loading && error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          title="No books found"
          message="Try another keyword or refresh after staff adds new books."
        />
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
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
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </>
      ) : null}
    </div>
  )
}
