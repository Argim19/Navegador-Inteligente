"""
Servicio Orquestador RAG (Retrieval-Augmented Generation).
Integra guardrails de privacidad, búsqueda vectorial local ultra-rápida
y síntesis ejecutiva sub-segundo con Google Gemini Flash Lite / Fallback Local.
"""

import time
import logging
from typing import List, Optional, Tuple

from backend.config import settings
from backend.models import SearchRequest, SearchResponse, Citation, GuardrailNotice
from backend.services.guardrails import guardrail_service
from backend.services.vector_store import vector_store

logger = logging.getLogger(__name__)

STRICT_RAG_SYSTEM_PROMPT = """Eres el Asistente Oficial del Navegador de Políticas y Normativas de la empresa.
Tu objetivo es responder la consulta del colaborador de forma concisa, clara, directa y 100% veraz basándote EXCLUSIVAMENTE en el CONTEXTO DOCUMENTAL provisto.

REGLAS:
1. Responde de forma directa en 1 a 3 oraciones principales o viñetas claras.
2. Cita al final entre paréntesis la política y cláusula de respaldo (ej. *[Política de Trabajo Remoto v8.0 - Cláusula 4]*).
3. Si la información no está en el contexto, indica amablemente que no se encuentra en las normativas actuales.
4. Tono: Profesional, accesible y en español.
"""


