# AI Customer Support Plan & Usage Guide (Bookstore)

## 1. Muc tieu
Tai lieu nay huong dan thiet ke va trien khai he thong Chatbot tu van sach 24/7 theo dung stack:
- Kien truc: Microservices + API Gateway
- Backend nghiep vu: Django services (da co san trong du an)
- AI service rieng: FastAPI (tach biet hoan toan voi monolith)
- AI core: RAG + Knowledge Base + Deep Learning personalization
- Data: PostgreSQL/MongoDB + FAISS/Pinecone
- Van hanh: Docker + Kubernetes + Redis cache + Async processing

## 2. Trang thai hien tai cua du an
Du an hien da co:
- API Gateway Django
- 11 domain services Django
- Frontend React
- PostgreSQL + RabbitMQ + Redis (qua docker-compose)

Can bo sung:
- 1 service moi: chat-service (FastAPI)
- Pipeline embedding + vector retrieval
- RAG orchestration + LLM integration

## 3. Kien truc de xuat

```text
[Frontend React]
      |
      v
[API Gateway Django] --- auth/rate-limit/logging
      |
      +--> [Django domain services: user/book/cart/order/...]
      |
      +--> [Chat Service - FastAPI]
              |
              +--> [Redis cache]
              +--> [Vector DB: FAISS/Pinecone]
              +--> [Knowledge Base store: PostgreSQL/MongoDB]
              +--> [LLM Provider]

Async bus: RabbitMQ
- domain events (view, add_to_cart, purchase, search, rating)
- embedding workers consume events and update vectors
```

Nguyen tac:
- Chat Service khong truy cap truc tiep DB cua service khac.
- Du lieu nguoi dung/san pham di qua API noi bo hoac event.
- Moi consumer event phai idempotent.

## 4. Database schema mau cho Knowledge Base

### 4.1 Product (book) schema JSON
```json
{
  "product_id": "book_9786041234567",
  "title": "Nguoi Dua Dieu",
  "category": ["van_hoc", "tieu_thuyet"],
  "author": "Khaled Hosseini",
  "publisher": "NXB Tre",
  "price": 129000,
  "tags": ["best_seller", "cam_dong", "gia_dinh"],
  "description": "Tieu thuyet ve tinh ban va su chuoc loi",
  "knowledge_chunks": [
    "Chu de: tinh ban, chien tranh, chuoc loi",
    "Doc gia phu hop: yeu thich truyen cam xuc"
  ],
  "embedding": [0.012, -0.091, 0.233, 0.004],
  "embedding_model": "bge-m3",
  "updated_at": "2026-04-05T08:00:00Z"
}
```

### 4.2 User profile schema JSON
```json
{
  "user_id": "u_1024",
  "reading_interests": ["van_hoc", "tam_ly", "kinh_doanh"],
  "behavior": [
    {
      "event_type": "view",
      "product_id": "book_001",
      "category": "van_hoc",
      "ts": "2026-04-04T10:10:00Z"
    },
    {
      "event_type": "add_to_cart",
      "product_id": "book_001",
      "category": "van_hoc",
      "ts": "2026-04-04T10:12:00Z"
    },
    {
      "event_type": "remove_cart",
      "product_id": "book_001",
      "category": "van_hoc",
      "ts": "2026-04-04T10:30:00Z"
    }
  ],
  "stats": {
    "avg_price_range": [90000, 180000],
    "favorite_authors": ["Nguyen Nhat Anh"],
    "session_depth_mean": 6.2
  },
  "embedding": [0.101, -0.023, 0.441, 0.087],
  "embedding_model": "user-behavior-transformer-v1",
  "updated_at": "2026-04-05T08:00:00Z"
}
```

## 5. Ca nhan hoa voi Deep Learning

### 5.1 Encode chuoi hanh vi
Vi du hanh vi: xem sach van hoc -> them gio -> khong mua

Encode token sequence:
- Action tokens: ACT_VIEW, ACT_ADD_CART, ACT_PURCHASE, ACT_REMOVE_CART
- Item tokens: ITEM_<id>
- Category tokens: CAT_<name>
- Time tokens: HOUR_<0-23>, DOW_<0-6>

