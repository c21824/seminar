$ErrorActionPreference = 'Stop'
$baseUrl = 'http://localhost:8000/api/v1/proxy'

function Ensure-Record {
  param(
    [string]$Service,
    [string]$Resource,
    [hashtable]$Item
  )

  $listUrl = "$baseUrl/$Service/$Resource/"
  $rows = Invoke-RestMethod -Uri $listUrl -Method Get
  $exists = $rows | Where-Object { $_.name -eq $Item.name }
  if (-not $exists) {
    $body = $Item | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $listUrl -Method Post -ContentType 'application/json' -Body $body | Out-Null
    Write-Host "Inserted: $Service/$Resource -> $($Item.name)"
  }
  else {
    Write-Host "Skip existing: $Service/$Resource -> $($Item.name)"
  }
}

$books = @(
  @{ name = 'Distributed Systems 101'; description = 'Author: L. Stone'; catalog_id = 3; catalog_name = 'Backend'; price = 25; cover_image = '/images/books/distributed-systems-101.svg' },
  @{ name = 'Microservices Patterns'; description = 'Author: C. Richardson'; catalog_id = 1; catalog_name = 'Architecture'; price = 30; cover_image = '/images/books/microservices-patterns.svg' },
  @{ name = 'Event-Driven Commerce'; description = 'Author: A. Nguyen'; catalog_id = 1; catalog_name = 'Architecture'; price = 28; cover_image = '/images/books/event-driven-commerce.svg' },
  @{ name = 'Gateway Handbook'; description = 'Author: P. Martin'; catalog_id = 3; catalog_name = 'Backend'; price = 26; cover_image = '/images/books/gateway-handbook.svg' },
  @{ name = 'Observability Playbook'; description = 'Author: R. Khan'; catalog_id = 2; catalog_name = 'Operations'; price = 29; cover_image = '/images/books/observability-playbook.svg' }
)

$catalogItems = @(
  @{ name = 'Architecture'; description = 'System design, DDD, and decomposition patterns' },
  @{ name = 'Operations'; description = 'SRE, observability, platform reliability' },
  @{ name = 'Backend'; description = 'Django APIs, contracts, and event choreography' },
  @{ name = 'Data'; description = 'Storage strategy, migrations, and consistency' }
)

$orders = @(
  @{ name = 'Order #A1001'; description = 'Customer: an.nguyen | Status: shipped | Total: 58' },
  @{ name = 'Order #A1002'; description = 'Customer: tran.minh | Status: paid | Total: 30' },
  @{ name = 'Order #A1003'; description = 'Customer: le.hoa | Status: processing | Total: 25' }
)

$reviews = @(
  @{ name = 'Great for beginners'; description = 'Clear examples and practical flow for microservice starters.' },
  @{ name = 'Solid architecture guide'; description = 'Gateway and decomposition chapters are very useful.' },
  @{ name = 'Useful but dense'; description = 'Excellent depth, recommended with hands-on labs.' }
)

$staff = @(
  @{ name = 'Linh Tran'; description = 'Role: Inventory Staff | Avatar: /images/avatars/staff-linh.svg' },
  @{ name = 'Quoc Le'; description = 'Role: Catalog Staff | Avatar: /images/avatars/staff-linh.svg' }
)

$managers = @(
  @{ name = 'Minh Pham'; description = 'Role: Manager | Avatar: /images/avatars/manager-minh.svg' }
)

$customers = @(
  @{ name = 'An Nguyen'; description = 'Tier: Gold | Avatar: /images/avatars/customer-an.svg' },
  @{ name = 'Hoa Le'; description = 'Tier: Silver | Avatar: /images/avatars/customer-an.svg' }
)

$payments = @(
  @{ name = 'Payment TX-1001'; description = 'Order #A1001 | method: card | status: success' },
  @{ name = 'Payment TX-1002'; description = 'Order #A1002 | method: banking | status: success' }
)

$shipments = @(
  @{ name = 'Shipment SH-1001'; description = 'Order #A1001 | status: in_transit' },
  @{ name = 'Shipment SH-1002'; description = 'Order #A1002 | status: label_created' }
)

$recommendations = @(
  @{ name = 'Top Picks for An'; description = 'Distributed Systems 101, Gateway Handbook' },
  @{ name = 'Top Picks for Hoa'; description = 'Event-Driven Commerce, Observability Playbook' }
)

foreach ($item in $books) { Ensure-Record -Service 'book-service' -Resource 'books' -Item $item }
foreach ($item in $catalogItems) { Ensure-Record -Service 'catalog-service' -Resource 'catalog-items' -Item $item }
foreach ($item in $orders) { Ensure-Record -Service 'order-service' -Resource 'orders' -Item $item }
foreach ($item in $reviews) { Ensure-Record -Service 'comment-rate-service' -Resource 'reviews' -Item $item }
foreach ($item in $staff) { Ensure-Record -Service 'staff-service' -Resource 'staff' -Item $item }
foreach ($item in $managers) { Ensure-Record -Service 'manager-service' -Resource 'managers' -Item $item }
foreach ($item in $customers) { Ensure-Record -Service 'customer-service' -Resource 'customers' -Item $item }
foreach ($item in $payments) { Ensure-Record -Service 'pay-service' -Resource 'payments' -Item $item }
foreach ($item in $shipments) { Ensure-Record -Service 'ship-service' -Resource 'shipments' -Item $item }
foreach ($item in $recommendations) { Ensure-Record -Service 'recommender-ai-service' -Resource 'recommendations' -Item $item }

Write-Host 'Seed completed.'
