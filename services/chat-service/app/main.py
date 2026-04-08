from __future__ import annotations

import os
import re
from typing import Any

import httpx
import numpy as np
from fastapi import FastAPI
from redis import Redis

from app.embedding import embed_question, fuse_query
from app.llm import generate_personalized_answer
from app.retrieval import BOOKS, build_index, retrieve_top_books_for_user
from app.schemas import ChatRecommendRequest, ChatRecommendResponse

app = FastAPI(title="chat-service", version="1.0.0")

VECTOR_DIM = 8
ALPHA_FUSION = float(os.getenv("ALPHA_FUSION", "0.6"))
DEFAULT_TOP_K = int(os.getenv("VECTOR_TOP_K", "5"))
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CATALOG_SERVICE_URL = os.getenv("CATALOG_SERVICE_URL", "http://catalog-service:8000/api/v1/catalog-items/")
CATALOG_SERVICE_TIMEOUT_SECONDS = float(os.getenv("CATALOG_SERVICE_TIMEOUT_SECONDS", "4"))

INDEX = build_index()
REDIS_CLIENT = Redis.from_url(REDIS_URL, decode_responses=True)

MOCK_USER_PROFILES: dict[str, dict[str, Any]] = {
    "u_1024": {
        "reading_interests": ["van_hoc", "tam_ly"],
        "embedding": [0.10, 0.22, 0.30, 0.40, 0.12, 0.09, 0.07, 0.33],
    },
    "u_2048": {
        "reading_interests": ["kinh_doanh", "ky_nang_song"],
        "embedding": [0.27, 0.04, 0.19, 0.14, 0.35, 0.18, 0.29, 0.08],
    },
    "customer1@bookops.local": {
        "reading_interests": ["van_hoc", "tieu_thuyet"],
        "embedding": [0.11, 0.20, 0.33, 0.42, 0.11, 0.10, 0.09, 0.30],
    },
    "customer2@bookops.local": {
        "reading_interests": ["ky_nang_song", "kinh_doanh"],
        "embedding": [0.28, 0.06, 0.18, 0.15, 0.34, 0.17, 0.25, 0.09],
    },
}

GREETING_PATTERN = re.compile(
    r"^\s*(hi|hello|hey|chao|chao ban|xin chao|alo|yo|good morning|good afternoon|good evening)\s*[!.?]*\s*$",
    re.IGNORECASE,
)

RECOMMENDATION_HINTS = {
    "recommend",
    "suggest",
    "book",
    "books",
    "read",
    "novel",
    "genre",
    "author",
    "goi y",
    "sach",
    "doc",
    "the loai",
    "tac gia",
}

CATALOG_HINTS = {
    "catalog",
    "category",
    "categories",
    "list",
    "available",
    "inventory",
    "danh muc",
    "danh sach",
    "co nhung gi",
}

ORDER_HINTS = {
    "order",
    "checkout",
    "payment",
    "shipping",
    "delivery",
    "cart",
    "refund",
    "tracking",
    "thanh toan",
    "don hang",
    "van chuyen",
    "gio hang",
}

CATEGORY_LABELS = {
    "van_hoc": "Literature",
    "tieu_thuyet": "Novel",
    "ky_nang_song": "Life Skills",
    "tam_ly": "Psychology",
    "kinh_doanh": "Business",
}


def _get_user_profile(user_id: str) -> dict[str, Any]:
    cache_key = f"user_profile:{user_id}"
    cached_interests = None
    cached_embedding = None
    try:
        cached_interests = REDIS_CLIENT.get(f"{cache_key}:interests")
        cached_embedding = REDIS_CLIENT.get(f"{cache_key}:embedding")
    except Exception:
        # Fallback to in-memory profile if Redis is not available.
        cached_interests = None
        cached_embedding = None

    if cached_interests and cached_embedding:
        return {
            "reading_interests": cached_interests.split(","),
            "embedding": [float(x) for x in cached_embedding.split(",")],
        }

    profile = MOCK_USER_PROFILES.get(
        user_id,
        {
            "reading_interests": [],
            "embedding": [0.0] * VECTOR_DIM,
        },
    )

    try:
        REDIS_CLIENT.setex(f"{cache_key}:interests", 600, ",".join(profile["reading_interests"]))
        REDIS_CLIENT.setex(
            f"{cache_key}:embedding",
            600,
            ",".join(str(v) for v in profile["embedding"]),
        )
    except Exception:
        pass
    return profile


