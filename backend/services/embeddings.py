import os
import logging
from typing import List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from backend.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.fallback_vectorizer: Optional[TfidfVectorizer] = None
        self.fallback_matrix = None

    def get_embedding(self, text: str, is_query: bool = False) -> List[float]:
        """Generate embedding vector using Gemini API if key is set, else fallback."""
        key = settings.GEMINI_API_KEY if settings.GEMINI_ENABLED else ""
        if key:
            model_name = settings.DEFAULT_EMBEDDING_MODEL
            # Retry loop for rate limits or transient errors
            for attempt in range(3):
                try:
                    # Try google.genai first
                    try:
                        from google import genai
                        client = genai.Client(api_key=key)
                        res = client.models.embed_content(
                            model=model_name,
                            contents=text
                        )
                        if hasattr(res, 'embedding') and hasattr(res.embedding, 'values'):
                            return list(res.embedding.values)
                        elif hasattr(res, 'embeddings') and len(res.embeddings) > 0:
                            return list(res.embeddings[0].values)
                    except Exception as e1:
                        # Fallback to google.generativeai
                        legacy_model = model_name if model_name.startswith("models/") else f"models/{model_name}"
                        import google.generativeai as genai_legacy
                        genai_legacy.configure(api_key=key)
                        task_type = "retrieval_query" if is_query else "retrieval_document"
                        res = genai_legacy.embed_content(
                            model=legacy_model,
                            content=text,
                            task_type=task_type
                        )
                        if "embedding" in res:
                            return res["embedding"]
                except Exception as ex:
                    error_str = str(ex)
                    if ("429" in error_str or "RESOURCE_EXHAUSTED" in error_str) and attempt < 2:
                        wait_sec = 2 * (attempt + 1)
                        logger.warning(f"Gemini embedding rate-limited (attempt {attempt + 1}). Retrying in {wait_sec}s...")
                        import time
                        time.sleep(wait_sec)
                        continue
                    logger.warning(f"Gemini embedding API call failed: {ex}. Using fallback.")
                    break

        # Fallback local pseudo-embedding (deterministic hash/tf representation)
        return self._local_dense_vector(text)

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Batch embedding generation with rate limit and chunk consideration."""
        key = settings.GEMINI_API_KEY if settings.GEMINI_ENABLED else ""
        if key and texts:
            model_name = settings.DEFAULT_EMBEDDING_MODEL
            try:
                from google import genai
                client = genai.Client(api_key=key)
                
                all_embeddings = []
                batch_size = 50
                for i in range(0, len(texts), batch_size):
                    batch = texts[i:i + batch_size]
                    batch_res = None
                    for attempt in range(4):
                        try:
                            batch_res = client.models.embed_content(
                                model=model_name,
                                contents=batch
                            )
                            break
                        except Exception as b_err:
                            err_msg = str(b_err)
                            if ("429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg) and attempt < 3:
                                wait_time = 15 + (attempt * 10)
                                logger.warning(f"Rate limit reached on batch {i//batch_size + 1}. Waiting {wait_time}s before retry...")
                                import time
                                time.sleep(wait_time)
                                continue
                            logger.error(f"Error on batch {i//batch_size + 1}: {b_err}")
                            break

                    if batch_res:
                        if hasattr(batch_res, 'embeddings') and len(batch_res.embeddings) > 0:
                            all_embeddings.extend([list(e.values) for e in batch_res.embeddings])
                        elif hasattr(batch_res, 'embedding') and hasattr(batch_res.embedding, 'values'):
                            all_embeddings.append(list(batch_res.embedding.values))
                        import time
                        time.sleep(1.0)
                    else:
                        # Fallback for this batch
                        logger.warning(f"Using local dense fallback for batch of {len(batch)} items.")
                        for t in batch:
                            all_embeddings.append(self._local_dense_vector(t))

                if len(all_embeddings) == len(texts):
                    return all_embeddings
            except Exception as ex:
                logger.warning(f"Batch Gemini embedding failed: {ex}. Using local fallback.")

        return [self._local_dense_vector(t) for t in texts]

    def _local_dense_vector(self, text: str, dim: int = 256) -> List[float]:
        """A lightweight deterministic local representation when API key is not yet set."""
        import hashlib
        words = text.lower().split()
        vec = np.zeros(dim, dtype=np.float32)
        for w in words:
            h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if (h // dim) % 2 == 0 else -1.0
            vec[idx] += sign
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_service = EmbeddingService()
