from typing import Any

from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):
    role: str = Field(min_length=1)
    text: str = Field(min_length=1, max_length=4000)


class ChatRecommendRequest(BaseModel):
    user_id: str = Field(min_length=1)
    question: str = Field(min_length=2, max_length=2000)
    top_k: int = Field(default=3, ge=1, le=20)
    session_id: str | None = None
    history: list[ChatHistoryItem] = Field(default_factory=list)


class ChatRecommendResponse(BaseModel):
    user_id: str
    question: str
    retrieved: list[dict[str, Any]]
    answer: str
    source: str = "rag-personalized"
    llm_reason: str | None = None