class RAGService:
    """Orquestador del pipeline RAG con guardrails y síntesis ultra-rápida."""

    def __init__(self):
        self._cached_key: Optional[str] = None
        self._client = None

    def reset_client(self):
        """Resetea el cliente en memoria."""
        self._cached_key = None
        self._client = None

    def _get_client(self, api_key: str):
        """Retorna una instancia singleton cacheada del cliente Google GenAI."""
        if not api_key:
            self._client = None
            self._cached_key = None
            return None
        if self._client is None or self._cached_key != api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=api_key)
                self._cached_key = api_key
            except Exception as e:
                logger.error(f"Error instanciando cliente Google GenAI: {e}")
                self._client = None
                self._cached_key = None
        return self._client

    def execute_search(self, request: SearchRequest) -> SearchResponse:
        """
        Pipeline optimizado de alta velocidad:
        1. Guardrail de Privacidad (Input Guardrail sub-1ms).
        2. Recuperación 100% local en RAM con TF-IDF (~5-8ms).
        3. Síntesis ejecutiva sub-segundo con Gemini Flash Lite (o Modo Local inmediato).
        """
        start_time = time.time()
        query = request.query.strip()
        dept = request.department

        # 1. Input Guardrail: Verificar si la consulta es sobre saldos, sueldos privados o PII
        guardrail_result = guardrail_service.evaluate_query(query)
        if guardrail_result.is_blocked:
            exec_time = round((time.time() - start_time) * 1000, 2)
            
            blocked_summary = (
                f"### 🛡️ {guardrail_result.title}\n\n"
                f"{guardrail_result.message}\n\n"
                f"💡 **Canal Recomendado:**\n{guardrail_result.suggestion}\n\n"
                f"*(Este navegador corporativo permite a cualquier empleado consultar libremente normativas, "
                f"viáticos, beneficios, trabajo remoto, seguridad y contratos sin exponer información privada).*"
            )

            return SearchResponse(
                query=query,
                department=dept,
                summary=blocked_summary,
                citations=[],
                total_candidates=0,
                execution_time_ms=exec_time,
                model_used="Guardrail de Seguridad y Privacidad",
                has_api_key=bool(settings.GEMINI_API_KEY and settings.GEMINI_ENABLED),
                is_intercepted=True,
                guardrail_notice=GuardrailNotice(
                    is_intercepted=True,
                    category=guardrail_result.category or "SECURITY_POLICY",
                    title=guardrail_result.title or "Consulta Interceptada",
                    message=guardrail_result.message or "",
                    suggestion=guardrail_result.suggestion or ""
                )
            )

        # 2. Búsqueda y Recuperación 100% Local en Memoria RAM (~5-8ms)
        citations, total_candidates = vector_store.search(
            query=query,
            department=dept,
            top_k=request.top_k,
            active_versions_only=request.active_versions_only
        )

        # 3. Síntesis del Resumen Ejecutivo (Gemini Flash Lite o Modo Local)
        summary, model_used = self._synthesize_answer(query, dept, citations)
        exec_time = round((time.time() - start_time) * 1000, 2)
        is_active = bool(settings.GEMINI_API_KEY and settings.GEMINI_ENABLED)

        return SearchResponse(
            query=query,
            department=dept,
            summary=summary,
            citations=citations,
            total_candidates=total_candidates,
            execution_time_ms=exec_time,
            model_used=model_used if is_active else "Búsqueda Semántica Vectorial (Local)",
            has_api_key=is_active,
            is_intercepted=False,
            guardrail_notice=None
        )

    def _synthesize_answer(self, query: str, department: str, citations: List[Citation]) -> Tuple[str, str]:
        """Genera la respuesta ejecutiva mediante Gemini Flash Lite o síntesis local si no hay API Key."""
        key = settings.GEMINI_API_KEY if settings.GEMINI_ENABLED else ""

        if not key:
            return self._build_local_summary(query, citations), "Búsqueda Semántica Vectorial (Local)"

        if not citations or citations[0].relevance_score < 0.10:
            return (
                "⚠️ No se encontró información relevante sobre esta consulta en las políticas corporativas vigentes. "
                "Te sugerimos revisar los términos de búsqueda o contactar al área correspondiente.",
                settings.DEFAULT_LLM_MODEL
            )

        # Construir bloque de contexto oficial conciso
        context_blocks = []
        for idx, c in enumerate(citations, start=1):
            context_blocks.append(
                f"[DOCUMENTO {idx}: {c.doc_title} (v{c.version}) - {c.clause_title}]\n{c.quote}"
            )
        context_text = "\n\n".join(context_blocks)

        prompt = f"""CONTEXTO OFICIAL:
{context_text}

PREGUNTA DEL COLABORADOR:
"{query}"

RESUMEN EJECUTIVO DIRECTO:"""

        client = self._get_client(key)
        if not client:
            return self._build_local_summary(query, citations), "Búsqueda Semántica Vectorial (Local)"

        from google.genai import types
        gen_config = types.GenerateContentConfig(
            system_instruction=STRICT_RAG_SYSTEM_PROMPT,
            temperature=0.1,
            max_output_tokens=280
        )

        # Intentar con el modelo ultrarrápido configurado (sin duplicados)
        candidate_models = list(dict.fromkeys([settings.DEFAULT_LLM_MODEL, "gemini-3.1-flash-lite", "gemini-3.5-flash-lite"]))
        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=gen_config
                )
                if response and response.text:
                    return response.text.strip(), model_name
            except Exception as ex:
                logger.warning(f"Intento con {model_name} falló: {ex}. Probando siguiente modelo...")
                continue

        return self._build_local_summary(query, citations), "Búsqueda Semántica Vectorial (Local)"

    def _build_local_summary(self, query: str, citations: List[Citation]) -> str:
        """Síntesis local instantánea cuando no hay API Key configurada."""
        if not citations:
            return "No se encontraron fragmentos relevantes para esta consulta en las normativas corporativas."

        top = citations[0]
        return (
            f"**Resultado recuperado según la normativa corporativa vigente:**\n\n"
            f"De acuerdo con **{top.doc_title}** (*{top.clause_title}*):\n\n"
            f"> \"{top.quote}\"\n\n"
            f"💡 *Para habilitar síntesis ejecutiva avanzada en lenguaje natural con Gemini Flash Lite, activa la API Key en la barra superior.*"
        )


rag_service = RAGService()
