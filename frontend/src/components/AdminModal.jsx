import React, { useState } from "react";
import { Settings, X, RefreshCw, Upload, ShieldCheck } from "lucide-react";
import { reindexAllDocuments, uploadDocument } from "../api/client";

/**
 * Modal de Administración y Control Documental (Carga, Re-indexación y Catálogo).
 */
export default function AdminModal({
  isOpen,
  onClose,
  configStatus,
  documentsList,
  onRefresh,
}) {
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadScope, setUploadScope] = useState("General");
  const [uploadVersion, setUploadVersion] = useState("1.0");

  if (!isOpen) return null;

  const handleReindex = async () => {
    setAdminLoading(true);
    setAdminFeedback("");
    try {
      const data = await reindexAllDocuments();
      setAdminFeedback(
        `¡Éxito! ${data.total_chunks} cláusulas indexadas a partir de ${data.total_files} documentos.`
      );
      await onRefresh();
    } catch (err) {
      setAdminFeedback(`Error al indexar: ${err.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setAdminLoading(true);
    setAdminFeedback("");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("department_scope", uploadScope);
    formData.append("version", uploadVersion);

    try {
      const data = await uploadDocument(formData);
      setAdminFeedback(`Documento indexado: ${data.message}`);
      setUploadFile(null);
      await onRefresh();
    } catch (err) {
      setAdminFeedback(`Error al subir: ${err.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del Modal */}
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={20} color="var(--brand-primary)" />
            Panel de Administración y Gestión Documental
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tarjetas de Estadísticas */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">{configStatus.total_documents}</div>
              <div className="stat-title">Documentos Cargados</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{configStatus.total_indexed_chunks}</div>
              <div className="stat-title">Cláusulas Indexadas</div>
            </div>
            <div className="stat-box">
              <div className="stat-number" style={{ color: "#059669" }}>Universal</div>
              <div className="stat-title">Acceso Abierto a Políticas</div>
            </div>
          </div>

          {/* Acciones Globales */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              onClick={handleReindex}
              disabled={adminLoading}
            >
              <RefreshCw size={15} className={adminLoading ? "spinner" : ""} />
              {adminLoading ? "Procesando indexación..." : "Re-indexar Documentos_HTML (50 políticas)"}
            </button>
          </div>

          {adminFeedback && (
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                background: "#e0f2fe",
                color: "#0369a1",
                fontSize: "0.85rem",
              }}
            >
              {adminFeedback}
            </div>
          )}

          {/* Formulario de Carga de Documentos */}
          <form
            onSubmit={handleUpload}
            style={{
              border: "1px solid var(--border-color)",
              padding: "1rem",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Upload size={16} /> Subir y Versionar Nuevo Documento (HTML / PDF / TXT)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label className="form-label">Categorías / Scopes (Separados por coma):</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. TI, Cloud, General"
                  value={uploadScope}
                  onChange={(e) => setUploadScope(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Versión:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 10.0"
                  value={uploadVersion}
                  onChange={(e) => setUploadVersion(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Seleccionar archivo (HTML / PDF / TXT):</label>
              <input
                type="file"
                accept=".html,.htm,.pdf,.txt"
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ alignSelf: "flex-start" }}
              disabled={!uploadFile || adminLoading}
            >
              Indexar Documento
            </button>
          </form>

          {/* Tabla de Documentos Indexados */}
          <div className="form-group">
            <label className="form-label">Inventario de Políticas y Versiones Indexadas:</label>
            <div className="docs-table-wrapper">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Versión</th>
                    <th>Cláusulas</th>
                    <th>Categorías</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {documentsList.map((doc) => (
                    <tr key={doc.doc_id}>
                      <td style={{ fontWeight: 600 }}>{doc.doc_title}</td>
                      <td>v{doc.version}</td>
                      <td>{doc.total_clauses}</td>
                      <td>
                        {doc.scopes.map((s, i) => (
                          <span key={i} className="scope-tag" style={{ marginRight: "3px" }}>
                            {s}
                          </span>
                        ))}
                      </td>
                      <td>
                        <span className={`meta-pill ${doc.is_active ? "verified" : ""}`}>
                          {doc.is_active ? "Vigente" : "Histórica"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
