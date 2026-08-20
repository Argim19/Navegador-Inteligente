import React from "react";
import { BookOpen, Sparkles, Settings } from "lucide-react";

/**
 * Encabezado corporativo superior con estado de IA y acceso a administración.
 */
export default function Header({ configStatus, onOpenConfig, onOpenAdmin }) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Identidad de Marca */}
        <div className="brand-section">
          <div className="brand-icon">
            <BookOpen size={22} />
          </div>
          <div className="brand-info">
            <h1>Navegador Inteligente</h1>
            <p>Políticas, Reglamentos y Contratos Corporativos</p>
          </div>
        </div>

        {/* Controles de Cabecera */}
        <div className="header-actions">
          {/* Botón de Estado del Motor de IA */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenConfig}
            title="Configurar y Activar/Desactivar Gemini API"
            style={{
              borderColor: configStatus.is_active
                ? "#38bdf8"
                : configStatus.has_gemini_api_key
                  ? "#f59e0b"
                  : "var(--border-color)",
              background: configStatus.is_active
                ? "rgba(2, 132, 199, 0.08)"
                : configStatus.has_gemini_api_key
                  ? "rgba(245, 158, 11, 0.08)"
                  : "var(--bg-surface)",
            }}
          >
            <Sparkles
              size={14}
              color={
                configStatus.is_active
                  ? "#0284c7"
                  : configStatus.has_gemini_api_key
                    ? "#d97706"
                    : "#64748b"
              }
            />
            {configStatus.is_active
              ? "Gemini Flash (Activo)"
              : configStatus.has_gemini_api_key
                ? "Gemini Desactivado (Modo Local)"
                : "Configurar Gemini API"}
          </button>

          {/* Botón de Gestión Documental */}
          <button className="btn btn-primary btn-sm" onClick={onOpenAdmin}>
            <Settings size={14} />
            Gestión Documental
          </button>
        </div>
      </div>
    </header>
  );
}
