import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../contexts/ToastContext'
import { createCatalogItem, getCatalogItems } from '../../services/api'

const PAGE_SIZE = 5

export default function CatalogManagementPage() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { showToast } = useToast()

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function refresh() {
    setLoading(true)
    getCatalogItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await createCatalogItem({ name, description })
      setName('')
      setDescription('')
      showToast('Catalog item added.', 'success')
      refresh()
    } catch {
      showToast('Could not add catalog item.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Catalog Management" subtitle="Manage categories and catalog metadata." />
      <section className="panel-grid">
        <form className="panel" onSubmit={submit}>
          <h3>Add Catalog Item</h3>
          <label>
            Name
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Description
            <textarea className="field" value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add'}</Button>
        </form>

        <article className="panel">
          <h3>Catalog Items</h3>
          {loading ? <Spinner label="Loading catalog items..." /> : null}
          {!loading && items.length === 0 ? (
            <EmptyState title="No catalog items" message="Add your first catalog metadata item." />
          ) : null}
          {!loading && items.length > 0 ? (
          <ul className="simple-list">
            {pagedItems.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <p>{item.description || '-'}</p>
              </li>
            ))}
          </ul>
          ) : null}
          {!loading && items.length > 0 ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={items.length}
              onPageChange={setCurrentPage}
            />
          ) : null}
        </article>
      </section>
    </>
  )
}