def _generate_answer(user_profile: dict[str, Any], retrieved_books: list[dict[str, Any]]) -> str:
    if not retrieved_books:
        return "I could not find a suitable recommendation yet. Which genre do you prefer?"

    interests = ", ".join(user_profile.get("reading_interests", [])) or "chua ro"
    first_title = retrieved_books[0]["title"]
    options = "; ".join([f"{b['title']} ({b['category']})" for b in retrieved_books])
    return (
        f"Based on your interests ({interests}), I recommend starting with {first_title}. "
        f"Other good options: {options}."
    )


def _fetch_catalog_items() -> tuple[list[dict[str, Any]], str | None]:
    try:
        response = httpx.get(CATALOG_SERVICE_URL, timeout=CATALOG_SERVICE_TIMEOUT_SECONDS)
        response.raise_for_status()
        payload = response.json()
        if isinstance(payload, list):
            rows = payload
        elif isinstance(payload, dict):
            if isinstance(payload.get("results"), list):
                rows = payload["results"]
            elif isinstance(payload.get("value"), list):
                rows = payload["value"]
            else:
                rows = []
        else:
            rows = []

        normalized = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            name = str(row.get("name") or "").strip()
            if not name:
                continue
            normalized.append(
                {
                    "name": name,
                    "description": str(row.get("description") or "").strip(),
                }
            )
        return normalized, None
    except Exception:
        return [], "catalog_service_unavailable"


def _build_catalog_snapshot(catalog_items: list[dict[str, Any]]) -> str:
    if catalog_items:
        names = ", ".join(item["name"] for item in catalog_items[:12])
        details = "; ".join(
            f"{item['name']}: {item.get('description', '')}" for item in catalog_items[:8]
        )
        return (
            f"catalog_items={names}; "
            f"catalog_details={details}; "
            "source=catalog-service-live"
        )

    categories = sorted({CATEGORY_LABELS.get(book["category"], book["category"]) for book in BOOKS})
    titles = ", ".join(book["title"] for book in BOOKS[:8])
    return (
        f"available_categories={', '.join(categories)}; "
        f"sample_titles={titles}; "
        "supported_features=browse_catalog,cart_selection,checkout,order_tracking,payment_result; "
        "source=fallback-local"
    )


def _is_vietnamese_question(question: str) -> bool:
    text = (question or "").lower()
    hints = [
        "ban",
        "toi",
        "khong",
        "duoc",
        "danh muc",
        "gioi thieu",
        "co the",
        "sach",
        "thanh toan",
        "don hang",
        "van chuyen",
    ]
    return any(hint in text for hint in hints)


def _catalog_answer_from_live_data(question: str, catalog_items: list[dict[str, Any]]) -> str:
    if not catalog_items:
        if _is_vietnamese_question(question):
            return "Xin loi, hien tai toi chua lay duoc du lieu catalog thuc te tu he thong."
        return "Sorry, I cannot fetch live catalog data from the system right now."

    lines = []
    for index, item in enumerate(catalog_items[:10], start=1):
        description = item.get("description") or "No description"
        lines.append(f"{index}. {item['name']} - {description}")

    if _is_vietnamese_question(question):
        return (
            "Danh muc hien co trong he thong cua ban:\n"
            + "\n".join(lines)
            + "\nBan muon xem chi tiet muc nao?"
        )
    return (
        "Current catalog items in your system:\n"
        + "\n".join(lines)
        + "\nWhich catalog item do you want to explore next?"
    )


def _looks_incomplete(text: str) -> bool:
    value = (text or "").strip()
    if len(value) < 130:
        return True
    return not value.endswith((".", "!", "?"))


def _compose_recommendation_answer(question: str, retrieved_books: list[dict[str, Any]]) -> str:
    if not retrieved_books:
        return "I can suggest books after you share your preferred genre or mood."

    top = retrieved_books[0]
    others = retrieved_books[1:3]
    if _is_vietnamese_question(question):
        alternatives = "; ".join(
            f"{book['title']} cua {book['author']}" for book in others
        )
        if not alternatives:
            alternatives = "hien tai chua co them lua chon phu hop"
        return (
            f"Mình gợi ý bạn bắt đầu với {top['title']} của {top['author']}. "
            f"Các lựa chọn thêm: {alternatives}. "
            "Nếu bạn muốn, mình sẽ lọc tiếp theo thể loại hoặc mức giá."
        )

    alternatives = "; ".join(
        f"{book['title']} by {book['author']}" for book in others
    )
    if not alternatives:
        alternatives = "no additional strong alternatives yet"
    return (
        f"I recommend starting with {top['title']} by {top['author']}. "
        f"Other options: {alternatives}. "
        "If you want, I can narrow these by genre, budget, or reading mood."
    )


