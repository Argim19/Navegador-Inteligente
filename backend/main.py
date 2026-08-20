import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.api.routes import router, ingest_all_documents
from backend.services.vector_store import vector_store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Check if documents are already indexed
    logger.info("Iniciando Navegador Inteligente Backend...")
    if len(vector_store.chunks) == 0:
        logger.info("Base vectorial vacía. Ejecutando indexación inicial de Documentos_HTML...")
        try:
            stats = ingest_all_documents()
            logger.info(f"Indexación inicial completada: {stats.total_chunks} fragmentos indexados de {stats.total_files} archivos.")
        except Exception as e:
            logger.warning(f"No se pudo completar la indexación automática en inicio: {e}")
    else:
        logger.info(f"Base vectorial cargada con {len(vector_store.chunks)} fragmentos y {len(vector_store.documents)} documentos.")
    
    yield
    logger.info("Apagando Navegador Inteligente Backend.")

app = FastAPI(
    title="Navegador Inteligente de Políticas y Contratos API",
    description="Motor RAG Empresarial con Búsqueda Semántica, Verificación de Evidencia y Control de Acceso RBAC.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
