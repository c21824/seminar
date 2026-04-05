import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../contexts/ToastContext'
import { createReview, getReviews } from '../../services/api'

const PAGE_SIZE = 5

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { showToast } = useToast()

  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE))
  const pagedReviews = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return reviews.slice(start, start + PAGE_SIZE)
  }, [reviews, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [reviews.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function loadReviews() {
    setLoading(true)
    getReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReviews()
  }, [])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await createReview({ name, description })
      setName('')
      setDescription('')
      showToast('Review submitted.', 'success')
      loadReviews()
    } catch {
      showToast('Could not submit review.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Reviews and Ratings" subtitle="Write customer feedback and improve recommendations." />
      <section className="panel-grid">
        <form className="panel" onSubmit={submit}>
          <h3>Create Review</h3>
          <label>
            Title
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Review
            <textarea className="field" value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          <Button type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit'}</Button>
        </form>

        <article className="panel">
          <h3>Recent Reviews</h3>
          {loading ? <Spinner label="Loading reviews..." /> : null}
          {!loading && reviews.length === 0 ? (
            <EmptyState title="No reviews yet" message="Be the first customer to share feedback." />
          ) : null}
          {!loading && reviews.length > 0 ? (
          <ul className="simple-list">
            {pagedReviews.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <p>{item.description || '-'}</p>
              </li>
            ))}
          </ul>
          ) : null}
          {!loading && reviews.length > 0 ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={reviews.length}
              onPageChange={setCurrentPage}
            />
          ) : null}
        </article>
      </section>
    </>
  )
}
