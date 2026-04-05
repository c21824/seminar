# Ke hoach chi tiet he thong microservice (Django + React + Docker)

## 1) Muc tieu
- Xay dung he thong thuong mai sach theo kien truc microservice, su dung:
- Backend: Django + Django REST Framework cho tung service.
- Frontend: React (web client).
- Van hanh: Docker + Docker Compose de chay local end-to-end.
- API Gateway la diem vao duy nhat cho frontend.

## 2) Danh sach day du 12 service
1. staff-service
2. manager-service
3. customer-service
4. catalog-service
5. book-service
6. cart-service
7. order-service
8. ship-service
9. pay-service
10. comment-rate-service
11. recommender-ai-service
12. api-gateway

## 3) Phan tach bounded context va trach nhiem
### 3.1 staff-service
- Quan ly nhan vien, vai tro noi bo, trang thai lam viec.
- API mau: /staff, /staff/{id}, /staff/{id}/roles
- DB rieng: staff_db
- Event phat: staff.created, staff.updated

### 3.2 manager-service
- Quan ly thong tin manager, phe duyet quy trinh (duyet don, duyet ship policy,...).
- API mau: /managers, /approvals, /approvals/{id}/decision
- DB rieng: manager_db
- Event phat: approval.requested, approval.decided

### 3.3 customer-service
- Ho so khach hang, dia chi, thong tin lien he, preference.
- API mau: /customers, /customers/{id}, /customers/{id}/addresses
- DB rieng: customer_db
- Event phat: customer.created, customer.updated

### 3.4 catalog-service
- Quan ly danh muc san pham, category, tag, metadata hien thi.
- API mau: /catalog/categories, /catalog/tags
- DB rieng: catalog_db
- Event phat: catalog.changed

### 3.5 book-service
- Quan ly thong tin sach (title, author, ISBN, gia, ton kho tong hop de doc nhanh).
- API mau: /books, /books/{id}, /books/search
- DB rieng: book_db
- Event phat: book.created, book.updated, book.deleted
- Event nhan: stock.changed (tu order/ship), comment.updated

### 3.6 cart-service
- Gio hang theo customer, them/xoa/cap nhat so luong.
- API mau: /carts/{customerId}, /carts/{customerId}/items
- DB rieng: cart_db
- Event phat: cart.checked_out

### 3.7 order-service
- Tao don hang, trang thai don hang, lich su xu ly.
- API mau: /orders, /orders/{id}, /orders/{id}/status
- DB rieng: order_db
- Event phat: order.created, order.confirmed, order.cancelled
- Event nhan: payment.succeeded, payment.failed, ship.updated

### 3.8 ship-service
- Van chuyen, tracking, cap nhat trang thai giao hang.
- API mau: /shipments, /shipments/{id}, /shipments/{id}/tracking
- DB rieng: ship_db
- Event phat: ship.created, ship.updated, ship.delivered
- Event nhan: order.confirmed

### 3.9 pay-service
- Thanh toan, giao dich, webhook doi tac cong thanh toan.
- API mau: /payments, /payments/{id}, /payments/webhook
- DB rieng: pay_db
- Event phat: payment.succeeded, payment.failed, payment.refunded
- Event nhan: order.created

### 3.10 comment-rate-service
- Danh gia, nhan xet sach, moderation co ban.
- API mau: /comments, /ratings, /books/{id}/ratings
- DB rieng: comment_rate_db
- Event phat: comment.created, rating.updated

### 3.11 recommender-ai-service
- Goi y sach dua tren lich su mua, rating, hanh vi.
- API mau: /recommendations/{customerId}, /recommendations/retrain
- DB rieng: recommender_db
- Event nhan: order.confirmed, rating.updated, customer.updated
- Event phat: recommendation.updated

