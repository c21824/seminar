import React from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'

const pendingApprovals = [
  { id: 'AP-1201', title: 'Refund request for order #122', owner: 'manager-service' },
  { id: 'AP-1202', title: 'Shipping escalation for order #140', owner: 'ship-service' },
  { id: 'AP-1203', title: 'Catalog policy exception', owner: 'catalog-service' },
]

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader title="Approval Center" subtitle="Manager decisions for exception flows and policy approvals." />
      <section className="panel-grid">
        {pendingApprovals.map((item) => (
          <article className="panel" key={item.id}>
            <h3>{item.id}</h3>
            <p>{item.title}</p>
            <small>Source: {item.owner}</small>
            <div className="actions-row">
              <Button>Approve</Button>
              <Button variant="ghost">Reject</Button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
