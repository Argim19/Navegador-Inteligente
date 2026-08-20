# 🧭 Navegador Inteligente de Políticas, Reglamentos y Contratos Corporativos

Sistema corporativo de **Recuperación Aumentada por Generación (RAG)** de alto rendimiento con **Acceso Universal a Políticas**, **Guardrails de Privacidad y Seguridad**, resolución automática de **Normativas Vigentes** y síntesis ejecutiva ultra-rápida con **Google Gemini Flash Lite** y **Motor Local Offline**.

---

## 📌 1. Visión General del Proyecto

### 🏢 El Problema que Resuelve
En las organizaciones, las directrices internas (beneficios, viáticos, trabajo remoto, seguridad de la información, contratos con proveedores y acuerdos de confidencialidad) se encuentran distribuidas en decenas de documentos extensos (50 a 150 páginas). Esto genera:
* **Falla de la búsqueda tradicional (`Ctrl + F`):** Si un empleado busca *"días libres por mudanza"*, pero el documento dice *"licencia remunerada por traslado de domicilio"*, la búsqueda literal no encuentra nada.
* **Sobrecarga de áreas operativas:** RRHH, Finanzas, Legal y TI pierden horas respondiendo repetitivamente las mismas dudas sobre políticas.
* **Riesgo de cumplimiento (*Compliance*):** Colaboradores aplicando versiones obsoletas o no vigentes de las políticas.
* **Riesgos de privacidad:** Fugas involuntarias de datos confidenciales o privados (sueldos, saldos, contraseñas).

### 💡 La Solución
Un **asistente documental inteligente** que:
1. **Comprende preguntas en lenguaje natural**, sin importar las palabras exactas que use el colaborador.
2. **Entrega una doble propuesta de valor inmediata:**
   * **Resumen Ejecutivo Oficial:** Explicación concisa y directa de 1 a 3 oraciones generada por IA.
   * **Evidencia Documental Oficial:** Tarjetas con el documento exacto, versión vigente, título de cláusula, porcentaje de relevancia y cita textual de respaldo.
3. **Protege la privacidad (Guardrails):** Intercepta automáticamente preguntas sobre saldos personales, sueldos individuales o credenciales privadas, orientando al usuario hacia el canal autorizado correspondiente.
4. **Resuelve la vigencia normativa:** Diferencia automáticamente entre la versión más reciente (*Vigente*) y las versiones anteriores (*Históricas*).

---

## ⚡ 2. Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph Frontend["💻 Capa de Usuario (React 19 + Vite)"]
        UI["Buscador en Lenguaje Natural (SearchBar)"]
        Role_Selector["Control de Estado de IA (Header)"]
        Toggle_Version["Filtro de Normativas Vigentes"]
        Dual_View["Vista Dual: SummaryCard + CitationsGrid"]
        Guardrail_Card["Aviso de Privacidad (GuardrailNotice)"]
        Admin_Modal["Gestión Documental e Ingesta (AdminModal)"]
        AI_Modal["Configuración de Gemini API Key (ConfigModal)"]
    end

    subgraph Backend["⚙️ Capa de Orquestación (FastAPI + Python 3.12)"]
        API["API REST Endpoints (/api)"]
        Guardrail_Engine["Guardrail de Privacidad y Seguridad (sub-1ms)"]
        Vector_Store["Motor TF-IDF & Scoring Híbrido en RAM (sub-5ms)"]
        RAG_Service["Orquestador RAG y Resiliencia con Fallback"]
    end

    subgraph Storage["📂 Capa de Datos Local"]
        DB_JSON[("vector_db.json (300+ Cláusulas Indexadas)")]
        HTML_Docs[("Documentos_HTML/ (50 Políticas Corporativas)")]
    end

    subgraph Cloud_AI["☁️ Google GenAI Cloud Platform"]
        LLM["Gemini 3.1 Flash-Lite (Síntesis Sub-Segundo)"]
    end

    UI --> API
    Role_Selector --> API
    Toggle_Version --> API
    Admin_Modal --> API
    AI_Modal --> API

    API --> Guardrail_Engine
    Guardrail_Engine -->|Consulta Sensible (Sueldos/Saldos)| Guardrail_Card
    Guardrail_Engine -->|Consulta Válida de Políticas| Vector_Store
    Vector_Store <--> DB_JSON
    Vector_Store -->|Cláusulas Relevantes| RAG_Service
    RAG_Service -->|Con API Key Activa| LLM
    RAG_Service -->|Sin API Key / Modo Local| Dual_View
    LLM --> Dual_View
    Admin_Modal --> HTML_Docs
