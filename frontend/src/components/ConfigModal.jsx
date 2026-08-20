import React, { useState } from "react";
import { Key, X, Power, Trash2, Sparkles } from "lucide-react";
import { updateApiKey, toggleApiKey, deleteApiKey } from "../api/client";

/**
 * Modal para la gestión de API Key de Google Gemini y control del motor de IA.
 */
export default function ConfigModal({ isOpen, onClose, configStatus, onRefresh }) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setLoading(true);
    setFeedback("");
    try {
      await updateApiKey(apiKeyInput.trim(), true);
      setApiKeyInput("");
      setFeedback("¡API Key configurada y activada correctamente!");
      await onRefresh();
      setTimeout(() => {
        onClose();
        setFeedback("");
      }, 1000);
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (enabled) => {
    setLoading(true);
    try {
      await toggleApiKey(enabled);
      await onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar la API Key del servidor?")) return;
    setLoading(true);
    try {
      await deleteApiKey();
      setApiKeyInput("");
      await onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header">
          <div className="modal-title">
            <Key size={20} color="var(--brand-primary)" />
            Control de Inteligencia Artificial (Gemini API)
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tarjeta de Estado del Motor */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: configStatus.is_active
                ? "#bae6fd"
                : configStatus.has_gemini_api_key
                  ? "#fde68a"
                  : "var(--border-color)",
              background: configStatus.is_active
                ? "#f0f9ff"
                : configStatus.has_gemini_api_key
                  ? "#fffbeb"
                  : "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: configStatus.is_active
                    ? "#0369a1"
                    : configStatus.has_gemini_api_key
                      ? "#b45309"
                      : "#475569",
                }}
              >
                Estado Actual del Motor:
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                {configStatus.is_active
                  ? "🟢 Gemini Flash ACTIVO (Síntesis ejecutiva en la nube sub-segundo y citas precisas)."
                  : configStatus.has_gemini_api_key
                    ? "🟡 DESACTIVADO (Operando en Modo Local rápido sin consumo de cuota externa)."
                    : "⚪ SIN API KEY (Operando en Modo Búsqueda Local automática)."}
              </div>
            </div>

            {/* Botones de Acción en Caliente */}
            {configStatus.has_gemini_api_key && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {configStatus.is_active ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ color: "#b45309", borderColor: "#fcd34d", background: "#fff" }}
                    onClick={() => handleToggle(false)}
                    disabled={loading}
                  >
                    <Power size={14} color="#b45309" />
                    Desactivar (Usar Modo Local)
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ background: "#0284c7" }}
                    onClick={() => handleToggle(true)}
                    disabled={loading}
                  >
                    <Power size={14} color="#fff" />
                    Activar (Gemini Flash)
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: "#dc2626", borderColor: "#fca5a5", background: "#fff" }}
                  onClick={handleDelete}
                  title="Eliminar API Key"
                  disabled={loading}
                >
                  <Trash2 size={13} color="#dc2626" />
                  Eliminar Key
                </button>
              </div>
            )}
          </div>

          {feedback && (
            <div
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: "6px",
                background: feedback.startsWith("Error") ? "#fee2e2" : "#ecfdf5",
                color: feedback.startsWith("Error") ? "#991b1b" : "#065f46",
                fontSize: "0.82rem",
                marginBottom: "1rem",
              }}
            >
              {feedback}
            </div>
          )}

          {/* Formulario de Entrada de API Key */}
          <form onSubmit={handleSave}>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              {configStatus.has_gemini_api_key
                ? "¿Deseas cambiar tu Google Gemini API Key por otra diferente?"
                : "Ingresa tu API Key de Google AI Studio para activar la síntesis en lenguaje natural con Gemini 3.6 Flash:"}
            </p>

            <div className="form-group">
              <label className="form-label">Google Gemini API Key:</label>
              <input
                type="password"
                className="form-input"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "1.25rem",
              }}
            >
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!apiKeyInput.trim() || loading}
              >
                {loading ? "Guardando..." : "Guardar y Activar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
