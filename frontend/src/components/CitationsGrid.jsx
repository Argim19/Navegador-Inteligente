import React from "react";
import { FileText, BookOpen, Bookmark, FileCode } from "lucide-react";
import { motion } from "motion/react";

/**
 * Cuadrícula de evidencia oficial y citas textuales con aparición escalonada (stagger effect).
 */
export default function CitationsGrid({ citations = [] }) {
  return (
    <motion.div
      className="evidence-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="evidence-header">
        <div className="evidence-title">
          <div className="evidence-title-icon-box">
            <FileText size={18} />
          </div>
          <div>
            <h3>Evidencia Oficial y Citas de Respaldo ({citations.length})</h3>
            <p className="evidence-subtitle">
              Trazabilidad verificable con documento, versión, cláusula y extracto original
            </p>
          </div>
        </div>
      </div>

      {citations.length === 0 ? (
        <motion.div
          className="empty-citations-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FileText size={32} className="empty-citations-icon" />
          <p className="empty-citations-title">No se encontraron fragmentos normativos coincidentes</p>
          <span className="empty-citations-hint">
            Intenta replantear tu consulta con otros términos o verificar que la casilla de solo vigentes contenga los documentos buscados.
          </span>
        </motion.div>
      ) : (
        <div className="citations-grid">
          {citations.map((c, idx) => {
            const relevancePercent = Math.round((c.relevance_score || 0) * 100);
            const isTopMatch = idx === 0;

            return (
              <motion.div
                key={idx}
                className={`citation-card ${isTopMatch ? "top-match-card" : ""}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.15 + idx * 0.08,
                  ease: "easeOut",
                }}
                whileHover={{ y: -2 }}
              >
                <div className="citation-card-header">
                  <div className="citation-doc-info">
                    <div className="citation-doc-title">
                      <BookOpen size={16} className="citation-doc-icon" />
                      <span>{c.doc_title}</span>
                    </div>
                    <div className="citation-clause-title">
                      <Bookmark size={13} className="citation-clause-icon" />
                      <span>{c.clause_title}</span>
                      {c.page_or_section && (
                        <span className="citation-section-badge">{c.page_or_section}</span>
                      )}
                    </div>
                  </div>

                  <div className="citation-badges">
                    <span className={`badge-match-rank ${isTopMatch ? "rank-top" : "rank-similar"}`}>
                      {isTopMatch ? "⭐ Mayor Coincidencia" : "📑 Coincidencia Similar"}
                    </span>
                    <span className="badge-version">v{c.version}</span>
                    <span className="badge-relevance">
                      <span className="relevance-dot"></span>
                      {relevancePercent}% Relevancia
                    </span>
                  </div>
                </div>

                <blockquote className="citation-quote">
                  <span className="quote-mark">“</span>
                  {c.quote}
                  <span className="quote-mark">”</span>
                </blockquote>

                <div className="citation-footer">
                  <div className="citation-scopes">
                    {c.scopes && c.scopes.map((s, sIdx) => (
                      <span key={sIdx} className="scope-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="citation-file-info" title={c.file_name}>
                    <FileCode size={13} className="file-info-icon" />
                    <code className="file-name-code">{c.file_name}</code>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
