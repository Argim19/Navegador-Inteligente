import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Sección Hero con explicación de acceso universal y garantía de privacidad.
 */
export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-badge">
        <ShieldCheck size={14} color="#059669" />
        Acceso Universal a Políticas Corporativas • Protección de Privacidad Activa
      </div>
      <h2 className="hero-title">
        ¿Qué política, reglamento o contrato deseas consultar?
      </h2>
      <p className="hero-subtitle">
        Cualquier colaborador puede consultar en lenguaje natural las normativas oficiales
        de la empresa (viáticos, trabajo remoto, licencias, ciberseguridad y contratos).
        El sistema protege automáticamente la privacidad y los datos sensibles.
      </p>
    </section>
  );
}
