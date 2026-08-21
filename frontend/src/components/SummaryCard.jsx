import React, { useState } from "react";
import { Sparkles, CheckCircle2, Copy, Check, Cpu, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Tarjeta de Resumen Ejecutivo generado por IA con animación de entrada y micro-interacciones de copiado.
 */
export default function SummaryCard({
  summary,
  executionTimeMs,
  modelUsed,
  totalCandidates,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <motion.div
      className="summary-card"
      initial={{ opacity: 0, y: 18, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="summary-header">
        <div className="summary-title">
          <div className="summary-title-icon-box">
            <Sparkles size={18} />
          </div>
          <div>
            <h3>Resumen Ejecutivo Oficial (IA)</h3>
            <span className="summary-title-sub">Síntesis generada a partir de evidencia documental</span>
          </div>
        </div>

        <div className="summary-meta">
          <span className="meta-pill verified" title="Corroborado con las fuentes documentales indexadas">
            <CheckCircle2 size={13} />
            <span>Evidencia Verificada</span>
          </span>

          <span className="meta-pill latency-pill" title="Tiempo total de respuesta del servidor">
            {executionTimeMs} ms
          </span>

          <motion.button
            type="button"
            className={`btn btn-secondary btn-sm copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
            title={copied ? "Copiado en el portapapeles" : "Copiar resumen al portapapeles"}
            aria-label="Copiar resumen"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Check size={14} className="text-emerald" />
                  <span>Copiado</span>
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Copy size={14} />
                  <span>Copiar</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div className="summary-body">
        {summary}
      </div>

      <div className="summary-footer">
        <div className="summary-footer-item">
          <Cpu size={14} className="summary-footer-icon" />
          <span>
            Motor: <strong className="highlight-text">{modelUsed || "Gemini Flash"}</strong>
          </span>
        </div>
        <div className="summary-footer-item">
          <Layers size={14} className="summary-footer-icon" />
          <span>
            Fragmentos normativos evaluados: <strong className="highlight-text">{totalCandidates || 0}</strong>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
