import React from "react";
import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

/**
 * Sección Hero con animación de entrada suave.
 */
export default function Hero() {
  return (
    <motion.section
      className="hero-section"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="hero-badge"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ShieldCheck size={15} className="hero-badge-icon text-emerald" />
        <span>Acceso Universal a Políticas Corporativas • Protección de Privacidad Activa</span>
      </motion.div>

      <motion.h2
        className="hero-title"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        ¿Qué política, reglamento o contrato deseas consultar hoy?
      </motion.h2>

      <motion.p
        className="hero-subtitle"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        Consulta en lenguaje natural las normativas oficiales de la empresa: viáticos, trabajo remoto, licencias, ciberseguridad, confidencialidad y contratos. Respuestas verificables respaldadas por evidencia oficial.
      </motion.p>
    </motion.section>
  );
}
