import React from "react";
import { HelpCircle, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

const FREQUENT_PROMPTS = [
  {
    category: "Bienestar & RRHH",
    text: "¿Cuántos días de permiso tengo por mudanza o traslado?",
  },
  {
    category: "Finanzas & Gastos",
    text: "¿Cuál es el plazo máximo para legalizar viáticos y gastos de viaje?",
  },
  {
    category: "Trabajo Remoto",
    text: "¿Qué subsidio de conectividad y horarios aplican para modalidad híbrida?",
  },
  {
    category: "Ciberseguridad & TI",
    text: "¿Cuáles son las políticas de almacenamiento y acceso seguro en Cloud?",
  },
  {
    category: "Legal & Contratos",
    text: "¿Cuál es la vigencia de las obligaciones de confidencialidad del NDA?",
  },
];

/**
 * Muestra sugerencias de preguntas frecuentes en formato de chips píldora horizontales con micro-interacciones.
 */
export default function FrequentQuestions({ onSelectPrompt }) {
  return (
    <motion.div
      className="suggestions-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <div className="suggestions-header">
        <HelpCircle size={15} className="suggestions-icon" />
        <span className="suggestions-label">
          Preguntas frecuentes y ejemplos de consulta:
        </span>
      </div>

      <div className="chips-grid">
        {FREQUENT_PROMPTS.map((item, idx) => (
          <motion.button
            key={idx}
            type="button"
            className="chip-btn"
            onClick={() => onSelectPrompt(item.text)}
            title={`Categoría: ${item.category}`}
            whileHover={{ scale: 1.025, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ChevronRight size={13} className="chip-chevron" />
            <span>
              <strong className="chip-category-text">[{item.category}]</strong>{" "}
              {item.text}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
