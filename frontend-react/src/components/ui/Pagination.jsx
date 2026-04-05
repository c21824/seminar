import React from 'react'
import Button from './Button'

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}) {
  if (totalItems <= pageSize) {
    return null
  }

  return (
    <div className="pagination-row">
      <p>
        Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="actions-row">
        <Button variant="ghost" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <span className="pagination-meta">Page {currentPage} / {totalPages}</span>
        <Button variant="ghost" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  )
}
