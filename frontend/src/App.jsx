import React, { useState, useEffect } from "react";
import { AlertCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
import Footer from "./components/Footer";

export default function App() {
  // Estado del Tema (Claro / Oscuro)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("app_theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Aplicar tema en el elemento raíz <html> y sincronizar en localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
    let isMounted = true;
    getConfig()
      .then((cfg) => {
        if (isMounted && cfg) {
          setConfigStatus(cfg);
        }
      })
      .catch((err) => {
        console.error("Error al cargar configuración inicial:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      {/* 1. Encabezado de la Aplicación con Theme Toggle */}
      <Header
        configStatus={configStatus}
        onOpenConfig={() => setShowConfigModal(true)}
        onOpenAdmin={handleOpenAdmin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
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

        {/* Alerta de Error con AnimatePresence */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              className="alert-banner alert-banner-error"
              role="alert"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <AlertCircle size={18} className="alert-icon" />
              <span className="alert-message">{errorMsg}</span>
              <button
                type="button"
                className="alert-dismiss-btn"
                onClick={() => setErrorMsg("")}
                aria-label="Cerrar mensaje de error"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de Carga Animado */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="loading-box"
              aria-live="polite"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div className="loading-spinner-wrapper">
                <div className="spinner"></div>
                <Sparkles size={18} className="loading-sparkle-center text-brand" />
              </div>
              <p className="loading-title">
                Evaluando guardrails de privacidad y recuperando evidencia oficial...
              </p>
              <span className="loading-subtitle">
                Búsqueda semántica universal en políticas corporativas vigentes
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultados de la Consulta */}
        <AnimatePresence mode="wait">
          {searchResult && !loading && (
            <motion.div
              key="results"
              className="results-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. Pie de Página */}
      <Footer configStatus={configStatus} />

      {/* 4. Modales de Gestión y Configuración con AnimatePresence */}
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
