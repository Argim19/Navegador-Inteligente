"""
Servicio de Guardrails de Seguridad y Privacidad Corporativa.

Intercepta proactivamente consultas que intenten acceder a:
1. Saldos bancarios, cuentas financieras y transacciones privadas.
2. Salarios individuales, nóminas específicas y compensaciones de terceros.
3. Credenciales, contraseñas, tokens y llaves criptográficas.
4. Datos personales sensibles (PII: cédulas, tarjetas de crédito, datos médicos).

Garantiza que el sistema opere exclusivamente como un navegador de políticas,
reglamentos y normativas institucionales.
"""

import re
import unicodedata
from typing import NamedTuple, Optional


class GuardrailResult(NamedTuple):
    is_blocked: bool
    category: Optional[str]
    title: Optional[str]
    message: Optional[str]
    suggestion: Optional[str]


def _normalize_text(text: str) -> str:
    """Normaliza texto eliminando acentos, caracteres especiales y pasando a minúsculas."""
    text = unicodedata.normalize("NFKD", text).encode("ASCII", "ignore").decode("utf-8")
    return text.lower().strip()


class PrivacyGuardrailService:
    """
    Motor de detección y protección de privacidad para el Navegador Inteligente.
    Aplica filtros de seguridad basados en patrones léxicos y semánticos.
    """

    # 1. Patrones de Saldos y Cuentas Bancarias / Financieras Privadas
    BALANCE_PATTERNS = [
        r"\b(saldo|saldos|balance|extracto|extractos|movimiento|movimientos)\s+(de\s+la?\s+cuenta|bancari[oa]|en\s+el\s+banco|disponible|actual)\b",
        r"\b(consultar|ver|revisar|saber|cual\s+es|cuanto\s+tengo|cuanto\s+hay)\s+(en\s+mi\s+cuenta|mi\s+saldo|el\s+saldo|saldo\s+de|dinero\s+en\s+la\s+cuenta)\b",
        r"\b(cuanto\s+dinero\s+queda|cuanto\s+saldo\s+tengo|saldo\s+tarjeta|saldo\s+caja\s+menor)\b",
        r"\b(transferir|transferencia\s+bancaria|numero\s+de\s+cuenta\s+bancaria|codigo\s+iban|swift)\b",
    ]

    # 2. Patrones de Salarios Individuales y Nómina Específica
    SALARY_PATTERNS = [
        r"\b(cuanto\s+(gana|cobran?|le\s+pagan)|sueldo\s+de|salario\s+de|paga\s+de)\s+([a-z]+)\b",
        r"\b(desprendible\s+de\s+pago|volante\s+de\s+nomina|mi\s+pago\s+de\s+este\s+mes|cuanto\s+me\s+van\s+a\s+pagar)\b",
        r"\b(lista\s+de\s+salarios|sueldos\s+de\s+los\s+empleados|tabla\s+salarial\s+privada|nomina\s+individual)\b",
        r"\b(aumento\s+de\s+sueldo\s+de|salario\s+del\s+gerente|cuanto\s+gana\s+el\s+ceo)\b",
    ]

    # 3. Patrones de Credenciales, Contraseñas y Secretos Técnicos
    CREDENTIALS_PATTERNS = [
        r"\b(password|contrasena|clave\s+de\s+acceso|contrasenas|credenciales|token|api\s*key|secret\s*key)\s+(de|del|para)\b",
        r"\b(dame|muestra|revela|cual\s+es)\s+la?\s*(clave|password|contrasena|token|credencial)\b",
        r"\b(acceso\s+root|usuario\s+y\s+contrasena|login\s+de\s+admin|claves\s+wifi\s+privadas)\b",
        r"\b(llave\s+privada|ssh\s+key|certificado\s+ssl\s+privado)\b",
    ]

    # 4. Patrones de Datos Personales Sensibles (PII)
    PII_PATTERNS = [
        r"\b(numero\s+de\s+tarjeta|tarjeta\s+de\s+credito|cvv|fecha\s+de\s+vencimiento|cedula\s+de|dni\s+de)\s+([a-z]+)\b",
        r"\b(historial\s+medico\s+de|diagnostico\s+de|direccion\s+de\s+casa\s+de|telefono\s+privado\s+de)\s+([a-z]+)\b",
        r"\b(datos\s+personales\s+de|informacion\s+privada\s+de|cuenta\s+bancaria\s+de)\s+([a-z]+)\b",
    ]

    def evaluate_query(self, query: str) -> GuardrailResult:
        """
        Evalúa si una consulta infringe las políticas de privacidad y seguridad corporativa.
        Retorna GuardrailResult indicando si debe ser bloqueada y el mensaje correspondiente.
        """
        if not query or not query.strip():
            return GuardrailResult(
                is_blocked=False, category=None, title=None, message=None, suggestion=None
            )

        normalized = _normalize_text(query)

        # 1. Verificar consultas de saldos o transacciones financieras
        for pattern in self.BALANCE_PATTERNS:
            if re.search(pattern, normalized):
                return GuardrailResult(
                    is_blocked=True,
                    category="FINANCIAL_BALANCE",
                    title="Consulta Financiera Privada Interceptada",
                    message=(
                        "Por razones de seguridad y confidencialidad bancaria, este sistema no tiene acceso "
                        "a saldos de cuentas, extractos bancarios ni transacciones financieras privadas."
                    ),
                    suggestion=(
                        "Para consultar tu saldo de anticipos, fondos de viáticos o cuentas corporativas, "
                        "accede al Portal Financiero Institucional (ERP) o comunícate con Tesorería/Contabilidad."
                    ),
                )

        # 2. Verificar consultas de salarios o nómina individual
        for pattern in self.SALARY_PATTERNS:
            if re.search(pattern, normalized):
                return GuardrailResult(
                    is_blocked=True,
                    category="SALARY_PAYROLL",
                    title="Consulta de Nómina Individual Interceptada",
                    message=(
                        "La información sobre salarios individuales, desprendibles de pago y compensaciones "
                        "personales está protegida por la ley de Protección de Datos Personales y no forma parte del catálogo público de políticas."
                    ),
                    suggestion=(
                        "Puedes consultar las políticas generales sobre beneficios, viáticos o estructura de compensaciones. "
                        "Para ver tu desprendible de pago personal, ingresa al Portal de Autoservicio de Gestión Humana (RRHH)."
                    ),
                )

        # 3. Verificar consultas de credenciales o secretos técnicos
        for pattern in self.CREDENTIALS_PATTERNS:
            if re.search(pattern, normalized):
                return GuardrailResult(
                    is_blocked=True,
                    category="CREDENTIALS_SECURITY",
                    title="Consulta de Credenciales / Seguridad Interceptada",
                    message=(
                        "Por protocolos estrictos de Ciberseguridad e ISO 27001, este asistente no almacena ni "
                        "divulga contraseñas, llaves criptográficas, tokens de API ni credenciales de acceso."
                    ),
                    suggestion=(
                        "Puedes consultar la 'Política de Seguridad de la Información y Gestión de Accesos' para conocer "
                        "el procedimiento oficial de solicitud de accesos ante la Mesa de Ayuda de TI."
                    ),
                )

        # 4. Verificar consultas de datos personales sensibles (PII)
        for pattern in self.PII_PATTERNS:
            if re.search(pattern, normalized):
                return GuardrailResult(
                    is_blocked=True,
                    category="PII_PERSONAL_DATA",
                    title="Consulta de Datos Personales Protegidos",
                    message=(
                        "Esta consulta intenta acceder a datos personales o registros confidenciales de colaboradores, "
                        "los cuales están estrictamente restringidos por normativas de privacidad corporativa."
                    ),
                    suggestion=(
                        "Este navegador está diseñado exclusivamente para consultar reglamentos, normativas y políticas institucionales."
                    ),
                )

        # Consulta permitida
        return GuardrailResult(
            is_blocked=False, category=None, title=None, message=None, suggestion=None
        )


guardrail_service = PrivacyGuardrailService()