### 3.12 api-gateway
- Dinh tuyen request, auth check, rate limit, aggregation API cho frontend.
- Co the dung Nginx/Kong hoac Django gateway service.
- Endpoint facade: /api/*

## 4) Kien truc tong the va tich hop
- Frontend React goi duy nhat api-gateway.
- Giao tiep sync: REST giua gateway va cac service can tra ket qua ngay.
- Giao tiep async: message broker (RabbitMQ) cho su kien domain.
- Moi service so huu DB rieng (PostgreSQL schema/tach DB).
- Redis dung cho cache/session/rate-limit.
- Observability: Prometheus + Grafana + Loki/ELK (toi thieu log + metrics).

## 5) Luong nghiep vu chinh
### 5.1 Dat hang
1. Customer them sach vao cart (cart-service).
2. Checkout tao order (order-service).
3. order.created -> pay-service xu ly thanh toan.
4. payment.succeeded -> order confirmed.
5. order.confirmed -> ship-service tao shipment.
6. ship.updated -> order-service dong bo trang thai.

### 5.2 Danh gia va goi y
1. Customer tao comment/rating (comment-rate-service).
2. rating.updated -> recommender-ai-service cap nhat model/feature.
3. React lay de xuat qua gateway -> recommender-ai-service.

### 5.3 Quan tri noi bo
1. staff/manager thao tac phe duyet.
2. approval.decided cap nhat quy trinh order/ship (neu co rule).

## 6) Cau truc thu muc de trien khai
```text
project-root/
  frontend-react/
  gateway/
  services/
    staff-service/
    manager-service/
    customer-service/
    catalog-service/
    book-service/
    cart-service/
    order-service/
    ship-service/
    pay-service/
    comment-rate-service/
    recommender-ai-service/
  infra/
    rabbitmq/
    prometheus/
    grafana/
  docker-compose.yml
  .env
```

## 7) Tieu chuan ky thuat bat buoc
- Django REST Framework cho API.
- JWT auth (gateway + customer/staff roles).
- OpenAPI/Swagger cho moi service.
- Migration rieng cho moi DB.
- Idempotency cho consumer event.
- Retry + timeout + circuit-breaker (o gateway/clients).
- Test:
- Unit test tung service.
- Integration test theo luong dat hang.
- Contract test giua gateway va services.

## 8) Ke hoach trien khai theo giai doan
### Giai doan A - Nen tang
- Khoi tao monorepo/multi-repo, template Django service, React app.
- Dung gateway, RabbitMQ, PostgreSQL, Redis, Compose.
- Xong khi: tat ca container up duoc, healthcheck xanh.

### Giai doan B - Core commerce
- Hoan thanh customer, book, cart, order, pay, ship.
- Hoan thanh flow checkout end-to-end.
- Xong khi: dat hang thanh cong tren local bang Compose.

### Giai doan C - Ho tro va mo rong
- Hoan thanh catalog, comment-rate, recommender-ai.
- Hoan thanh dashboard manager/staff can ban.
- Xong khi: co danh gia va recommendation tra ve tren UI.

### Giai doan D - Hardening
- Bo sung observability, security, test tai co ban, tai lieu.
- Xong khi: co runbook, API docs, kich ban demo day du.

## 9) Docker Compose toi thieu can co
- gateway
- frontend-react
- 11 backend services
- rabbitmq
- redis
- postgres (1 instance nhieu DB hoac nhieu instance)
- (tuy chon) nginx reverse proxy, prometheus, grafana

## 10) Prompt hoan chinh de ban dung ngay
Ban la Senior Solution Architect + Tech Lead.
Hay thiet ke va sinh bo khung implementation cho he thong microservice quan ly ban sach voi 12 service bat buoc nhu sau:
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

Rang buoc cong nghe:
- Backend moi service dung Django + Django REST Framework.
- Frontend dung React.
- Chay toan bo bang Docker + Docker Compose.
- Message broker dung RabbitMQ.
- Cache dung Redis.
- Database dung PostgreSQL, moi service DB rieng.

Yeu cau dau ra:
1. Kien truc tong the (text diagram + giai thich sync/async).
2. Bang chi tiet 12 service, moi service gom:
- Trach nhiem
- Model du lieu chinh
- REST endpoint chinh
- Event publish/subscribe
- Phu thuoc service khac
3. De xuat cau truc thu muc du an.
4. Cung cap docker-compose.yml mau co du service va infra.
5. Cung cap Dockerfile mau cho backend Django va frontend React.
6. Cung cap env convention (.env.example).
7. Cung cap skeleton code cho 1 service mau Django (settings, urls, viewset, model, serializer).
8. Cung cap API Gateway routing map.
9. Cung cap 3 luong end-to-end:
- checkout thanh cong
- thanh toan that bai va rollback trang thai
- giao hang thanh cong cap nhat order
10. Cung cap chien luoc test:
- unit
- integration
- contract
11. Cung cap checklist deploy local 1 lenh docker compose up --build.

Quy tac kien truc bat buoc:
- Khong service nao truy cap truc tiep DB service khac.
- Khong dung shared writable schema.
- Moi event consumer phai idempotent.
- Co versioning cho API (/api/v1).
- Co health endpoint cho moi service (/healthz).

Tieu chi chat luong:
- Trinh bay ngan gon, uu tien bang.
- Co kha nang copy-chay ngay cho local dev.
- Neu co gia dinh, ghi ro phan Assumptions.
