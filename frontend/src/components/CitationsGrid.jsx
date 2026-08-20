import React from "react";
import { FileText, BookOpen } from "lucide-react";

/**
 * Cuadrícula de evidencia oficial y citas textuales de respaldo documental.
 */
export default function CitationsGrid({ citations }) {
  return (
    <div className="evidence-section">
      <div className="evidence-header">
        <div className="evidence-title">
          <FileText size={18} />
          Evidencia Oficial y Citas de Respaldo ({citations.length})
        </div>
        <span className="text-muted" style={{ fontSize: "0.8rem" }}>
          Trazabilidad verificable con documento, versión y cláusula original
        </span>
      </div>

      {citations.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "1.5rem",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          No se encontraron fragmentos normativos relevantes para los términos ingresados.
        </div>
      ) : (
        <div className="citations-grid">
          {citations.map((c, idx) => (
            <div key={idx} className="citation-card">
              <div className="citation-card-header">
                <div className="citation-doc-info">
                  <div className="citation-doc-title">
                    <BookOpen size={15} color="var(--brand-primary)" />
                    {c.doc_title}
                  </div>
                  <div className="citation-clause-title">
                    📌 {c.clause_title} {c.page_or_section ? `(${c.page_or_section})` : ""}
                  </div>
                </div>

                <div className="citation-badges">
                  <span
                    className="badge-match"
                    style={{
                      background:
                        idx === 0
                          ? "rgba(2, 132, 199, 0.12)"
                          : "rgba(100, 116, 139, 0.12)",
                      color: idx === 0 ? "#0284c7" : "#475569",
                      borderColor: idx === 0 ? "#bae6fd" : "#cbd5e1",
                      fontWeight: 600,
                    }}
                  >
                    {idx === 0 ? "⭐ Mayor Coincidencia" : "📑 Coincidencia Similar"}
                  </span>
                  <span className="badge-version">v{c.version}</span>
                  <span className="badge-match">
                    {Math.round(c.relevance_score * 100)}% Relevancia
                  </span>
                </div>
              </div>

              <blockquote className="citation-quote">"{c.quote}"</blockquote>

              <div className="citation-footer">
                <div className="citation-scopes">
                  {c.scopes.map((s, sIdx) => (
                    <span key={sIdx} className="scope-tag">
                      {s}
                    </span>
                  ))}
                </div>
                <span>
                  Archivo: <code>{c.file_name}</code>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
