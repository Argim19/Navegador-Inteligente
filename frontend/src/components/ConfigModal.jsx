import React, { useState } from "react";
import { Key, X, Power, Trash2, Sparkles, Eye, EyeOff, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { updateApiKey, toggleApiKey, deleteApiKey } from "../api/client";

/**
 * Modal para la gestión de API Key de Google Gemini con animaciones y micro-interacciones.
 */
export default function ConfigModal({
  isOpen,
  onClose,
  configStatus,
  onRefresh,
}) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      await updateApiKey(apiKeyInput.trim(), true);
      setApiKeyInput("");
      setFeedback({
        type: "success",
        message: "¡API Key configurada y activada correctamente!",
      });
      await onRefresh();
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1200);
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Error al guardar: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (enabled) => {
    setLoading(true);
    setFeedback(null);
    try {
      await toggleApiKey(enabled);
      await onRefresh();
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Error al cambiar estado: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar la API Key del servidor?")) return;
    setLoading(true);
    setFeedback(null);
    try {
      await deleteApiKey();
      setApiKeyInput("");
      setFeedback({
        type: "success",
        message: "API Key eliminada. El sistema operará en Modo Local.",
      });
      await onRefresh();
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Error al eliminar: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-content config-modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            {/* Encabezado */}
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon-box">
                  <Key size={20} />
                </div>
                <div>
                  <h3>Control de Inteligencia Artificial</h3>
                  <p className="modal-title-sub">Google Gemini API & Motor Semántico</p>
                </div>
              </div>
              <motion.button
                className="btn-close-icon"
                onClick={onClose}
                aria-label="Cerrar modal"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="modal-body">
              {/* Tarjeta de Estado del Motor */}
              <div
                className={`engine-status-card ${
                  configStatus.is_active
                    ? "engine-active"
                    : configStatus.has_gemini_api_key
                    ? "engine-standby"
                    : "engine-none"
                }`}
              >
                <div className="engine-status-header">
                  <div className="engine-status-badge-row">
                    <span className="engine-status-dot"></span>
                    <strong className="engine-status-title">
                      {configStatus.is_active
                        ? "Gemini 3.6 Flash Activo"
                        : configStatus.has_gemini_api_key
                        ? "Gemini Desactivado (Modo Local)"
                        : "Sin API Key (Modo Local Automático)"}
                    </strong>
                  </div>

                  <div className="engine-status-desc">
                    {configStatus.is_active
                      ? "Síntesis ejecutiva en lenguaje natural con Gemini 3.6 Flash y citas de respaldo de alta fidelidad."
                      : configStatus.has_gemini_api_key
                      ? "Operando en Modo Local ultra rápido sin consumo de cuota externa."
                      : "Operando en Modo Local. Ingresa una API Key para habilitar la síntesis con Google Gemini."}
                  </div>
                </div>

                {/* Botones de Acción en Caliente */}
                {configStatus.has_gemini_api_key && (
                  <div className="engine-actions-row">
                    {configStatus.is_active ? (
                      <motion.button
                        type="button"
                        className="btn btn-secondary btn-sm toggle-deactivate-btn"
                        onClick={() => handleToggle(false)}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Power size={14} />
                        <span>Pausar Gemini (Usar Modo Local)</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        className="btn btn-primary btn-sm toggle-activate-btn"
                        onClick={() => handleToggle(true)}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Power size={14} />
                        <span>Activar Gemini Flash</span>
                      </motion.button>
                    )}

                    <motion.button
                      type="button"
                      className="btn btn-secondary btn-sm delete-key-btn"
                      onClick={handleDelete}
                      title="Eliminar API Key del servidor"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Trash2 size={13} />
                      <span>Eliminar Key</span>
                    </motion.button>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className={`alert-banner ${feedback.type === "error" ? "alert-banner-error" : "alert-banner-success"}`}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feedback.type === "error" ? (
                      <AlertCircle size={16} className="alert-icon" />
                    ) : (
                      <CheckCircle size={16} className="alert-icon" />
                    )}
                    <span>{feedback.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulario de Entrada de API Key */}
              <form onSubmit={handleSave} className="api-key-form">
                <p className="form-description">
                  {configStatus.has_gemini_api_key
                    ? "¿Deseas actualizar o cambiar tu Google Gemini API Key?"
                    : "Ingresa tu API Key de Google AI Studio para habilitar la síntesis en lenguaje natural:"}
                </p>

                <div className="form-group">
                  <label className="form-label">Google Gemini API Key:</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input password-input"
                      placeholder="AIzaSy..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      autoComplete="new-password"
                    />
                    <motion.button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Ocultar clave" : "Mostrar clave"}
                      aria-label={showPassword ? "Ocultar clave" : "Mostrar clave"}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </motion.button>
                  </div>
                </div>

                <div className="api-key-help-box">
                  <Sparkles size={14} className="help-icon" />
                  <span>
                    Puedes obtener una clave gratuita en{" "}
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-link"
                    >
                      Google AI Studio <ExternalLink size={11} className="inline-icon" />
                    </a>
                  </span>
                </div>

                <div className="modal-actions-right">
                  <motion.button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!apiKeyInput.trim() || loading}
                    whileHover={apiKeyInput.trim() && !loading ? { scale: 1.03 } : {}}
                    whileTap={apiKeyInput.trim() && !loading ? { scale: 0.97 } : {}}
                  >
                    {loading ? "Guardando..." : "Guardar y Activar"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
