import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../contexts/ToastContext'
import { createBook, getBooks, getCatalogItems } from '../../services/api'
import { getBookCatalog, getBookCover, getBookPrice } from '../../mocks/parseMetadata'

const PAGE_SIZE = 5

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Cannot read file.'))
    reader.readAsDataURL(file)
  })
}

export default function BooksManagementPage() {
  const [books, setBooks] = useState([])
  const [name, setName] = useState('')
  const [catalogId, setCatalogId] = useState('')
  const [catalogName, setCatalogName] = useState('')
  const [catalogItems, setCatalogItems] = useState([])
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { showToast } = useToast()

  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE))
  const pagedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return books.slice(start, start + PAGE_SIZE)
  }, [books, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [books.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function refresh() {
    setLoading(true)
    getBooks()
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))

    getCatalogItems()
      .then((rows) => setCatalogItems(rows || []))
      .catch(() => setCatalogItems([]))
  }

  useEffect(() => {
    refresh()
  }, [])

  async function submit(event) {
    event.preventDefault()

    if (!price || Number(price) <= 0) {
      showToast('Price must be greater than 0.', 'error')
      return
    }

    if (!catalogId || !catalogName) {
      showToast('Please select a catalog.', 'error')
      return
    }

    setSaving(true)
    try {
      await createBook({
        name,
        description,
        price: Number(price),
        cover_image: coverImage,
        catalog_id: Number(catalogId),
        catalog_name: catalogName,
      })
      setName('')
      setCatalogId('')
      setCatalogName('')
      setPrice('')
      setDescription('')
      setCoverImage('')
      setFileName('')
      showToast('Book created.', 'success')
      refresh()
    } catch {
      showToast('Could not create book.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleCatalogChange(event) {
    const selectedId = event.target.value
    const selected = catalogItems.find((item) => String(item.id) === String(selectedId))
    setCatalogId(selectedId)
    setCatalogName(selected?.name || '')
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      setCoverImage('')
      setFileName('')
      return
    }

    try {
      const dataUrl = await fileToDataUrl(file)
      setCoverImage(dataUrl)
      setFileName(file.name)
    } catch {
      setCoverImage('')
      setFileName('')
      showToast('Could not read selected image.', 'error')
    }
  }

  return (
    <>
      <PageHeader title="Books Management" subtitle="Staff console for creating and monitoring books." />
      <section className="panel-grid">
        <form className="panel" onSubmit={submit}>
          <h3>Create Book</h3>
          <label>
            Name
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Catalog
            <select className="field" value={catalogId} onChange={handleCatalogChange} required>
              <option value="">Select catalog</option>
              {catalogItems.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {catalogItems.length === 0 ? <small>Please add catalog items in Staff/Catalog first.</small> : null}
          </label>
          <label>
            Price
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>
          <label>
            Description
            <textarea className="field" value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          <label>
            Cover Image
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {fileName ? <small>{fileName}</small> : null}
          </label>
          <Button type="submit" disabled={saving || catalogItems.length === 0}>{saving ? 'Creating...' : 'Create'}</Button>
        </form>

        <article className="panel">
          <h3>Current Books</h3>
          {loading ? <Spinner label="Loading books..." /> : null}
          {!loading && books.length === 0 ? (
            <EmptyState title="No books yet" message="Create your first book using the form." />
          ) : null}
          {!loading && books.length > 0 ? (
          <ul className="simple-list">
            {pagedBooks.map((book) => (
              <li key={book.id}>
                <strong>{book.name}</strong>
                <p>Catalog: {getBookCatalog(book) || '-'}</p>
                <p>Price: {getBookPrice(book) ? `$${getBookPrice(book)}` : '-'}</p>
                {getBookCover(book) ? <img src={getBookCover(book)} alt={book.name} className="thumb" /> : null}
                <p>{book.description || '-'}</p>
              </li>
            ))}
          </ul>
          ) : null}
          {!loading && books.length > 0 ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={books.length}
              onPageChange={setCurrentPage}
            />
          ) : null}
        </article>
      </section>
    </>
  )
}