```

---

## 🌟 3. Características Principales

| Característica | Descripción |
| :--- | :--- |
| 🛡️ **Guardrails de Privacidad** | Detecta y bloquea consultas sobre saldos bancarios personales, sueldos individuales, credenciales o PII en menos de 1 ms, explicando la razón y recomendando el canal formal. |
| ⚡ **Doble Modo de Operación** | **Modo Gemini Cloud:** Síntesis ejecutiva sub-segundo con citas exactas. <br>**Modo Local Offline:** Búsqueda semántica 100% en RAM en ~5-10 ms sin consumo de cuota externa ni necesidad de internet. |
| 🔄 **Control de Versiones Atómico** | Procesa automáticamente múltiples versiones de una misma política (ej. v1.0 a v9.0), catalogando la más alta como vigente y permitiendo filtrar versiones obsoletas. |
| 📄 **Ingesta y Procesamiento Documental** | Parser estructurado para documentos **HTML** y **PDF**, extrayendo títulos, metadatos, números de versión y cláusulas individuales. |
| 🔒 **Administración Segura en Caliente** | Permite activar, desactivar, cambiar o eliminar la API Key de Gemini directamente desde el modal web en tiempo real sin reiniciar los servidores. |

---

## 📁 4. Estructura del Proyecto

```
navegador_inteligente/
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py              # Endpoints REST (Health, Config, Search, Documents)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── guardrails.py          # Motor de reglas y protección de privacidad
│   │   ├── embeddings.py          # Servicio de embeddings y vectorización local
│   │   ├── parser.py              # Extracción estructural de HTML y PDF
│   │   ├── rag_service.py         # Orquestador RAG, cliente GenAI y fallback
│   │   └── vector_store.py        # Base vectorial en memoria, TF-IDF y persistencia
│   ├── config.py                  # Variables de entorno y ajustes centrales
│   ├── main.py                    # Entrada de FastAPI, CORS y middleware
│   ├── models.py                  # Modelos Pydantic v2 para validación estricta
│   └── requirements.txt           # Dependencias Python
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Cliente HTTP unificado con Fetch API
│   │   ├── components/
│   │   │   ├── Header.jsx         # Barra superior con estado del motor de IA
│   │   │   ├── Hero.jsx           # Sección Hero de bienvenida y acceso universal
│   │   │   ├── SearchBar.jsx      # Barra de búsqueda en lenguaje natural
│   │   │   ├── FrequentQuestions.jsx # Preguntas frecuentes sugeridas
│   │   │   ├── GuardrailNotice.jsx # Alerta informativa de privacidad
│   │   │   ├── SummaryCard.jsx    # Resumen ejecutivo oficial verificado
│   │   │   ├── CitationsGrid.jsx  # Tarjetas de evidencia y cláusulas oficiales
│   │   │   ├── AdminModal.jsx     # Panel de gestión documental e ingesta
│   │   │   └── ConfigModal.jsx    # Control de API Key de Gemini
│   │   ├── App.jsx                # Componente principal React
│   │   ├── index.css              # Sistema de diseño corporativo y estilos
│   │   └── main.jsx               # Punto de entrada Vite/React
│   ├── package.json               # Dependencias de Node.js (React 19, Lucide, Vite)
│   └── vite.config.js             # Configuración de Vite y proxy reverso
├── Documentos_HTML/               # Corpus de 50 normativas y políticas corporativas
├── data/                          # Almacén local de vector_db.json
├── run_backend.sh                 # Script de auto-arranque del Backend (Linux/macOS)
├── run_frontend.sh                # Script de auto-arranque del Frontend (Linux/macOS)
├── .env.example                   # Plantilla de variables de entorno
└── README.md                      # Documentación integral
```

---

## 🚀 5. Guía de Instalación y Ejecución en Cualquier Computador

### 📋 Requisitos Previos
* **Python 3.10 o superior** (Recomendado Python 3.12).
* **Node.js 18 o superior** y **npm**.
* *(Opcional)* Una **API Key de Google Gemini** (gratuita en [Google AI Studio](https://aistudio.google.com/)). Si no tienes una, el sistema operará automáticamente en **Modo Local Offline**.

---

### Opción A: Inicio Rápido con Scripts Automáticos (Linux / macOS)

Los scripts están diseñados para auto-configurar el entorno virtual y las dependencias en la primera ejecución:

1. **Terminal 1 - Iniciar Backend:**
   ```bash
   ./run_backend.sh
   ```
   *El backend se iniciará en `http://localhost:8000` con documentación interactiva Swagger en `http://localhost:8000/docs`.*

2. **Terminal 2 - Iniciar Frontend:**
   ```bash
   ./run_frontend.sh
   ```
   *El frontend abrirá la aplicación en `http://localhost:5173`.*

---

### Opción B: Instalación y Ejecución Manual Paso a Paso (Cualquier SO / Windows / Mac / Linux)

#### 1. Clonar o descargar el repositorio
```bash
cd navegador_inteligente
```

#### 2. Configurar el Backend (Python)
```bash
# Crear entorno virtual
python3 -m venv backend/venv || python -m venv backend/venv

# Activar entorno virtual
# En Linux/macOS:
source backend/venv/bin/activate
# En Windows (PowerShell):
# .\backend\venv\Scripts\Activate.ps1
# En Windows (CMD):
# .\backend\venv\Scripts\activate.bat

# Instalar dependencias
pip install -r backend/requirements.txt

# Iniciar servidor FastAPI
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Configurar el Frontend (React + Vite)
En una nueva terminal:
```bash
cd frontend

