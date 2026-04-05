import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import StatsRow from '../../components/StatsRow'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { getGatewayHealth, getServicesHealth } from '../../services/api'

const PAGE_SIZE = 5

export default function HealthPage() {
  const [gatewayStatus, setGatewayStatus] = useState('loading')
  const [services, setServices] = useState([])
  const [healthyCount, setHealthyCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(services.length / PAGE_SIZE))
  const pagedServices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return services.slice(start, start + PAGE_SIZE)
  }, [services, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [services.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setLoading(true)
    getGatewayHealth()
      .then((payload) => setGatewayStatus(payload.status || 'unknown'))
      .catch(() => setGatewayStatus('down'))

    getServicesHealth()
      .then((payload) => {
        setServices(payload.services || [])
        setHealthyCount(payload.healthy || 0)
      })
      .catch(() => {
        setServices([])
        setHealthyCount(0)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="System Health" subtitle="Real-time infrastructure and service status." />
      <StatsRow
        stats={[
          { label: 'Gateway', value: gatewayStatus },
          { label: 'Healthy Services', value: `${healthyCount}/${services.length || 11}` },
          { label: 'Message Broker', value: 'RabbitMQ Online' },
        ]}
      />

      {loading ? <Spinner label="Checking services..." /> : null}
      {!loading && services.length === 0 ? (
        <EmptyState
          title="No health records"
          message="Service health data is unavailable right now. Please retry shortly."
        />
      ) : null}

      {!loading && services.length > 0 ? (
      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Upstream</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pagedServices.map((service) => (
              <tr key={service.service}>
                <td>{service.service}</td>
                <td>{service.upstream}</td>
                <td>
                  <Badge status={service.status}>{service.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={services.length}
          onPageChange={setCurrentPage}
        />
      </section>
      ) : null}
    </>
  )
}
