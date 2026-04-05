export const mockBooks = [
  {
    name: 'Distributed Systems 101',
    description: 'Author: L. Stone | Price: 25 | Cover: /images/books/distributed-systems-101.svg',
  },
  {
    name: 'Microservices Patterns',
    description: 'Author: C. Richardson | Price: 30 | Cover: /images/books/microservices-patterns.svg',
  },
  {
    name: 'Event-Driven Commerce',
    description: 'Author: A. Nguyen | Price: 28 | Cover: /images/books/event-driven-commerce.svg',
  },
  {
    name: 'Gateway Handbook',
    description: 'Author: P. Martin | Price: 26 | Cover: /images/books/gateway-handbook.svg',
  },
  {
    name: 'Observability Playbook',
    description: 'Author: R. Khan | Price: 29 | Cover: /images/books/observability-playbook.svg',
  },
]

export const mockCatalogItems = [
  { name: 'Architecture', description: 'System design, DDD, and decomposition patterns' },
  { name: 'Operations', description: 'SRE, observability, platform reliability' },
  { name: 'Backend', description: 'Django APIs, contracts, and event choreography' },
  { name: 'Data', description: 'Storage strategy, migrations, and consistency' },
]

export const mockOrders = [
  { name: 'Order #A1001', description: 'Customer: an.nguyen | Status: shipped | Total: 58' },
  { name: 'Order #A1002', description: 'Customer: tran.minh | Status: paid | Total: 30' },
  { name: 'Order #A1003', description: 'Customer: le.hoa | Status: processing | Total: 25' },
]

export const mockReviews = [
  { name: 'Great for beginners', description: 'Clear examples and practical flow for microservice starters.' },
  { name: 'Solid architecture guide', description: 'Gateway and decomposition chapters are very useful.' },
  { name: 'Useful but dense', description: 'Excellent depth, recommended with hands-on labs.' },
]

export const mockStaff = [
  { name: 'Linh Tran', description: 'Role: Inventory Staff | Avatar: /images/avatars/staff-linh.svg' },
  { name: 'Quoc Le', description: 'Role: Catalog Staff | Avatar: /images/avatars/staff-linh.svg' },
]

export const mockManagers = [
  { name: 'Minh Pham', description: 'Role: Manager | Avatar: /images/avatars/manager-minh.svg' },
]

export const mockCustomers = [
  { name: 'An Nguyen', description: 'Tier: Gold | Avatar: /images/avatars/customer-an.svg' },
  { name: 'Hoa Le', description: 'Tier: Silver | Avatar: /images/avatars/customer-an.svg' },
]

export const mockPayments = [
  { name: 'Payment TX-1001', description: 'Order #A1001 | method: card | status: success' },
  { name: 'Payment TX-1002', description: 'Order #A1002 | method: banking | status: success' },
]

export const mockShipments = [
  { name: 'Shipment SH-1001', description: 'Order #A1001 | status: in_transit' },
  { name: 'Shipment SH-1002', description: 'Order #A1002 | status: label_created' },
]

export const mockRecommendations = [
  { name: 'Top Picks for An', description: 'Distributed Systems 101, Gateway Handbook' },
  { name: 'Top Picks for Hoa', description: 'Event-Driven Commerce, Observability Playbook' },
]
