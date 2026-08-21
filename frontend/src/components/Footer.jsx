import React from "react";
import { ShieldCheck, Sparkles, Database } from "lucide-react";

/**
 * Pie de página corporativo elegante con indicadores de estado y privacidad.
 */
export default function Footer({ configStatus = {} }) {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-col-left">
          <div className="footer-brand">
            <span className="footer-title">Navegador Inteligente</span>
            <span className="footer-subtitle">Políticas, Reglamentos y Contratos</span>
          </div>
          <p className="footer-desc">
            Acceso universal para todos los colaboradores de la organización. Respaldado por evidencia documental trazable y filtros de privacidad de datos sensibles.
          </p>
        </div>

        <div className="footer-col-right">
          <div className="footer-badges">
            <div className="footer-badge">
              <ShieldCheck size={14} className="badge-icon-emerald" />
              <span>Privacidad PII Protegida</span>
            </div>
            <div className="footer-badge">
              <Database size={14} className="badge-icon-brand" />
              <span>{configStatus.total_indexed_chunks || 0} Cláusulas Indexadas</span>
            </div>
            <div className="footer-badge">
              <Sparkles size={14} className="badge-icon-amber" />
              <span>{configStatus.is_active ? "Gemini 3.6 Flash" : "Motor Local"}</span>
            </div>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Navegador Inteligente Corporativo.
          </div>
        </div>
      </div>
    </footer>
  );
}