Chuoi vi du:
```text
ACT_VIEW ITEM_001 CAT_VAN_HOC HOUR_10
ACT_ADD_CART ITEM_001 CAT_VAN_HOC HOUR_10
ACT_REMOVE_CART ITEM_001 CAT_VAN_HOC HOUR_10
```

### 5.2 Model goi y
- MVP nhanh: BiLSTM + Attention
- Production de xuat: Transformer Encoder (SASRec/BERT4Rec style)

Output model:
- user_embedding (128 hoac 256 dims)
- purchase_intent_score
- category_affinity_score

### 5.3 Cong thuc ket hop vector truy hoi
$$
q_{final} = \alpha q_{text} + (1 - \alpha) q_{user},\; \alpha \in [0.5, 0.7]
$$

Gia tri khoi tao de xuat: $\alpha = 0.6$.

## 6. Luong RAG cho cau hoi "Toi nen doc sach gi?"
1. Gateway nhan request chat va chuyen den Chat Service.
2. Chat Service lay user profile (Redis cache -> DB/API neu cache miss).
3. Embed cau hoi de tao text query vector.
4. Lay user embedding tu profile/model.
5. Tron vector theo cong thuc q_final.
6. Tim top-K sach tu FAISS/Pinecone.
7. Tao context prompt:
- Tong ket so thich user
- Top-K sach + metadata + score
- Rule: khong duoc bịa sach ngoai du lieu
8. Goi LLM sinh cau tra loi ca nhan hoa.
9. Ghi log hoi dap, phat event cho pipeline hoc tiep.

## 7. Ma Python mo phong RAG trong Chat Service (FastAPI)
```python
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import faiss

app = FastAPI(title="chat-service")

DIM = 4
books = [
    {"product_id": "book_a", "title": "Nguoi Dua Dieu", "category": "van_hoc", "author": "Khaled Hosseini"},
    {"product_id": "book_b", "title": "Dac Nhan Tam", "category": "ky_nang_song", "author": "Dale Carnegie"},
    {"product_id": "book_c", "title": "Nha Gia Kim", "category": "van_hoc", "author": "Paulo Coelho"},
]
book_vectors = np.array([
    [0.10, 0.20, 0.30, 0.40],
    [0.30, 0.10, 0.20, 0.10],
    [0.05, 0.25, 0.35, 0.45],
], dtype="float32")

index = faiss.IndexFlatIP(DIM)
index.add(book_vectors)

user_store = {
    "u_1024": {
        "reading_interests": ["van_hoc", "tam_ly"],
        "embedding": np.array([0.08, 0.22, 0.31, 0.39], dtype="float32"),
    }
}

class ChatRequest(BaseModel):
    user_id: str
    question: str
    top_k: int = 3


def normalize(v: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(v)
    return v if norm == 0 else v / norm


def embed_text(question: str) -> np.ndarray:
    # Thay bang embedding model that su khi trien khai
    seed = sum(ord(c) for c in question) % 1000
    rng = np.random.default_rng(seed)
    return normalize(rng.random(DIM).astype("float32"))


def fuse_query(text_vec: np.ndarray, user_vec: np.ndarray, alpha: float = 0.6) -> np.ndarray:
    q = alpha * text_vec + (1 - alpha) * user_vec
    return normalize(q.astype("float32"))


def retrieve_top_books(q_vec: np.ndarray, top_k: int = 3):
    scores, idxs = index.search(q_vec.reshape(1, -1).astype("float32"), top_k)
    result = []
    for score, idx in zip(scores[0], idxs[0]):
        if idx < 0:
            continue
        b = dict(books[idx])
        b["score"] = float(score)
        result.append(b)
    return result


def generate_answer(user_profile: dict, retrieved: list) -> str:
    if not retrieved:
        return "Minh chua tim thay dau sach phu hop. Ban muon the loai nao?"
    prefs = ", ".join(user_profile.get("reading_interests", [])) or "chua ro"
    first = retrieved[0]["title"]
    names = "; ".join([x["title"] for x in retrieved])
    return f"Du tren so thich ({prefs}), ban co the bat dau voi {first}. Cac lua chon khac: {names}."


@app.post("/api/v1/chat/recommend")
async def recommend(req: ChatRequest):
    user_profile = user_store.get(req.user_id, {"reading_interests": [], "embedding": np.zeros(DIM, dtype="float32")})
    text_vec = embed_text(req.question)
    user_vec = normalize(user_profile["embedding"])
    query_vec = fuse_query(text_vec, user_vec, alpha=0.6)
    top_books = retrieve_top_books(query_vec, req.top_k)
    answer = generate_answer(user_profile, top_books)

    return {
        "user_id": req.user_id,
        "question": req.question,
        "retrieved": top_books,
        "answer": answer,
    }
```