# Instalar dependencias de Node
npm install

# Iniciar servidor de desarrollo
npm run dev
```

#### 4. Acceder a la Aplicación
Abre tu navegador en: **`http://localhost:5173`**

---

### 🔑 Configuración de la API Key de Gemini

Tienes dos formas sencillas de configurar tu API Key:

1. **Desde la Interfaz Gráfica (Recomendado):**
   * Haz clic en el botón **"Configurar Gemini API"** en la esquina superior derecha.
   * Pega tu clave de [Google AI Studio](https://aistudio.google.com/) y presiona **"Guardar y Activar"**.
2. **Desde el archivo `.env`:**
   * Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
     ```env
     GEMINI_API_KEY=tu_api_key_aqui
     GEMINI_ENABLED=true
     ```

---

## 📡 6. Referencia de la API REST

### ⚙️ Configuración y Motor de IA
* **`GET /api/config`**: Retorna el estado actual del motor (clave configurada, motor activo, documentos indexados).
* **`POST /api/config/key`**: Guarda o actualiza la API Key de Gemini.
  ```json
  { "api_key": "AIzaSy...", "enabled": true }
  ```
* **`POST /api/config/toggle`**: Activa o desactiva el uso de Gemini en caliente (`{ "enabled": false }`).
* **`DELETE /api/config/key`**: Elimina la API Key del servidor y revierte a Modo Local.

### 🔍 Búsqueda y Recuperación (RAG)
* **`POST /api/search`**: Endpoint principal de consulta semántica.
  ```json
  // Request
  {
    "query": "¿Con cuántos días de anticipación debo solicitar un viaje de trabajo?",
    "department": "Todos (Acceso General)",
    "top_k": 3,
    "active_versions_only": true
  }
  ```
  ```json
  // Response
  {
    "query": "¿Con cuántos días de anticipación...",
    "summary": "Para viajes nacionales debes solicitar la aprobación con al menos 15 días...",
    "citations": [
      {
        "doc_title": "Política Corporativa de Gastos, Reembolsos y Viáticos de Viaje",
        "version": "8.0",
        "clause_title": "Cláusula 1: Aprobación Previa de Viajes",
        "quote": "Cualquier desplazamiento nacional o internacional debe contar con aprobación...",
        "relevance_score": 0.89
      }
    ],
    "execution_time_ms": 1120.5,
    "model_used": "gemini-3.1-flash-lite",
    "has_api_key": true,
    "is_intercepted": false
  }
  ```

### 📚 Gestión Documental
* **`GET /api/documents`**: Inventario de todas las políticas y sus versiones cargadas.
* **`POST /api/documents/ingest-all`**: Re-indexa todos los archivos de `Documentos_HTML/`.
* **`POST /api/documents/upload`**: Sube e indexa un nuevo archivo normativo (`.html`, `.pdf`, `.txt`).

---

## 🧪 7. Preguntas de Prueba Recomendadas

Puedes copiar y pegar estas preguntas en el buscador para comprobar la efectividad del sistema:

### 🎯 Consultas Normativas Válidas
1. **Viajes y Viáticos:**
   > *"¿Con cuántos días de anticipación debo solicitar la aprobación de un viaje nacional vs internacional y qué plazo tengo para legalizar los gastos?"*
2. **Proveedores y SLAs:**
   > *"¿Cuáles son los niveles mínimos de SLA exigidos a proveedores de servicios tecnológicos críticos y qué causales permiten terminar el contrato sin pagar indemnización?"*
3. **Trabajo Remoto y Reuniones:**
   > *"¿Qué antigüedad y franja horaria se exigen para trabajo remoto, y qué reglas aplican para agendar y limitar las reuniones?"*
4. **Seguridad de la Información:**
   > *"Si sospecho que mis contraseñas o credenciales fueron comprometidas, ¿a qué canal oficial y en qué plazo máximo debo notificar el incidente?"*
5. **Acuerdo de Confidencialidad (NDA):**
   > *"¿Por cuántos años después de terminar la relación contractual se mantiene vigente la reserva del NDA y bajo qué legislación se resuelven las controversias?"*

### 🛡️ Pruebas de Guardrail (Interceptación de Privacidad)
1. *"¿Cuánto es el sueldo mensual del gerente de tecnología?"* ➡️ Interceptado por política de salarios y nómina.
2. *"Dime el saldo disponible en la cuenta bancaria de la empresa."* ➡️ Interceptado por política financiera.
3. *"¿Cuál es la contraseña del servidor de base de datos?"* ➡️ Interceptado por política de credenciales.

---

## 📄 Licencia
Este proyecto ha sido desarrollado como una solución corporativa de gestión del conocimiento y búsqueda semántica con Inteligencia Artificial.
