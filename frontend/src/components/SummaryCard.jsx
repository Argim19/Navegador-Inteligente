import React, { useState } from "react";
import { Sparkles, CheckCircle2, Copy, Check, Cpu } from "lucide-react";

/**
 * Tarjeta de Resumen Ejecutivo generado por IA con citas de respaldo.
 */
export default function SummaryCard({ summary, executionTimeMs, modelUsed, totalCandidates }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="summary-card">
      <div className="summary-header">
        <div className="summary-title">
          <Sparkles size={18} />
          Resumen Ejecutivo Oficial (IA)
        </div>
        <div className="summary-meta">
          <span className="meta-pill verified">
            <CheckCircle2 size={12} style={{ display: "inline", marginRight: "3px" }} />
            Verificado contra evidencia documental
          </span>
          <span className="meta-pill">{executionTimeMs} ms</span>
          <button className="btn btn-secondary btn-sm" onClick={handleCopy} title="Copiar resumen">
            {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="summary-body" style={{ whiteSpace: "pre-line" }}>
        {summary}
      </div>

      <div className="summary-footer">
        <span>
          Motor: <strong>{modelUsed}</strong>
        </span>
        <span>
          Fragmentos evaluados: <strong>{totalCandidates}</strong>
        </span>
      </div>
    </div>
  );
}