## 8. Ke hoach trien khai theo giai doan

### Giai doan 1 - Scaffold Chat Service (1-2 ngay)
- Tao service `chat-service` (FastAPI)
- Them route proxy gateway: `/api/v1/chat/*`
- Tao health endpoint: `/healthz`

Deliverable:
- Chat service chay duoc qua Docker Compose
- Gateway goi duoc den chat service

### Giai doan 2 - Data va Event Pipeline (2-4 ngay)
- Chuan hoa event schema tu cac service: view, search, add_to_cart, purchase, rating
- Worker consume RabbitMQ va cap nhat user behavior store
- Tao embedding batch job + update vector index

Deliverable:
- Co user embedding va product embedding co the truy hoi

### Giai doan 3 - RAG MVP (2-3 ngay)
- Retrieval top-K bang FAISS/Pinecone
- Prompt template + LLM generation
- Redis cache cho profile/retrieval

Deliverable:
- Endpoint `/api/v1/chat/recommend` (direct service) va `/api/v1/proxy/chat-service/chat/recommend/` (qua gateway) tra loi ca nhan hoa

### Giai doan 4 - Toi uu va MLOps (3-5 ngay)
- A/B test alpha fusion va top_k
- Eval quality (CTR recommendation, conversion, CSAT)
- Setup retrain schedule + model registry

Deliverable:
- Dashboard metric + quy trinh retrain on schedule

### Giai doan 5 - Kubernetes Production (2-4 ngay)
- Deployment rieng cho chat API, embedding worker, scheduler
- HPA theo CPU va p95 latency
- Circuit breaker, timeout, retry, tracing

Deliverable:
- He thong scale doc lap, on-call friendly

## 9. Huong dan su dung (Developer Runbook)

### 9.1 Chay he thong hien tai
Tai root du an:
```bash
docker compose up -d --build
```

### 9.2 Migrate cac Django services (neu can)
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

### 9.3 Kiem tra health
```bash
curl http://localhost:8000/api/v1/healthz/
curl http://localhost:8000/api/v1/services-health/
```

### 9.4 Kich hoat luong chat de test
Khi bo sung chat-service vao compose, test endpoint:
```bash
curl -X POST http://localhost:8000/api/v1/proxy/chat-service/chat/recommend/ \
  -H "Content-Type: application/json" \
  -d '{"user_id":"u_1024","question":"Toi nen doc sach gi?","top_k":3}'
```

### 9.5 Redis cache policy de xuat
- `user_profile:{user_id}` TTL 10 phut
- `user_embedding:{user_id}` TTL 10 phut
- `rag_topk:{user_id}:{query_hash}` TTL 3 phut

### 9.6 Logging va metric toi thieu
- Request ID xuyen suot: gateway -> chat-service -> workers
- p95 latency chat endpoint
- cache hit ratio
- vector retrieval latency
- LLM token usage va cost/request

## 10. Checklist san sang production
- [ ] Chat service tach rieng va scale doc lap
- [ ] Khong truy cap cheo DB giua services
- [ ] Event consumers idempotent
- [ ] Co timeout + retry + circuit breaker
- [ ] Co tracing + metrics + logs tap trung
- [ ] Co fallback khi LLM timeout (tra loi template/co ban)
- [ ] Co guardrail prompt (khong bịa thong tin)
- [ ] Co danh gia chat quality va recommendation quality

## 11. Assumptions
- Du an tiep tuc dung PostgreSQL, RabbitMQ, Redis nhu hien tai.
- API Gateway se bo sung route cho chat-service.
- LLM provider (OpenAI/Azure/vLLM) duoc cau hinh qua bien moi truong.
- Giai doan MVP uu tien FAISS local; production can nhac Pinecone.
