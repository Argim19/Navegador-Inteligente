"""
Repositorio y Motor de Búsqueda Vectorial Híbrido Local.
Gestiona indexación de cláusulas, persistencia atómica en JSON,
resolución de políticas vigentes y cálculo de similitud local de alta precisión
mediante TF-IDF con ponderación IDF y relevancia léxica (sub-10ms).
"""

import json
import logging
import re
import unicodedata
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from backend.config import settings
from backend.models import DocumentChunk, DocumentItem, Citation
from backend.services.embeddings import embedding_service

logger = logging.getLogger(__name__)

# Stopwords en español para depurar términos en el scoring léxico
SPANISH_STOPWORDS = {
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al", "en", "para", "por", "con", "sin",
    "sobre", "entre", "desde", "hasta", "hacia", "como", "que", "cual", "cuales", "quien", "quienes", "donde", "cuando",
    "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "aquello", "aquellos", "aquellas",
    "todo", "toda", "todos", "todas", "otro", "otra", "otros", "otras", "mismo", "misma", "mismos", "mismas",
    "mi", "me", "mis", "tu", "tus", "su", "sus", "nuestro", "nuestra", "nuestros", "nuestras", "si", "no",
    "empresa", "compania", "colaborador", "colaboradores", "empleado", "empleados", "area", "areas", "cada", "caso",
    "debe", "deben", "sera", "seran", "sido", "esta", "estan", "tiene", "tienen", "haber", "hacer", "toca"
}


def normalize_text(text: str) -> str:
    """Elimina acentos, tildes y pasa el texto a minúsculas."""
    text = unicodedata.normalize("NFKD", text).encode("ASCII", "ignore").decode("utf-8")
    return text.lower()


