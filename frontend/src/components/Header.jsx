import React from "react";
import { BookOpen, Sparkles, Settings, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

/**
 * Encabezado corporativo superior con micro-interacciones de motion, estado de IA y switch animado.
 */
export default function Header({
  configStatus,
  onOpenConfig,
  onOpenAdmin,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === "dark";

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Identidad de Marca */}
        <motion.div
          className="brand-section"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="brand-icon"
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen size={22} />
          </motion.div>
          <div className="brand-info">
            <div className="brand-title-row">
              <h1>Navegador Inteligente</h1>
              <span className="brand-pill">Empresarial</span>
            </div>
            <p>Políticas, Reglamentos y Contratos Corporativos</p>
          </div>
        </motion.div>

        {/* Controles de Cabecera Distribuidos */}
        <motion.div
          className="header-actions"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Botón de Estado del Motor de IA */}
          <motion.button
            type="button"
            className={`btn btn-secondary btn-sm ai-status-btn ${
              configStatus.is_active
                ? "status-active"
                : configStatus.has_gemini_api_key
                ? "status-standby"
                : "status-none"
            }`}
            onClick={onOpenConfig}
            title="Configurar y Activar/Desactivar Gemini API"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="ai-status-indicator">
              <span className="ai-status-dot"></span>
              <Sparkles size={14} className="ai-sparkle-icon" />
            </span>
            <span className="ai-status-label">
              {configStatus.is_active
                ? "Gemini Flash (Activo)"
                : configStatus.has_gemini_api_key
                ? "Gemini (Modo Local)"
                : "Configurar Gemini API"}
            </span>
          </motion.button>

          {/* Botón de Gestión Documental */}
          <motion.button
            type="button"
            className="btn btn-primary btn-sm admin-btn"
            onClick={onOpenAdmin}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <Settings size={15} />
            <span>Gestión Documental</span>
          </motion.button>

          {/* Separador Visual */}
          <div className="header-divider"></div>

          {/* Switch Deslizante de Modo Claro / Oscuro con animación de Motion */}
          <div
            className="theme-switch-wrapper"
            title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            <Sun size={15} className={`theme-switch-icon sun ${!isDark ? "active" : ""}`} />
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              className={`theme-switch ${isDark ? "is-dark" : "is-light"}`}
              onClick={onToggleTheme}
            >
              <motion.span
                className="theme-switch-handle"
                layout
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
              >
                <motion.span
                  key={isDark ? "moon" : "sun"}
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`handle-icon ${isDark ? "moon" : "sun"}`}
                >
                  {isDark ? <Moon size={11} /> : <Sun size={11} />}
                </motion.span>
              </motion.span>
            </button>
            <Moon size={15} className={`theme-switch-icon moon ${isDark ? "active" : ""}`} />
          </div>
        </motion.div>
      </div>
    </header>
  );
}
