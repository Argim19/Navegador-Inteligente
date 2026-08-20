"""
Rutas y Endpoints de la API REST del Navegador Inteligente.
Provee servicios de búsqueda semántica RAG, gestión documental,
administración de API Key y perfiles organizacionales.
"""

import os
import shutil
import logging
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks

from backend.config import settings, set_gemini_api_key, set_gemini_enabled
from backend.models import (
    SearchRequest,
    SearchResponse,
    DepartmentInfo,
    ConfigUpdateRequest,
    ConfigToggleRequest,
    ConfigStatusResponse,
    IngestStats,
    DocumentItem,
    DocumentChunk,
)
from backend.services.parser import parse_html_document, parse_pdf_document
from backend.services.vector_store import vector_store
from backend.services.rag_service import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


# ==========================================
# 1. Estado del Sistema y Salud
# ==========================================

@router.get("/health")
def health_check():
    """Verificación de operatividad del servicio."""
    return {
        "status": "ok",
        "service": "Navegador Inteligente RAG API",
        "indexed_clauses": len(vector_store.chunks),
        "total_documents": len(vector_store.documents),
    }


# ==========================================
# 2. Configuración y Control de Inteligencia Artificial
# ==========================================

@router.get("/config", response_model=ConfigStatusResponse)
def get_config():
    """Retorna el estado actual de la configuración y de la API Key de Gemini."""
    has_key = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())
    is_active = bool(has_key and settings.GEMINI_ENABLED)
    return ConfigStatusResponse(
        has_gemini_api_key=has_key,
        is_active=is_active,
        total_indexed_chunks=len(vector_store.chunks),
        total_documents=len(vector_store.documents),
        departments=list(settings.DEPARTMENTS_CONFIG.keys()),
    )


@router.post("/config/key")
def update_api_key(payload: ConfigUpdateRequest, background_tasks: BackgroundTasks):
    """Guarda o actualiza la API Key de Gemini e inicia recálculo de embeddings si es necesario."""
    key = payload.api_key.strip()
    enabled = payload.enabled if payload.enabled is not None else True
    set_gemini_api_key(key, enabled=enabled)
    rag_service.reset_client()

    if key and settings.GEMINI_ENABLED:
        background_tasks.add_task(vector_store.recompute_all_embeddings)

    return {
        "message": "API key de Gemini configurada correctamente.",
        "configured": bool(key),
        "is_active": settings.GEMINI_ENABLED,
    }


@router.post("/config/toggle")
def toggle_api_key(payload: ConfigToggleRequest):
    """Activa o desactiva dinámicamente el motor de IA en caliente."""
    has_key = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())
    if not has_key and payload.enabled:
        raise HTTPException(
            status_code=400,
            detail="No se ha configurado ninguna API Key para activar.",
        )
    set_gemini_enabled(payload.enabled)
    return {
        "message": f"Gemini API {'activada' if settings.GEMINI_ENABLED else 'desactivada'} correctamente.",
        "configured": has_key,
        "is_active": settings.GEMINI_ENABLED,
    }


@router.delete("/config/key")
def delete_api_key():
    """Elimina la API Key del servidor y regresa a modo local."""
    set_gemini_api_key("", enabled=False)
    rag_service.reset_client()
    return {
        "message": "API key de Gemini eliminada. El sistema operará en Modo Local.",
        "configured": False,
        "is_active": False,
    }


# ==========================================
# 3. Perfiles Organizacionales / Áreas
# ==========================================

@router.get("/departments", response_model=List[DepartmentInfo])
def list_departments():
    """Retorna la lista de áreas corporativas registradas."""
    result = []
    for dept_id, config in settings.DEPARTMENTS_CONFIG.items():
        result.append(
            DepartmentInfo(
                id=dept_id,
                name=config["name"],
                description=config.get("description", ""),
                allowed_scopes=config.get("allowed_scopes", ["*"]),
            )
        )
    return result


# ==========================================
# 4. Búsqueda y Recuperación Semántica (RAG)
# ==========================================

