#!/bin/bash
echo "=== Iniciando Frontend Navegador Inteligente (React + Vite) ==="
cd frontend

# Auto-instalar node_modules si no existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js (npm install)..."
    npm install
fi

npm run dev
