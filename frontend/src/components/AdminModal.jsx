import React, { useState } from "react";
import {
  Settings,
  X,
  RefreshCw,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Lock,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { reindexAllDocuments, uploadDocument } from "../api/client";

/**
 * Modal de Administración y Control Documental con autenticación previa de administrador.
 */
export default function AdminModal({
  isOpen,
  onClose,
  configStatus,
  documentsList = [],
  onRefresh,
}) {
  // Estado de Autenticación de Administrador
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Estado de Operaciones Administrativas
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadScope, setUploadScope] = useState("General");
  const [uploadVersion, setUploadVersion] = useState("1.0");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === "admin" && password === "admin") {
      setIsAuthenticated(true);
      setLoginError("");
      setPassword("");
    } else {
      setLoginError("Usuario o contraseña incorrectos. Verifique sus credenciales.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setLoginError("");
    setAdminFeedback(null);
  };

  const handleClose = () => {
    setLoginError("");
    onClose();
  };

  const handleReindex = async () => {
    setAdminLoading(true);
    setAdminFeedback(null);
    try {
      const data = await reindexAllDocuments();
      setAdminFeedback({
        type: "success",
        message: `¡Éxito! Se indexaron ${data.total_chunks} cláusulas a partir de ${data.total_files} documentos.`,
      });
      await onRefresh();
    } catch (err) {
      setAdminFeedback({
        type: "error",
        message: `Error al indexar: ${err.message}`,
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setAdminLoading(true);
    setAdminFeedback(null);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("department_scope", uploadScope);
    formData.append("version", uploadVersion);

    try {
      const data = await uploadDocument(formData);
      setAdminFeedback({
        type: "success",
        message: `Documento indexado con éxito: ${data.message || "Procesado correctamente."}`,
      });
      setUploadFile(null);
      await onRefresh();
    } catch (err) {
      setAdminFeedback({
        type: "error",
        message: `Error al subir documento: ${err.message}`,
      });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* VISTA 1: INICIO DE SESIÓN DE ADMINISTRADOR (Si no está autenticado) */}
          {!isAuthenticated ? (
            <motion.div
              key="admin-login-view"
              className="modal-content login-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              {/* Header del Login */}
              <div className="modal-header">
                <div className="modal-title">
                  <div className="modal-title-icon-box">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3>Acceso a Gestión Documental</h3>
                    <p className="modal-title-sub">Autenticación requerida para administradores</p>
                  </div>
                </div>
                <motion.button
                  className="btn-close-icon"
                  onClick={handleClose}
                  aria-label="Cerrar modal"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Cuerpo del Login */}
              <div className="modal-body">
                <div className="login-auth-info">
                  <ShieldCheck size={18} className="login-auth-info-icon" />
                  <span>
                    El módulo de Gestión Documental está restringido al área administrativa. Solo usuarios autorizados pueden cargar y versionar documentos normativos.
                  </span>
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.div
                      className="alert-banner alert-banner-error"
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle size={16} className="alert-icon" />
                      <span>{loginError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="api-key-form">
                  <div className="form-group">
                    <label className="form-label">Usuario:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ingrese usuario (admin)"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setLoginError("");
                      }}
                      autoFocus
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contraseña:</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-input password-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setLoginError("");
                        }}
                        required
                        autoComplete="current-password"
                      />
                      <motion.button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </motion.button>
                    </div>
                  </div>

                  <div className="modal-actions-right">
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleClose}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn btn-primary"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <LogIn size={15} />
                      <span>Iniciar Sesión</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            /* VISTA 2: PANEL DE ADMINISTRACIÓN DOCUMENTAL (Si ya está autenticado) */
            <motion.div
              key="admin-panel-view"
              className="modal-content admin-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              {/* Header del Modal */}
              <div className="modal-header">
                <div className="modal-title">
                  <div className="modal-title-icon-box">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3>Panel de Administración Documental</h3>
                    <p className="modal-title-sub">Gestión del corpus normativo, ingestión y versionamiento</p>
                  </div>
                </div>
                <div className="header-right-actions">
                  <motion.button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleLogout}
                    title="Cerrar sesión de administrador"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <LogOut size={13} />
                    <span>Cerrar Sesión</span>
                  </motion.button>
                  <motion.button
                    className="btn-close-icon"
                    onClick={handleClose}
                    aria-label="Cerrar modal"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              <div className="modal-body">
                {/* Tarjetas de Estadísticas */}
                <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-number">{configStatus.total_documents || documentsList.length || 0}</div>
                  <div className="stat-title">Documentos Registrados</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number stat-highlight">{configStatus.total_indexed_chunks || 0}</div>
                  <div className="stat-title">Cláusulas Indexadas</div>
                </div>
                <div className="stat-box stat-box-accent">
                  <div className="stat-number text-emerald">Universal</div>
                  <div className="stat-title">Acceso a Políticas</div>
                </div>
              </div>

              {/* Acciones Globales */}
              <div className="admin-actions-bar">
                <motion.button
                  type="button"
                  className="btn btn-secondary reindex-btn"
                  onClick={handleReindex}
                  disabled={adminLoading}
                  whileHover={!adminLoading ? { scale: 1.01 } : {}}
                  whileTap={!adminLoading ? { scale: 0.98 } : {}}
                >
                  <RefreshCw size={16} className={adminLoading ? "spinner" : ""} />
                  <span>{adminLoading ? "Procesando indexación..." : "Re-indexar Documentos_HTML (50 políticas)"}</span>
                </motion.button>
              </div>

              <AnimatePresence>
                {adminFeedback && (
                  <motion.div
                    className={`alert-banner ${adminFeedback.type === "error" ? "alert-banner-error" : "alert-banner-success"}`}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {adminFeedback.type === "error" ? (
                      <X size={16} className="alert-icon" />
                    ) : (
                      <CheckCircle size={16} className="alert-icon" />
                    )}
                    <span>{adminFeedback.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulario de Carga de Documentos */}
              <form onSubmit={handleUpload} className="upload-form-box">
                <div className="upload-form-header">
                  <Upload size={17} className="upload-header-icon" />
                  <h4>Subir y Versionar Nuevo Documento (HTML / PDF / TXT)</h4>
                </div>

                <div className="upload-form-grid">
                  <div className="form-group">
                    <label className="form-label">Categorías / Scopes (Separados por coma):</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. TI, Cloud, General, Finanzas"
                      value={uploadScope}
                      onChange={(e) => setUploadScope(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Versión del Documento:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. 1.0, 2.0"
                      value={uploadVersion}
                      onChange={(e) => setUploadVersion(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Seleccionar archivo normativo:</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      accept=".html,.htm,.pdf,.txt"
                      className="file-input-control"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="upload-form-actions">
                  <motion.button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={!uploadFile || adminLoading}
                    whileHover={uploadFile && !adminLoading ? { scale: 1.04 } : {}}
                    whileTap={uploadFile && !adminLoading ? { scale: 0.96 } : {}}
                  >
                    <Upload size={14} />
                    <span>{adminLoading ? "Indexando..." : "Indexar Documento"}</span>
                  </motion.button>
                </div>
              </form>

              {/* Tabla de Documentos Indexados */}
              <div className="inventory-section">
                <div className="inventory-header">
                  <FileText size={16} />
                  <label className="form-label">Inventario de Políticas y Versiones Indexadas ({documentsList.length}):</label>
                </div>

                <div className="docs-table-wrapper">
                  <table className="docs-table">
                    <thead>
                      <tr>
                        <th>Título del Documento</th>
                        <th>Versión</th>
                        <th>Cláusulas</th>
                        <th>Categorías</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentsList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="table-empty-cell">
                            No hay documentos cargados en el inventario.
                          </td>
                        </tr>
                      ) : (
                        documentsList.map((doc, idx) => (
                          <tr key={doc.doc_id || idx}>
                            <td className="doc-title-cell">{doc.doc_title}</td>
                            <td>
                              <span className="badge-version">v{doc.version}</span>
                            </td>
                            <td className="text-center">{doc.total_clauses}</td>
                            <td>
                              <div className="scope-tags-container">
                                {doc.scopes && doc.scopes.map((s, i) => (
                                  <span key={i} className="scope-tag">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className={`meta-pill ${doc.is_active ? "verified" : "historical-pill"}`}>
                                {doc.is_active ? (
                                  <>
                                    <CheckCircle size={11} />
                                    <span>Vigente</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={11} />
                                    <span>Histórica</span>
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <motion.button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Cerrar Panel
              </motion.button>
            </div>
          </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
