import React from "react";
import { ChevronRight, HelpCircle } from "lucide-react";

const FREQUENT_PROMPTS = [
  {
    category: "Bienestar & RRHH",
    text: "¿Cuántos días de permiso tengo por mudanza o traslado?",
  },
  {
    category: "Viáticos & Finanzas",
    text: "¿Cuál es el plazo para legalizar anticipos y comprobantes de viaje?",
  },
  {
    category: "Trabajo Remoto",
    text: "¿Cuáles son los requisitos de conectividad y horarios para teletrabajo?",
  },
  {
    category: "Ciberseguridad & TI",
    text: "¿Cuáles son las reglas de cambio y longitud para contraseñas?",
  },
  {
    category: "Legal & Contratos",
    text: "¿Cuál es la vigencia y penalidad de los acuerdos de confidencialidad?",
  },
  {
    category: "Prueba de Privacidad",
    text: "¿Cuál es el saldo actual de mi cuenta bancaria?",
  },
];

/**
 * Muestra sugerencias de preguntas frecuentes para facilitar la exploración cross-área.
 */
export default function FrequentQuestions({ onSelectPrompt }) {
  return (
    <div className="suggestions-container">
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
        <HelpCircle size={15} color="var(--brand-primary)" />
        <span className="suggestions-label" style={{ margin: 0 }}>
          Preguntas frecuentes y ejemplos de consulta:
        </span>
      </div>

      <div className="chips-grid">
        {FREQUENT_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            className="chip-btn"
            onClick={() => onSelectPrompt(item.text)}
            title={`Categoría: ${item.category}`}
          >
            <ChevronRight size={13} />
            <span>
              <strong style={{ color: "var(--brand-primary)", marginRight: "4px" }}>
                [{item.category}]
              </strong>
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
