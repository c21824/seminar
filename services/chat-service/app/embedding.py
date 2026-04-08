import numpy as np


def normalize(vec: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return vec / norm


def embed_question(question: str, dim: int = 8) -> np.ndarray:
    # Deterministic mock embedding for MVP local development.
    seed = sum(ord(ch) for ch in question) % 10007
    rng = np.random.default_rng(seed)
    return normalize(rng.random(dim, dtype=np.float32))


def fuse_query(text_embedding: np.ndarray, user_embedding: np.ndarray, alpha: float) -> np.ndarray:
    alpha = float(min(max(alpha, 0.0), 1.0))
    mixed = alpha * text_embedding + (1.0 - alpha) * user_embedding
    return normalize(mixed.astype(np.float32))
