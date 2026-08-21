import React from "react";
import { Search, X, Shield, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Barra de búsqueda inteligente con soporte de lenguaje natural, micro-interacciones y filtro de vigencia.
 */
export default function SearchBar({
  query,
  setQuery,
  onSearch,
  loading,
  activeVersionsOnly,
  setActiveVersionsOnly,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <motion.div
      className="search-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <div className="search-icon-box">
            <Search className="search-input-icon" size={22} />
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Ej. ¿Cuántos días de permiso tengo por mudanza o cuál es el plazo para legalizar viáticos?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            aria-label="Consulta en lenguaje natural sobre normativas y políticas corporativas"
          />

          <AnimatePresence>
            {query && !loading && (
              <motion.button
                type="button"
                className="search-clear-btn"
                onClick={handleClear}
                title="Borrar consulta"
                aria-label="Borrar texto de búsqueda"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="btn btn-primary search-submit-btn"
            disabled={loading || !query.trim()}
            aria-label="Buscar"
            whileHover={!loading && query.trim() ? { scale: 1.03 } : {}}
            whileTap={!loading && query.trim() ? { scale: 0.96 } : {}}
          >
            {loading ? (
              <>
                <span className="spinner-sm"></span>
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <span>Buscar</span>
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>

        <div className="search-controls">
          <label className="version-toggle">
            <input
              type="checkbox"
              checked={activeVersionsOnly}
              onChange={(e) => setActiveVersionsOnly(e.target.checked)}
              className="custom-checkbox"
            />
            <span className="toggle-label-text">
              Consultar únicamente normativas vigentes <strong className="toggle-highlight">(última versión)</strong>
            </span>
          </label>

          <div className="privacy-badge-hint">
            <Shield size={14} className="privacy-hint-icon" />
            <span>Consultas protegidas por filtros institucionales de privacidad</span>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
