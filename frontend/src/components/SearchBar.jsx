import React from "react";
import { Search } from "lucide-react";

/**
 * Barra de búsqueda con soporte para lenguaje natural y selector de normativas vigentes.
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

  return (
    <div className="search-card">
      <form onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search className="search-input-icon" size={22} />
          <input
            type="text"
            className="search-input"
            placeholder="Ej. ¿Cuántos días de permiso tengo por mudanza o cuál es el plazo para legalizar viáticos?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !query.trim()}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        <div className="search-controls">
          <label className="version-toggle">
            <input
              type="checkbox"
              checked={activeVersionsOnly}
              onChange={(e) => setActiveVersionsOnly(e.target.checked)}
            />
            <span>Consultar únicamente normativas vigentes (última versión)</span>
          </label>

          <span className="text-muted" style={{ fontSize: "0.78rem" }}>
            🔒 Consultas protegidas por filtros de privacidad institucional
          </span>
        </div>
      </form>
    </div>
  );
}
