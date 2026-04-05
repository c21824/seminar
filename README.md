# Book Commerce Microservices (Django + React + Docker)

## Overview
This project is a microservice-based book commerce platform with:
- 11 domain services (Django REST)
- 1 API Gateway (Django)
- 1 React frontend with multi-role interfaces
- PostgreSQL, RabbitMQ, Redis
- Docker Compose for local deployment

## Services
- staff-service
- manager-service
- customer-service
- catalog-service
- book-service
- cart-service
- order-service
- ship-service
- pay-service
- comment-rate-service
- recommender-ai-service
- api-gateway

## Frontend Interfaces Implemented
### Auth
- Login page with role switch (customer/staff/manager)

### Customer
- Home
- Catalog
- Book Detail
- Cart
- Checkout
- Payment Result
- Orders
- Order Detail and shipment timeline
- Reviews and Ratings

### Staff
- Books Management
- Catalog Management
- Orders Management

### Manager
- Approval Center
- Reports

### System
- Service Health dashboard (gateway + all service statuses)

## Run the System
### 1) Start all containers
```bash
docker compose up -d --build
```

### 2) Initialize databases (first run or after volume reset)
```powershell
$services = @(
  'staff-service','manager-service','customer-service','catalog-service','book-service',
  'cart-service','order-service','ship-service','pay-service','comment-rate-service','recommender-ai-service'
)

foreach ($s in $services) {
  docker compose exec -T $s python manage.py makemigrations core
  docker compose exec -T $s python manage.py migrate --noinput
}

docker compose exec -T api-gateway python manage.py migrate --noinput
```

### 3) Open applications
- Frontend UI: http://localhost:5173
- API Gateway: http://localhost:8000
- RabbitMQ UI: http://localhost:15672

### 4) Health checks
```bash
curl http://localhost:8000/api/v1/healthz/
curl http://localhost:8000/api/v1/services-health/
```
Expected: `healthy = 11`, `total = 11`.

### 5) Seed sample data and image metadata
From workspace root:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\seed_demo_data.ps1
```

If you are inside `frontend-react`:
```powershell
powershell -ExecutionPolicy Bypass -File ..\scripts\seed_demo_data.ps1
```

## Useful API Proxy Pattern
Gateway proxy pattern:
```text
/api/v1/proxy/{service-name}/{resource}/
```
Examples:
- `/api/v1/proxy/book-service/books/`
- `/api/v1/proxy/order-service/orders/`
- `/api/v1/proxy/comment-rate-service/reviews/`

## Frontend Route Map
- `/auth/login`
- `/customer/home`
- `/customer/catalog`
- `/customer/books/:id`
- `/customer/cart`
- `/customer/checkout`
- `/customer/payment-result?status=success|failed`
- `/customer/orders`
- `/customer/orders/:id`
- `/customer/reviews`
- `/staff/books`
- `/staff/catalog`
- `/staff/orders`
- `/staff/health`
- `/manager/approvals`
- `/manager/reports`
- `/manager/health`

## Demo Login Accounts (Role-Based)
Use these frontend demo credentials at `/auth/login`:

| Role | Email | Password |
|---|---|---|
| Customer | customer1@bookops.local | Customer@123 |
| Customer | customer2@bookops.local | Customer@123 |
| Staff | staff1@bookops.local | Staff@123 |
| Staff | staff2@bookops.local | Staff@123 |
| Manager | manager1@bookops.local | Manager@123 |

Notes:
- Route access is now protected by role.
- Customer cannot open staff/manager screens.
- Staff cannot open manager/customer screens.
- Manager cannot open customer/staff screens.

## Stop the System
```bash
docker compose down
```

To remove volumes too:
```bash
docker compose down -v
```

## Notes
- Keep trailing slash for write endpoints (`POST/PUT/PATCH`) to avoid Django `APPEND_SLASH` issues.
- Current UI is production-style scaffold for full flow and can be extended with JWT auth, RBAC, and advanced workflow logic.
