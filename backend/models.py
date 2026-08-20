"""
Modelos y esquemas Pydantic v2 para el Navegador Inteligente.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DepartmentInfo(BaseModel):
    """Información del área organizacional / perfil de colaborador."""
    id: str = Field(description="Identificador del departamento")
    name: str = Field(description="Nombre legible del departamento")
    description: str = Field(default="", description="Descripción del rol o área")
    allowed_scopes: List[str] = Field(default_factory=list, description="Categorías de referencia del área")


class DocumentChunk(BaseModel):
    """Fragmento semántico individual correspondiente a una cláusula o sección."""
    id: str
    doc_id: str
    doc_title: str
    file_name: str
    version: str
    clause_title: str
    content: str
    scopes: List[str] = Field(default_factory=list)
    page_or_section: str = ""
    is_active: bool = True
    embedding: Optional[List[float]] = None


class DocumentItem(BaseModel):
    """Metadatos de un documento normativo o contrato en el sistema."""
    doc_id: str
    doc_title: str
    base_title: str
    file_name: str
    version: str
    total_clauses: int
    scopes: List[str]
    is_active: bool


class SearchRequest(BaseModel):
    """Petición de búsqueda semántica en el navegador inteligente."""
    query: str = Field(..., description="Pregunta en lenguaje natural del colaborador")
    department: str = Field(default="Todos (Acceso General)", description="Área o rol del colaborador")
    top_k: int = Field(default=3, ge=1, le=10, description="Número de citas de evidencia a retornar")
    active_versions_only: bool = Field(default=True, description="Filtrar únicamente normativas vigentes")


class Citation(BaseModel):
    """Cita textual y evidencia documental oficial de respaldo."""
    doc_id: str
    doc_title: str
    file_name: str
    version: str
    clause_title: str
    page_or_section: str
    quote: str
    relevance_score: float
    scopes: List[str]


class GuardrailNotice(BaseModel):
    """Detalles informativos cuando un guardrail de privacidad intercepta una consulta sensible."""
    is_intercepted: bool = True
    category: str
    title: str
    message: str
    suggestion: str


class SearchResponse(BaseModel):
    """Respuesta completa del motor RAG con resumen ejecutivo y evidencia."""
    query: str
    department: str
    summary: str
    citations: List[Citation] = Field(default_factory=list)
    total_candidates: int = 0
    execution_time_ms: float = 0.0
    model_used: str = ""
    has_api_key: bool = False
    is_intercepted: bool = False
    guardrail_notice: Optional[GuardrailNotice] = None


class IngestStats(BaseModel):
    """Estadísticas de indexación de documentos."""
    total_files: int
    total_chunks: int
    unique_policies: int
    latest_versions_count: int
    documents: List[DocumentItem]


class ConfigUpdateRequest(BaseModel):
    """Petición para configurar o cambiar la Gemini API Key."""
    api_key: str
    enabled: Optional[bool] = True


class ConfigToggleRequest(BaseModel):
    """Petición para activar o desactivar la API Key en caliente."""
    enabled: bool


class ConfigStatusResponse(BaseModel):
    """Estado actual del motor de IA y almacenamiento vectorial."""
    has_gemini_api_key: bool
    is_active: bool = True
    total_indexed_chunks: int
    total_documents: int
    departments: List[str]
