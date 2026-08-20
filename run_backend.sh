#!/bin/bash
echo "=== Iniciando Backend Navegador Inteligente (FastAPI) ==="

# Auto-crear entorno virtual si no existe en la máquina destino
if [ ! -d "backend/venv" ]; then
    echo "⚙️ Creando entorno virtual en backend/venv..."
    python3 -m venv backend/venv || python -m venv backend/venv
    echo "📦 Instalando dependencias en backend/requirements.txt..."
    backend/venv/bin/pip install --upgrade pip
    backend/venv/bin/pip install -r backend/requirements.txt
fi

source backend/venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