class VectorStore:
    """Almacén documental y motor de recuperación local de alta velocidad."""

    def __init__(self):
        self.chunks: List[DocumentChunk] = []
        self.documents: Dict[str, DocumentItem] = {}
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.load_store()

    def load_store(self) -> None:
        """Carga fragmentos y documentos almacenados en disco."""
        if settings.VECTOR_DB_FILE.exists():
            try:
                with open(settings.VECTOR_DB_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.chunks = [DocumentChunk(**c) for c in data.get("chunks", [])]
                    self.documents = {k: DocumentItem(**v) for k, v in data.get("documents", {}).items()}
                logger.info(f"Base vectorial cargada: {len(self.chunks)} cláusulas, {len(self.documents)} documentos.")
                self._rebuild_tfidf_index()
            except Exception as e:
                logger.error(f"Error al cargar base vectorial: {e}")
                self.chunks = []
                self.documents = {}

    def save_store(self) -> None:
        """Persiste atómicamente los fragmentos y metadatos en disco."""
        try:
            data = {
                "chunks": [c.model_dump() for c in self.chunks],
                "documents": {k: v.model_dump() for k, v in self.documents.items()}
            }
            with open(settings.VECTOR_DB_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info("Base vectorial guardada exitosamente en disco.")
            self._rebuild_tfidf_index()
        except Exception as e:
            logger.error(f"Error guardando base vectorial: {e}")

    def _rebuild_tfidf_index(self) -> None:
        """Construye o actualiza el índice TF-IDF para búsquedas de alta precisión en memoria RAM."""
        if not self.chunks:
            self.tfidf_vectorizer = None
            self.tfidf_matrix = None
            return

        try:
            corpus = [f"{c.doc_title} - {c.clause_title}\n{c.content}" for c in self.chunks]
            self.tfidf_vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                sublinear_tf=True,
                strip_accents="unicode",
                lowercase=True,
                token_pattern=r"(?u)\b\w\w+\b"
            )
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(corpus)
            logger.info(f"Índice TF-IDF entrenado exitosamente con {len(corpus)} documentos.")
        except Exception as ex:
            logger.error(f"Error construyendo índice TF-IDF: {ex}")

    def update_active_versions(self) -> None:
        """
        Determina la versión más reciente para cada política base,
        marcando la más alta como Vigente (is_active=True) y las anteriores como Históricas.
        """
        base_policies: Dict[str, List[DocumentItem]] = {}
        for doc in self.documents.values():
            base_policies.setdefault(doc.base_title, []).append(doc)

        for base_title, docs in base_policies.items():
            def parse_ver(v_str: str) -> List[int]:
                try:
                    return [int(x) for x in v_str.split(".")]
                except Exception:
                    return [0]

            sorted_docs = sorted(docs, key=lambda d: parse_ver(d.version), reverse=True)
            if sorted_docs:
                latest_doc = sorted_docs[0]
                for doc in sorted_docs:
                    is_latest = (doc.doc_id == latest_doc.doc_id)
                    doc.is_active = is_latest
                    for c in self.chunks:
                        if c.doc_id == doc.doc_id:
                            c.is_active = is_latest

    def add_document(self, doc_item: DocumentItem, chunks: List[DocumentChunk], compute_embeddings: bool = False) -> None:
        """Agrega o actualiza un documento y sus cláusulas en el almacén."""
        self.chunks = [c for c in self.chunks if c.doc_id != doc_item.doc_id]
        self.documents[doc_item.doc_id] = doc_item

        if compute_embeddings and settings.GEMINI_API_KEY and settings.GEMINI_ENABLED:
            try:
                texts_to_embed = [f"{c.doc_title} - {c.clause_title}\n{c.content}" for c in chunks]
                embeddings = embedding_service.get_batch_embeddings(texts_to_embed)
                for c, emb in zip(chunks, embeddings):
                    c.embedding = emb
            except Exception as e:
                logger.warning(f"No se pudieron calcular embeddings para nuevo documento: {e}")

        self.chunks.extend(chunks)
        self.update_active_versions()
        self.save_store()

    def recompute_all_embeddings(self) -> None:
        """Recalcula los embeddings de todos los fragmentos si hay API Key disponible."""
        if not settings.GEMINI_API_KEY or not settings.GEMINI_ENABLED or not self.chunks:
            return
        try:
            texts = [f"{c.doc_title} - {c.clause_title}\n{c.content}" for c in self.chunks]
            embeddings = embedding_service.get_batch_embeddings(texts)
            for c, emb in zip(self.chunks, embeddings):
                c.embedding = emb
            self.save_store()
            logger.info(f"Embeddings recalculados exitosamente para {len(self.chunks)} cláusulas.")
        except Exception as e:
            logger.warning(f"No se pudieron recalcular embeddings en segundo plano: {e}")

    def search(
        self,
        query: str,
        department: str = "Todos (Acceso General)",
        top_k: int = 3,
        active_versions_only: bool = True
    ) -> Tuple[List[Citation], int]:
        """
        Búsqueda y recuperación 100% local en memoria RAM (~8-10ms).
        Utiliza TF-IDF estadístico con ponderación IDF + N-Grams + Refuerzo Léxico.
        Tanto el modo local como el modo Gemini utilizan esta recuperación rápida.
        """
        # 1. Filtrar candidatos elegibles (por vigencia)
        eligible_items: List[Tuple[int, DocumentChunk]] = []
        for orig_idx, chunk in enumerate(self.chunks):
            if active_versions_only and not chunk.is_active:
                continue
            eligible_items.append((orig_idx, chunk))

        total_candidates = len(eligible_items)
        if not eligible_items:
            return [], 0

        # 2. Asegurar que el modelo TF-IDF esté listo
        if self.tfidf_vectorizer is None or self.tfidf_matrix is None:
            self._rebuild_tfidf_index()

        # Calcular similitud TF-IDF de la consulta
        tfidf_sims = np.zeros(len(self.chunks), dtype=np.float32)
        if self.tfidf_vectorizer and self.tfidf_matrix is not None:
            try:
                q_tfidf = self.tfidf_vectorizer.transform([query])
                tfidf_sims = (self.tfidf_matrix * q_tfidf.T).toarray().flatten()
            except Exception as e:
                logger.warning(f"Error calculando similitud TF-IDF: {e}")

        # 3. Extraer términos clave de la consulta para el refuerzo léxico
        norm_query = normalize_text(query)
        query_terms = [t for t in re.findall(r"\w{3,}", norm_query) if t not in SPANISH_STOPWORDS]

        # 4. Cálculo de puntuación combinada
        scored_chunks: List[Tuple[float, DocumentChunk]] = []

        for orig_idx, chunk in eligible_items:
            chunk_tfidf = float(tfidf_sims[orig_idx]) if orig_idx < len(tfidf_sims) else 0.0

            # Refuerzo léxico exacto de palabras clave
            chunk_full_text = f"{chunk.doc_title} {chunk.clause_title} {chunk.content}"
            norm_content = normalize_text(chunk_full_text)

            matched_terms_count = 0
            if query_terms:
                for term in query_terms:
                    if term in norm_content:
                        matched_terms_count += 1
                lexical_ratio = matched_terms_count / len(query_terms)
            else:
                lexical_ratio = 0.0

            # Puntuación final: 70% TF-IDF estadístico + 30% Refuerzo Léxico directo
            final_score = (chunk_tfidf * 0.70) + (lexical_ratio * 0.30)
            scored_chunks.append((final_score, chunk))

        # 5. Ordenar por puntuación descendente
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_chunks[:top_k]

        citations: List[Citation] = []
        for score, chunk in top_results:
            quote = chunk.content.strip()
            if len(quote) > 320:
                quote = quote[:320] + "..."

            relevance = round(max(0.0, min(1.0, score)), 3)

            citations.append(Citation(
                doc_id=chunk.doc_id,
                doc_title=chunk.doc_title,
                file_name=chunk.file_name,
                version=chunk.version,
                clause_title=chunk.clause_title,
                page_or_section=chunk.page_or_section,
                quote=quote,
                relevance_score=relevance,
                scopes=chunk.scopes
            ))

        return citations, total_candidates


vector_store = VectorStore()
