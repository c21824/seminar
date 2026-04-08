from __future__ import annotations

import json
import os
import time
from typing import Any

import httpx


def _build_context(retrieved_books: list[dict[str, Any]]) -> str:
    if not retrieved_books:
        return "No retrieved books. Ask follow-up question to clarify preferences."

    lines = []
    for index, book in enumerate(retrieved_books, start=1):
        lines.append(
            f"{index}. title={book.get('title', '')}; "
            f"author={book.get('author', '')}; "
            f"category={book.get('category', '')}; "
            f"score={book.get('score', 0):.3f}"
        )
    return "\n".join(lines)


def _build_instruction(intent: str) -> str:
    base = (
        "You are BookOps AI assistant for an online bookstore. "
        "Reply in the same language as the user's latest question unless the user asks otherwise. "
        "Use plain text only (no markdown, no bold markers, no bullet symbols). "
        "Always complete your final sentence before finishing. "
        "Keep answers concise, practical, and friendly. "
        "If data is missing, be transparent and ask one focused follow-up question."
    )

    if intent == "book_recommendation":
        return (
            f"{base} "
            "For recommendations, use only retrieved books and never invent title/author."
        )
    if intent == "catalog_info":
        return (
            f"{base} "
            "For catalog questions, summarize categories, available options, and clear next steps."
        )
    if intent == "order_support":
        return (
            f"{base} "
            "For order/payment/shipping questions, provide actionable troubleshooting steps."
        )
    return (
        f"{base} "
        "Support multi-purpose shopping assistant behavior: discovery, comparison, and shopping flow help."
    )


def _build_task(intent: str) -> str:
    if intent == "book_recommendation":
        return (
            "Include naturally in plain text: one top recommendation, two alternatives, and a short reason for each."
        )
    if intent == "catalog_info":
        return (
            "Include naturally in plain text: a concise catalog overview, suggested categories/books to open, "
            "and one follow-up question to refine user intent."
        )
    if intent == "order_support":
        return (
            "Include naturally in plain text: likely cause, practical steps to resolve, and a fallback option if issue persists."
        )
    return (
        "Include naturally in plain text: a direct answer, practical next actions, "
        "and one optional suggestion related to bookstore workflow."
    )


def generate_personalized_answer(
    question: str,
    user_profile: dict[str, Any],
    retrieved_books: list[dict[str, Any]],
    intent: str,
    catalog_snapshot: str,
    history: list[dict[str, str]] | None = None,
) -> tuple[str | None, str | None]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None, "missing_api_key"

    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip() or "gemini-2.0-flash"
    timeout_seconds = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "20"))
    max_retries = int(os.getenv("GEMINI_MAX_RETRIES", "2"))
    backoff_seconds = float(os.getenv("GEMINI_RETRY_BACKOFF_SECONDS", "1.0"))
    max_output_tokens = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "700"))

    # Ensure retry knobs stay in safe bounds.
    timeout_seconds = min(max(timeout_seconds, 5.0), 90.0)
    max_retries = min(max(max_retries, 0), 5)
    backoff_seconds = min(max(backoff_seconds, 0.2), 5.0)
    max_output_tokens = min(max(max_output_tokens, 128), 2048)

    interests = ", ".join(user_profile.get("reading_interests", [])) or "unknown"
    retrieval_context = _build_context(retrieved_books)
    history = history or []
    compact_history = "\n".join(
        f"{item.get('role', 'user')}: {item.get('text', '')}" for item in history[-8:]
    )

    instruction = _build_instruction(intent)
    task = _build_task(intent)

    prompt = (
        f"{instruction}\n\n"
        f"Detected intent: {intent}\n"
        f"User question: {question}\n"
        f"User interests: {interests}\n"
        f"Catalog/system snapshot: {catalog_snapshot}\n"
        f"Conversation history (latest first relevant):\n{compact_history or 'No previous messages'}\n"
        f"Retrieved candidates:\n{retrieval_context}\n\n"
        f"{task}"
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    for attempt in range(max_retries + 1):
        try:
            response = httpx.post(
                url,
                params={"key": api_key},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.3,
                        "maxOutputTokens": max_output_tokens,
                    },
                },
                timeout=timeout_seconds,
            )

            if response.status_code in (429, 500, 502, 503, 504):
                if attempt >= max_retries:
                    return None, f"http_{response.status_code}"
                time.sleep(backoff_seconds * (2 ** attempt))
                continue

            response.raise_for_status()
            data = response.json()

            candidates = data.get("candidates") or []
            if not candidates:
                return None, "no_candidates"

            parts = candidates[0].get("content", {}).get("parts", [])
            text = "\n".join(part.get("text", "") for part in parts if part.get("text"))
            final_text = text.strip()
            if not final_text:
                return None, "empty_output"
            return final_text, None
        except (httpx.TimeoutException, httpx.TransportError):
            if attempt >= max_retries:
                return None, "network_or_timeout"
            time.sleep(backoff_seconds * (2 ** attempt))
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code if exc.response is not None else 0
            reason = f"http_{status_code}"
            if exc.response is not None:
                try:
                    payload = exc.response.json()
                    message = payload.get("error", {}).get("message")
                    if message:
                        reason = f"{reason}:{message}"
                except json.JSONDecodeError:
                    pass
            return None, reason
        except Exception:
            return None, "unknown_error"

    return None, "max_retries_exhausted"