@router.post("/search", response_model=SearchResponse)
def search_policies(request: SearchRequest):
    """
    Endpoint principal de consulta en lenguaje natural:
    - Evalúa guardrails de privacidad (saldos, sueldos, contraseñas).
    - Ejecuta búsqueda semántica en políticas vigentes.
    - Genera síntesis ejecutiva oficial y citas de respaldo.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="La consulta no puede estar vacía.")

    # Auto-indexar si la base vectorial está vacía
    if len(vector_store.chunks) == 0:
        ingest_all_documents()

    return rag_service.execute_search(request)


# ==========================================
# 5. Gestión Documental e Ingesta
# ==========================================

@router.get("/documents", response_model=List[DocumentItem])
def list_documents():
    """Retorna el inventario completo de documentos y políticas indexadas."""
    return list(vector_store.documents.values())


@router.post("/documents/ingest-all", response_model=IngestStats)
def ingest_all_documents():
    """Escanea e indexa los archivos normativos de la carpeta Documentos_HTML."""
    if not settings.DOCS_DIR.exists():
        raise HTTPException(
            status_code=404,
            detail="Directorio Documentos_HTML no encontrado en el servidor.",
        )

    html_files = sorted(list(settings.DOCS_DIR.glob("*.html")))
    if not html_files:
        raise HTTPException(
            status_code=404,
            detail="No se encontraron archivos HTML en Documentos_HTML.",
        )

    unique_base = set()
    for file_path in html_files:
        try:
            doc_item, chunks = parse_html_document(file_path)
            vector_store.add_document(doc_item, chunks, compute_embeddings=True)
            unique_base.add(doc_item.base_title)
        except Exception as e:
            logger.error(f"Error procesando {file_path.name}: {e}")

    active_count = sum(1 for d in vector_store.documents.values() if d.is_active)

    return IngestStats(
        total_files=len(html_files),
        total_chunks=len(vector_store.chunks),
        unique_policies=len(unique_base),
        latest_versions_count=active_count,
        documents=list(vector_store.documents.values()),
    )


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    department_scope: str = Form("General"),
    version: str = Form("1.0"),
):
    """Permite subir un archivo HTML, PDF o TXT y registrarlo en el índice vectorial."""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in [".html", ".htm", ".pdf", ".txt"]:
        raise HTTPException(
            status_code=400,
            detail="Formato no soportado. Formatos válidos: .html, .pdf, .txt.",
        )

    save_path = settings.DATA_DIR / "uploads" / file.filename
    save_path.parent.mkdir(exist_ok=True, parents=True)

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        scopes = [s.strip() for s in department_scope.split(",") if s.strip()] or ["General"]

        if file_ext in [".html", ".htm"]:
            doc_item, chunks = parse_html_document(save_path)
            doc_item.scopes = scopes
            for c in chunks:
                c.scopes = scopes
        elif file_ext == ".pdf":
            doc_item, chunks = parse_pdf_document(save_path, scopes=scopes)
        else:
            content = save_path.read_text(encoding="utf-8", errors="ignore")
            doc_id = f"doc_{save_path.stem}"
            doc_item = DocumentItem(
                doc_id=doc_id,
                doc_title=save_path.stem.replace("_", " "),
                base_title=save_path.stem.replace("_", " "),
                file_name=file.filename,
                version=version,
                total_clauses=1,
                scopes=scopes,
                is_active=True,
            )
            chunks = [
                DocumentChunk(
                    id=f"{doc_id}_c1",
                    doc_id=doc_id,
                    doc_title=doc_item.doc_title,
                    file_name=file.filename,
                    version=version,
                    clause_title="General",
                    content=content,
                    scopes=scopes,
                    page_or_section="Página 1",
                    is_active=True,
                )
            ]

        vector_store.add_document(doc_item, chunks, compute_embeddings=True)
        return {
            "message": f"Documento '{file.filename}' indexado exitosamente.",
            "doc_id": doc_item.doc_id,
            "total_clauses": len(chunks),
            "scopes": scopes,
        }
    except Exception as e:
        logger.error(f"Error procesando documento subido: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar el archivo: {str(e)}",
        )


@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    """Elimina un documento y todas sus cláusulas del almacén vectorial."""
    if doc_id in vector_store.documents:
        del vector_store.documents[doc_id]
        vector_store.chunks = [c for c in vector_store.chunks if c.doc_id != doc_id]
        vector_store.update_active_versions()
        vector_store.save_store()
        return {"message": f"Documento {doc_id} eliminado exitosamente."}
    raise HTTPException(status_code=404, detail="Documento no encontrado.")
