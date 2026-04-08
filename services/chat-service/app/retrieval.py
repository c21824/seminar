from __future__ import annotations

import os
import re

import numpy as np
import faiss
import httpx

BOOKS: list[dict] = [
    {
        "product_id": "book_001",
        "title": "Nguoi Dua Dieu",
        "category": "van_hoc",
        "author": "Khaled Hosseini",
    },
    {
        "product_id": "book_002",
        "title": "Nha Gia Kim",
        "category": "van_hoc",
        "author": "Paulo Coelho",
    },
    {
        "product_id": "book_003",
        "title": "Dac Nhan Tam",
        "category": "ky_nang_song",
        "author": "Dale Carnegie",
    },
    {
        "product_id": "book_004",
        "title": "Tu Duy Nhanh Va Cham",
        "category": "tam_ly",
        "author": "Daniel Kahneman",
    },
    {
        "product_id": "book_005",
        "title": "Quoc Gia Khoi Nghiep",
        "category": "kinh_doanh",
        "author": "Dan Senor",
    },
]

VECTORS = np.array(
    [
        [0.11, 0.23, 0.34, 0.47, 0.16, 0.08, 0.09, 0.41],
        [0.09, 0.21, 0.36, 0.43, 0.14, 0.10, 0.12, 0.39],
        [0.30, 0.07, 0.19, 0.10, 0.34, 0.16, 0.28, 0.06],
        [0.18, 0.24, 0.10, 0.09, 0.15, 0.36, 0.44, 0.13],
        [0.26, 0.05, 0.17, 0.12, 0.38, 0.20, 0.31, 0.04],
    ],
    dtype="float32",
)

BOOK_SERVICE_URL = os.getenv("BOOK_SERVICE_URL", "http://book-service:8000/api/v1/books/")
BOOK_SERVICE_TIMEOUT_SECONDS = float(os.getenv("BOOK_SERVICE_TIMEOUT_SECONDS", "4"))

CATEGORY_HINTS: dict[str, list[str]] = {
    "children & young adult": ["tre em", "thieu nhi", "children", "child", "kids", "young adult", "teen"],
    "self-development": ["ky nang", "self development", "habit", "growth", "improve"],
    "technology": ["cong nghe", "technology", "ai", "code", "programming", "software"],
    "finance & investing": ["tai chinh", "dau tu", "finance", "invest", "money", "wealth"],
    "health & wellness": ["suc khoe", "wellness", "health", "fitness", "dinh duong"],
    "science fiction": ["sci fi", "science fiction", "space", "future"],
    "fantasy": ["fantasy", "magic", "than thoai"],
    "mystery & thriller": ["mystery", "thriller", "trinh tham", "bi an"],
    "romance": ["romance", "tinh yeu", "love story"],
    "history": ["lich su", "history", "civilization"],
}


def _tokenize(text: str) -> set[str]:
    normalized = re.sub(r"[^a-z0-9\s]", " ", (text or "").lower())
    return {token for token in normalized.split() if token}


def _category_bonus(category: str, question_lower: str) -> float:
    hints = CATEGORY_HINTS.get((category or "").lower(), [])
    if not hints:
        return 0.0
    return 0.5 if any(hint in question_lower for hint in hints) else 0.0


def _normalize_live_books(rows: list[dict]) -> list[dict]:
    normalized: list[dict] = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        title = str(row.get("name") or "").strip()
        if not title:
            continue
        normalized.append(
            {
                "product_id": str(row.get("id") or title),
                "title": title,
                "category": str(row.get("catalog_name") or "General").strip() or "General",
                "author": "BookOps Collection",
                "description": str(row.get("description") or ""),
            }
        )
    return normalized


def fetch_live_books() -> tuple[list[dict], str | None]:
    try:
        response = httpx.get(BOOK_SERVICE_URL, timeout=BOOK_SERVICE_TIMEOUT_SECONDS)
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
        books = _normalize_live_books(rows)
        if not books:
            return [], "book_service_empty"
        return books, None
    except Exception:
        return [], "book_service_unavailable"


def retrieve_top_books_for_user(
    question: str,
    user_profile: dict,
    top_k: int,
    index: faiss.IndexFlatIP | None = None,
    query_vec: np.ndarray | None = None,
) -> tuple[list[dict], str | None]:
    live_books, reason = fetch_live_books()
    if live_books:
        question_lower = (question or "").lower()
        question_tokens = _tokenize(question)
        interests = [str(value).lower() for value in user_profile.get("reading_interests", [])]

        scored: list[dict] = []
        for book in live_books:
            haystack = " ".join([book["title"], book.get("description", ""), book.get("category", "")])
            haystack_tokens = _tokenize(haystack)
            overlap = len(question_tokens.intersection(haystack_tokens))

            interest_bonus = 0.35 if any(interest in book["category"].lower() for interest in interests) else 0.0
            category_bonus = _category_bonus(book.get("category", ""), question_lower)
            score = (overlap * 0.25) + interest_bonus + category_bonus
            score += 0.0001 * (hash(book["product_id"]) % 100)

            item = dict(book)
            item["score"] = float(score)
            scored.append(item)

        scored.sort(key=lambda item: item.get("score", 0.0), reverse=True)
        return scored[:top_k], None

    if index is not None and query_vec is not None:
        return retrieve_top_books(index, query_vec, top_k=top_k), reason

    return [], reason


def build_index() -> faiss.IndexFlatIP:
    index = faiss.IndexFlatIP(VECTORS.shape[1])
    vectors = VECTORS.copy()
    faiss.normalize_L2(vectors)
    index.add(vectors)
    return index


def retrieve_top_books(index: faiss.IndexFlatIP, query_vec: np.ndarray, top_k: int) -> list[dict]:
    q = query_vec.reshape(1, -1).astype("float32")
    faiss.normalize_L2(q)
    scores, indices = index.search(q, top_k)

    results: list[dict] = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0:
            continue
        item = dict(BOOKS[idx])
        item["score"] = float(score)
        results.append(item)
    return results