def _detect_intent(question: str) -> str:
    text = (question or "").lower()

    if any(hint in text for hint in ORDER_HINTS):
        return "order_support"
    if any(hint in text for hint in CATALOG_HINTS):
        return "catalog_info"
    if any(hint in text for hint in RECOMMENDATION_HINTS):
        return "book_recommendation"
    return "general_assistant"


def _fallback_answer_by_intent(
    intent: str,
    user_profile: dict[str, Any],
    retrieved_books: list[dict[str, Any]],
    question: str,
    catalog_items: list[dict[str, Any]],
) -> str:
    interests = ", ".join(user_profile.get("reading_interests", [])) or "your preferences"
    if intent == "catalog_info":
        return _catalog_answer_from_live_data(question, catalog_items)
    if intent == "order_support":
        return (
            "I can support checkout, payment, and shipping questions. "
            "Please share your order issue, and I will guide you step-by-step."
        )
    if intent == "general_assistant":
        return (
            "I can help with catalog lookup, recommendations, checkout flow, and order support. "
            "What do you want to do next?"
        )
    return _generate_answer(user_profile, retrieved_books)


def _is_greeting(question: str) -> bool:
    return bool(GREETING_PATTERN.match(question or ""))


def _greeting_answer(user_profile: dict[str, Any]) -> str:
    interests = ", ".join(user_profile.get("reading_interests", []))
    if interests:
        return (
            f"Hi! I am your AI book assistant. I can see your interests: {interests}. "
            "Would you like recommendations by mood, genre, or budget?"
        )
    return (
        "Hi! I am BookOps AI book assistant. "
        "What genres do you enjoy so I can recommend matching books?"
    )


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok", "service": "chat-service"}


@app.get("/api/v1/healthz")
async def api_healthz() -> dict[str, str]:
    return {"status": "ok", "service": "chat-service"}


@app.post("/api/v1/chat/recommend", response_model=ChatRecommendResponse)
async def recommend_books(payload: ChatRecommendRequest) -> ChatRecommendResponse:
    user_profile = _get_user_profile(payload.user_id)
    intent = _detect_intent(payload.question)
    catalog_items, catalog_reason = _fetch_catalog_items()

    if _is_greeting(payload.question):
        return ChatRecommendResponse(
            user_id=payload.user_id,
            question=payload.question,
            retrieved=[],
            answer=_greeting_answer(user_profile),
            source="system-greeting",
        )

    if intent == "catalog_info" and catalog_items:
        return ChatRecommendResponse(
            user_id=payload.user_id,
            question=payload.question,
            retrieved=[],
            answer=_catalog_answer_from_live_data(payload.question, catalog_items),
            source="system-catalog-live",
            llm_reason=None,
        )

    retrieved_books: list[dict[str, Any]] = []
    retrieval_reason: str | None = None
    if intent == "book_recommendation":
        user_embedding = np.array(user_profile["embedding"], dtype=np.float32)
        text_embedding = embed_question(payload.question, dim=VECTOR_DIM)

        query_embedding = fuse_query(text_embedding, user_embedding, alpha=ALPHA_FUSION)
        top_k = payload.top_k if payload.top_k else DEFAULT_TOP_K
        retrieved_books, retrieval_reason = retrieve_top_books_for_user(
            question=payload.question,
            user_profile=user_profile,
            top_k=top_k,
            index=INDEX,
            query_vec=query_embedding,
        )

    llm_answer, llm_reason = generate_personalized_answer(
        question=payload.question,
        user_profile=user_profile,
        retrieved_books=retrieved_books,
        intent=intent,
        catalog_snapshot=_build_catalog_snapshot(catalog_items),
        history=[item.model_dump() for item in payload.history],
    )
    if not llm_reason and retrieval_reason:
        llm_reason = retrieval_reason
    if llm_answer and intent == "book_recommendation" and _looks_incomplete(llm_answer):
        llm_answer = _compose_recommendation_answer(payload.question, retrieved_books)
        llm_reason = None
    if not llm_answer and catalog_reason and intent == "catalog_info":
        llm_reason = catalog_reason
    source = "gemini" if llm_answer else f"mock-fallback:{llm_reason or 'unknown'}"
    answer = llm_answer or _fallback_answer_by_intent(
        intent,
        user_profile,
        retrieved_books,
        payload.question,
        catalog_items,
    )
    return ChatRecommendResponse(
        user_id=payload.user_id,
        question=payload.question,
        retrieved=retrieved_books,
        answer=answer,
        source=source,
        llm_reason=llm_reason,
    )
