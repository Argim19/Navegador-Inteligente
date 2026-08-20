import React from "react";
import { ShieldAlert, ArrowRight, Info, ExternalLink } from "lucide-react";

/**
 * Notificación visual elegante cuando una consulta sobre saldos, sueldos o PII es interceptada.
 */
export default function GuardrailNotice({ notice, latency }) {
  if (!notice) return null;

  return (
    <div
      className="guardrail-card"
      style={{
        background: "#fff",
        border: "1px solid #fecaca",
        borderRadius: "14px",
        padding: "1.75rem",
        boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.08)",
        marginBottom: "2rem",
      }}
    >
      {/* Encabezado del Guardrail */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1rem",
          borderBottom: "1px solid #fee2e2",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#991b1b" }}>
              {notice.title || "Consulta Interceptada por Política de Seguridad"}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#b91c1c" }}>
              Control de Privacidad y Protección de Datos Sensibles
            </p>
          </div>
        </div>

        <span
          className="meta-pill"
          style={{ background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" }}
        >
          {latency} ms
        </span>
      </div>

      {/* Cuerpo del Mensaje */}
      <div style={{ color: "#374151", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.25rem" }}>
        <p style={{ marginBottom: "0.75rem" }}>{notice.message}</p>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "1rem",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "var(--brand-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "0.35rem",
            }}
          >
            <Info size={16} /> Canal Oficial Recomendado:
          </div>
          <p style={{ fontSize: "0.88rem", color: "#475569" }}>{notice.suggestion}</p>
        </div>
      </div>

      {/* Nota al Pie Informativa */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          paddingTop: "0.75rem",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <span>
          💡 <em>Este navegador corporativo está habilitado para todos los empleados para consultar normativas, viáticos, permisos y contratos sin vulnerar la privacidad de cuentas ni salarios individuales.</em>
        </span>
      </div>
    </div>
  );
}
