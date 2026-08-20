import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

// Servicios de API
import {
  getConfig,
  getDocuments,
  searchPolicies,
} from "./api/client";

// Componentes Modulares
import Header from "./components/Header";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import FrequentQuestions from "./components/FrequentQuestions";
import GuardrailNotice from "./components/GuardrailNotice";
import SummaryCard from "./components/SummaryCard";
import CitationsGrid from "./components/CitationsGrid";
import AdminModal from "./components/AdminModal";
import ConfigModal from "./components/ConfigModal";

export default function App() {
  // Estado de Búsqueda y Parámetros
  const [query, setQuery] = useState("");
  const [activeVersionsOnly, setActiveVersionsOnly] = useState(true);

  // Estado de Respuesta y Carga
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Estado de Modales
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Estado del Sistema y Documentos
  const [configStatus, setConfigStatus] = useState({
    has_gemini_api_key: false,
    is_active: false,
    total_indexed_chunks: 0,
    total_documents: 0,
  });
  const [documentsList, setDocumentsList] = useState([]);

  // Carga inicial de configuración del sistema
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const cfg = await getConfig();
      setConfigStatus(cfg);
    } catch (err) {
      console.error("Error al cargar configuración inicial:", err);
    }
  };

  const handleRefreshSystem = async () => {
    try {
      const [cfg, docs] = await Promise.all([getConfig(), getDocuments()]);
      setConfigStatus(cfg);
      setDocumentsList(docs);
    } catch (err) {
      console.error("Error actualizando estado del sistema:", err);
    }
  };

  const handleOpenAdmin = async () => {
    setShowAdminModal(true);
    try {
      const docs = await getDocuments();
      setDocumentsList(docs);
    } catch (err) {
      console.error("Error al cargar documentos para administración:", err);
    }
  };

  // Ejecución de Búsqueda Semántica Universal
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim() || loading) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await searchPolicies({
        query: searchQuery,
        topK: 3,
        activeVersionsOnly,
      });
      setSearchResult(data);
    } catch (err) {
      setErrorMsg(err.message || "Ocurrió un error al procesar la consulta.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (promptText) => {
    setQuery(promptText);
    handleSearch(promptText);
  };

  return (
    <div className="app-layout">
      {/* 1. Encabezado de la Aplicación */}
      <Header
        configStatus={configStatus}
        onOpenConfig={() => setShowConfigModal(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 2. Contenido Principal */}
      <main className="main-container">
        {/* Hero explicativo */}
        <Hero />

        {/* Barra de Búsqueda */}
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          loading={loading}
          activeVersionsOnly={activeVersionsOnly}
          setActiveVersionsOnly={setActiveVersionsOnly}
        />

        {/* Preguntas Frecuentes y Ejemplos Cross-Área */}
        <FrequentQuestions onSelectPrompt={handlePromptClick} />

        {/* Alerta de Error */}
        {errorMsg && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #f87171",
              color: "#991b1b",
              padding: "1rem",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Indicador de Carga */}
        {loading && (
          <div className="loading-box">
            <div className="spinner"></div>
            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              Evaluando guardrails de privacidad y recuperando evidencia oficial...
            </p>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Búsqueda semántica universal en políticas corporativas vigentes
            </span>
          </div>
        )}

        {/* Resultados de la Consulta */}
        {searchResult && !loading && (
          <div className="results-container">
            {/* Si la consulta fue interceptada por un guardrail de privacidad */}
            {searchResult.is_intercepted && searchResult.guardrail_notice ? (
              <GuardrailNotice
                notice={searchResult.guardrail_notice}
                latency={searchResult.execution_time_ms}
              />
            ) : (
              <>
                {/* Caja 1: Resumen Ejecutivo Generado por IA o Modo Local */}
                <SummaryCard
                  summary={searchResult.summary}
                  executionTimeMs={searchResult.execution_time_ms}
                  modelUsed={searchResult.model_used}
                  totalCandidates={searchResult.total_candidates}
                />

                {/* Caja 2: Evidencia Oficial y Citas de Respaldo */}
                <CitationsGrid citations={searchResult.citations} />
              </>
            )}
          </div>
        )}
      </main>

      {/* 3. Modales de Gestión y Configuración */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        configStatus={configStatus}
        documentsList={documentsList}
        onRefresh={handleRefreshSystem}
      />

      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        configStatus={configStatus}
        onRefresh={handleRefreshSystem}
      />
    </div>
  );
}
