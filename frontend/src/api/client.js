/**
 * Cliente API para el Navegador Inteligente.
 * Centraliza todas las llamadas HTTP al backend FastAPI.
 */

const API_BASE = "/api";

/**
 * Obtiene la lista de departamentos y perfiles organizacionales.
 */
export async function getDepartments() {
  const res = await fetch(`${API_BASE}/departments`);
  if (!res.ok) throw new Error("Error al obtener la lista de áreas.");
  return res.json();
}

/**
 * Obtiene el estado de configuración del motor de IA y almacenamiento.
 */
export async function getConfig() {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error("Error al obtener la configuración del sistema.");
  return res.json();
}

/**
 * Guarda o actualiza la Google Gemini API Key.
 */
export async function updateApiKey(apiKey, enabled = true) {
  const res = await fetch(`${API_BASE}/config/key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, enabled }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error al actualizar la API Key.");
  }
  return res.json();
}

/**
 * Activa o desactiva dinámicamente el uso de Gemini API.
 */
export async function toggleApiKey(enabled) {
  const res = await fetch(`${API_BASE}/config/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error al cambiar el estado del motor de IA.");
  }
  return res.json();
}

/**
 * Elimina la API Key y revierte a Modo Local.
 */
export async function deleteApiKey() {
  const res = await fetch(`${API_BASE}/config/key`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar la API Key.");
  return res.json();
}

/**
 * Ejecuta una consulta RAG en lenguaje natural.
 */
export async function searchPolicies({
  query,
  department = "Todos (Acceso General)",
  topK = 3,
  activeVersionsOnly = true,
}) {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      department,
      top_k: topK,
      active_versions_only: activeVersionsOnly,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error al procesar la consulta.");
  }
  return res.json();
}

/**
 * Obtiene el inventario de todos los documentos y versiones indexadas.
 */
export async function getDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error("Error al obtener la lista de documentos.");
  return res.json();
}

/**
 * Re-escanea e indexa los archivos de Documentos_HTML.
 */
export async function reindexAllDocuments() {
  const res = await fetch(`${API_BASE}/documents/ingest-all`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error al indexar documentos.");
  }
  return res.json();
}

/**
 * Sube y registra un nuevo archivo documental (HTML o PDF).
 */
export async function uploadDocument(formData) {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error al subir el archivo.");
  }
  return res.json();
}
