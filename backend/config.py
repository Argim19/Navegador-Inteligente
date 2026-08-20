"""
Configuración central del Navegador Inteligente.
Gestiona variables de entorno, directorios de almacenamiento,
modelos de IA y perfiles organizacionales.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Directorios base del proyecto
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
DOCS_DIR = ROOT_DIR / "Documentos_HTML"

# Carga de variables de entorno con override para reflejar cambios en disco
load_dotenv(ROOT_DIR / ".env", override=True)
if (BACKEND_DIR / ".env").exists():
    load_dotenv(BACKEND_DIR / ".env", override=True)

# Asegurar existencia del directorio de datos
DATA_DIR.mkdir(exist_ok=True, parents=True)


class Settings:
    """Configuración unificada de la aplicación."""

    ROOT_DIR: Path = ROOT_DIR
    BACKEND_DIR: Path = BACKEND_DIR
    DATA_DIR: Path = DATA_DIR
    DOCS_DIR: Path = DOCS_DIR

    # Configuración de Google Gemini AI (Modelo ultrarrápido sub-segundo para síntesis ejecutiva)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_ENABLED: bool = (
        os.getenv("GEMINI_ENABLED", "true").lower() in ("true", "1", "yes")
    ) if os.getenv("GEMINI_API_KEY", "").strip() else False
    
    DEFAULT_EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    DEFAULT_LLM_MODEL: str = "gemini-3.1-flash-lite"

    # Archivos de persistencia local
    VECTOR_DB_FILE: Path = DATA_DIR / "vector_db.json"
    METADATA_FILE: Path = DATA_DIR / "metadata.json"

    # Perfiles organizacionales para contexto de consulta
    DEPARTMENTS_CONFIG = {
        "Todos (Acceso General)": {
            "name": "Cualquier Colaborador (Acceso Universal)",
            "description": "Consulta abierta a todas las políticas corporativas vigentes",
            "allowed_scopes": ["*"]
        }
    }

    # Clasificación temática de políticas base
    POLICY_SCOPE_MAPPING = {
        "Manual de Arquitectura Cloud, Estándares de Código y Despliegue Continuo": [
            "TI", "Cloud", "General"
        ],
        "Política de Seguridad de la Información y Gestión de Accesos": [
            "Seguridad", "TI", "General"
        ],
        "Política Corporativa de Gastos, Reembolsos y Viáticos de Viaje": [
            "Gastos", "Finanzas", "General"
        ],
        "Política de Trabajo Remoto, Horarios Flexibles y Desconexión Laboral": [
            "Trabajo Remoto", "RRHH", "General"
        ],
        "Acuerdo de Confidencialidad y No Divulgación de Secretos Empresariales (NDA)": [
            "NDA", "Legal", "General"
        ],
        "Términos y Condiciones de Contratación de Proveedores y Servicios Externos": [
            "Proveedores", "Legal", "Finanzas", "General"
        ]
    }


settings = Settings()


def set_gemini_api_key(key: str, enabled: bool = True) -> None:
    """Actualiza dinámicamente la API Key de Gemini en memoria y en el archivo .env."""
    key = (key or "").strip()
    settings.GEMINI_API_KEY = key
    settings.GEMINI_ENABLED = enabled and bool(key)
    
    if key:
        os.environ["GEMINI_API_KEY"] = key
    else:
        os.environ.pop("GEMINI_API_KEY", None)
        
    os.environ["GEMINI_ENABLED"] = "true" if settings.GEMINI_ENABLED else "false"
    
    env_path = ROOT_DIR / ".env"
    with open(env_path, "w", encoding="utf-8") as f:
        f.write(
            f"GEMINI_API_KEY={key}\n"
            f"GEMINI_ENABLED={'true' if settings.GEMINI_ENABLED else 'false'}\n"
        )


def set_gemini_enabled(enabled: bool) -> None:
    """Activa o desactiva dinámicamente el uso de la API Key en caliente."""
    has_key = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())
    settings.GEMINI_ENABLED = enabled and has_key
    os.environ["GEMINI_ENABLED"] = "true" if settings.GEMINI_ENABLED else "false"
    
    env_path = ROOT_DIR / ".env"
    with open(env_path, "w", encoding="utf-8") as f:
        f.write(
            f"GEMINI_API_KEY={settings.GEMINI_API_KEY}\n"
            f"GEMINI_ENABLED={'true' if settings.GEMINI_ENABLED else 'false'}\n"
        )
