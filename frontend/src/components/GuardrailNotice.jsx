import React from "react";
import { ShieldAlert, Info, Lock } from "lucide-react";
import { motion } from "motion/react";

/**
 * Notificación visual elegante cuando una consulta sobre saldos, sueldos individuales o PII es interceptada.
 */
export default function GuardrailNotice({ notice, latency }) {
  if (!notice) return null;

  return (
    <motion.div
      className="guardrail-card"
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      {/* Encabezado del Guardrail */}
      <div className="guardrail-header">
        <div className="guardrail-header-left">
          <motion.div
            className="guardrail-icon-box"
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ShieldAlert size={24} />
          </motion.div>
          <div>
            <h3 className="guardrail-title">
              {notice.title || "Consulta Interceptada por Política de Seguridad"}
            </h3>
            <p className="guardrail-subtitle">
              Control Institucional de Privacidad y Protección de Datos Sensibles (PII)
            </p>
          </div>
        </div>

        <div className="guardrail-meta">
          <span className="meta-pill guardrail-pill">
            <Lock size={12} />
            <span>Filtro Activo</span>
          </span>
          {latency && (
            <span className="meta-pill latency-pill">
              {latency} ms
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo del Mensaje */}
      <div className="guardrail-body">
        <p className="guardrail-message-text">{notice.message}</p>

        {notice.suggestion && (
          <motion.div
            className="guardrail-channel-box"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="guardrail-channel-title">
              <Info size={16} />
              <span>Canal Oficial Recomendado para esta solicitud:</span>
            </div>
            <p className="guardrail-channel-desc">{notice.suggestion}</p>
          </motion.div>
        )}
      </div>

      {/* Nota al Pie Informativa */}
      <div className="guardrail-footer">
        <span className="guardrail-footer-text">
          💡 <strong>Aviso de Gobernanza:</strong> Este navegador corporativo está habilitado para todos los empleados para consultar normativas, viáticos, permisos y contratos sin vulnerar la confidencialidad de salarios individuales ni cuentas bancarias.
        </span>
      </div>
    </motion.div>
  );
}
