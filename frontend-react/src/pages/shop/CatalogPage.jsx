import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { getBooks, getCatalogItems } from '../../services/api'
import { cleanDescription, getBookCatalog, getBookCover, getBookPrice } from '../../mocks/parseMetadata'

const PAGE_SIZE = 5

export default function CatalogPage() {
  const [books, setBooks] = useState([])
  const [catalogItems, setCatalogItems] = useState([])
  const [query, setQuery] = useState('')
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
    return rows.filter((book) => book.name.toLowerCase().includes(keyword))
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
    <>
      <PageHeader
        title="Catalog"
        subtitle="Search available books from book-service."
        right={
          <div className="actions-row">
            <Input
              className="search"
              placeholder="Search books"
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
        }
      />
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
        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cover</th>
                <th>ID</th>
                <th>Name</th>
                <th>Catalog</th>
                <th>Price</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    {getBookCover(book) ? (
                      <img
                        src={getBookCover(book)}
                        alt={book.name}
                        className="thumb"
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{book.id}</td>
                  <td>{book.name}</td>
                  <td>{getBookCatalog(book) || '-'}</td>
                  <td>{getBookPrice(book) ? `$${getBookPrice(book)}` : '-'}</td>
                  <td>{cleanDescription(book.description)}</td>
                  <td>
                    <Link to={`/customer/books/${book.id}`} className="link-inline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </>
  )
}
