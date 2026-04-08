# Huong dan chay he thong microservices (Django + React + Docker)

## 1. Dieu kien can
- Da cai Docker Desktop
- Da bat Docker Engine
- Mo terminal tai thu muc du an

## 2. Khoi dong he thong
```bash
docker compose up -d --build
```

Lenh tren se build va chay:
- 11 backend service Django
- 1 AI chat service FastAPI
- 1 API Gateway Django
- 1 frontend React
- PostgreSQL, RabbitMQ, Redis

## 3. Khoi tao database (chay 1 lan sau khi boot)
Chay migration cho tat ca service:

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

## 4. Kiem tra he thong
### 4.1 Kiem tra trang thai container
```bash
docker compose ps
```

### 4.2 Kiem tra API gateway
```bash
curl http://localhost:8000/api/v1/healthz/
```

### 4.3 Kiem tra suc khoe 11 service qua gateway
```bash
curl http://localhost:8000/api/v1/services-health/
```

Mong doi:
- healthy = 12
- total = 12

### 4.4 Mo giao dien web
- Frontend dashboard: http://localhost:5173
- Gateway API: http://localhost:8000
- RabbitMQ UI: http://localhost:15672 (default: guest / guest)

## 5. Test nhanh CRUD qua gateway
### 5.1 Tao du lieu mau cho book-service
```powershell
$body = '{"name":"Distributed Systems 101","description":"Starter seed data"}'
Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/proxy/book-service/books/' -Method Post -ContentType 'application/json' -Body $body
```

### 5.2 Lay danh sach sach
```bash
curl http://localhost:8000/api/v1/proxy/book-service/books/
```

### 5.3 Test chat recommendation qua gateway
```powershell
$body = '{"user_id":"u_1024","question":"Toi nen doc sach gi?","top_k":3}'
Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/proxy/chat-service/chat/recommend/' -Method Post -ContentType 'application/json' -Body $body
```

## 6. Xem logs khi co loi
```bash
docker compose logs -f api-gateway
docker compose logs -f book-service
```

## 7. Dung he thong
```bash
docker compose down
```

Neu muon xoa ca du lieu DB volume:
```bash
docker compose down -v
```

## 8. Ghi chu quan trong
- Cac endpoint proxy theo mau:
  - /api/v1/proxy/{service-name}/{resource}/
- Vi du:
  - /api/v1/proxy/book-service/books/
  - /api/v1/proxy/customer-service/customers/
  - /api/v1/proxy/order-service/orders/
- Nho giu dau / cuoi cho endpoint ghi du lieu (POST/PUT/PATCH) de tranh loi APPEND_SLASH.
