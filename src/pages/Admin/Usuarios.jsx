import { useState } from "react";
import { Alert, Badge, Button, Form, InputGroup, Table } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import FormularioUsuario from "../../components/Admin/FormularioUsuario";
import MenuAdmin from "../../components/Admin/MenuAdmin";
import { useUsuarios } from "../../hooks/useUsuarios";
import { ETIQUETAS_ROL } from "../../services/usuarioService";
import { obtenerUsuarioSesion } from "../../utils/sesion";
import "./Usuarios.css";

function iniciales(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();
}

// Gestión de cuentas (ms-auth): crear, editar, asignar rol y desactivar. Solo el rol ADMINISTRADOR llega aquí.
function Usuarios() {
  const {
    usuarios,
    cargando,
    error,
    errorAccion,
    sesionVencida,
    recargar,
    limpiarError,
    crear,
    actualizar,
    cambiarEstado,
  } = useUsuarios();

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [formulario, setFormulario] = useState(null); // { usuario } mientras el formulario está abierto (usuario = null: nuevo)
  const [guardando, setGuardando] = useState(false);

  const correoPropio = obtenerUsuarioSesion()?.correo?.toLowerCase();
  const esPropia = (usuario) => usuario.correo.toLowerCase() === correoPropio;

  const texto = busqueda.trim().toLowerCase();
  const filtrados = usuarios.filter(
    (usuario) =>
      `${usuario.nombre} ${usuario.correo}`.toLowerCase().includes(texto) &&
      (filtroRol === "Todos" || usuario.rol === filtroRol) &&
      (filtroEstado === "Todos" || (filtroEstado === "Activo") === usuario.activo)
  );

  const activos = usuarios.filter((usuario) => usuario.activo).length;
  const administradores = usuarios.filter((usuario) => usuario.rol === "ADMINISTRADOR").length;

  function abrirFormulario(usuario = null) {
    limpiarError();
    setFormulario({ usuario });
  }

  async function guardar(datos) {
    const { usuario } = formulario;
    setGuardando(true);
    const guardado = usuario ? await actualizar(usuario.id, datos) : await crear(datos);
    setGuardando(false);
    if (guardado) setFormulario(null);
  }

  async function alternarEstado(usuario) {
    if (usuario.activo && !window.confirm(`¿Desactivar la cuenta de ${usuario.nombre}? No podrá iniciar sesión.`)) return;
    await cambiarEstado(usuario.id, !usuario.activo);
  }

  // El token venció mientras se usaba la página
  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  return (
    <main className="container admin-usuarios py-4 py-lg-5">
      <div className="admin-migas mb-3">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <span>Administración</span>
      </div>
      <header className="admin-encabezado mb-4">
        <div>
          <span className="admin-etiqueta">
            <i className="bi bi-shield-check" aria-hidden="true" /> Administración
          </span>
          <h1>Gestión de usuarios</h1>
          <p className="mb-0">Crea cuentas, asigna roles y desactiva el acceso de quien ya no lo necesite.</p>
        </div>
        <div className="admin-encabezado-acciones">
          <Button className="admin-btn-guardar" onClick={() => abrirFormulario()}>
            <i className="bi bi-person-plus me-1" aria-hidden="true" />
            Nuevo usuario
          </Button>
        </div>
      </header>

      <MenuAdmin />

      {errorAccion && !formulario && (
        <Alert variant="danger" role="alert">
          {errorAccion}
        </Alert>
      )}

      {cargando ? (
        <p className="text-secondary" role="status">
          Cargando usuarios...
        </p>
      ) : error ? (
        <Alert variant="danger" role="alert">
          {error}{" "}
          <Alert.Link as="button" type="button" onClick={recargar}>
            Reintentar
          </Alert.Link>
        </Alert>
      ) : (
        <>
          <section className="row g-3 mb-4" aria-label="Resumen de usuarios">
            <div className="col-12 col-sm-4">
              <article className="admin-resumen">
                <span className="admin-resumen-icono azul">
                  <i className="bi bi-people" aria-hidden="true" />
                </span>
                <div>
                  <span>Total de usuarios</span>
                  <strong>{usuarios.length}</strong>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-4">
              <article className="admin-resumen">
                <span className="admin-resumen-icono verde">
                  <i className="bi bi-person-check" aria-hidden="true" />
                </span>
                <div>
                  <span>Usuarios activos</span>
                  <strong>{activos}</strong>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-4">
              <article className="admin-resumen">
                <span className="admin-resumen-icono rosa">
                  <i className="bi bi-shield-lock" aria-hidden="true" />
                </span>
                <div>
                  <span>Administradores</span>
                  <strong>{administradores}</strong>
                </div>
              </article>
            </div>
          </section>

          <section className="admin-tabla-caja">
            <div className="admin-tabla-titulo">
              <div>
                <h2>Usuarios registrados</h2>
                <p>Las cuentas desactivadas conservan sus datos, pero no pueden iniciar sesión.</p>
              </div>
              <span className="admin-conteo">
                {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="admin-filtros">
              <InputGroup className="admin-busqueda">
                <InputGroup.Text>
                  <i className="bi bi-search" aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  aria-label="Buscar usuarios"
                  placeholder="Buscar por nombre o correo..."
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </InputGroup>
              <Form.Select aria-label="Filtrar por rol" value={filtroRol} onChange={(evento) => setFiltroRol(evento.target.value)}>
                <option value="Todos">Todos los roles</option>
                {Object.entries(ETIQUETAS_ROL).map(([codigo, etiqueta]) => (
                  <option key={codigo} value={codigo}>
                    {etiqueta}
                  </option>
                ))}
              </Form.Select>
              <Form.Select
                aria-label="Filtrar por estado"
                value={filtroEstado}
                onChange={(evento) => setFiltroEstado(evento.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Form.Select>
            </div>

            <div className="table-responsive">
              <Table hover className="admin-tabla align-middle mb-0">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="admin-usuario-celda">
                          <span className="admin-avatar">{iniciales(usuario.nombre)}</span>
                          <div>
                            <strong>{usuario.nombre}</strong>
                            <small>{usuario.correo}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge
                          bg={usuario.rol === "ADMINISTRADOR" ? "dark" : "light"}
                          text={usuario.rol === "ADMINISTRADOR" ? undefined : "dark"}
                          className="admin-badge-rol"
                        >
                          {ETIQUETAS_ROL[usuario.rol] ?? usuario.rol}
                        </Badge>
                      </td>
                      <td>
                        <span className={`admin-estado ${usuario.activo ? "activo" : "inactivo"}`}>
                          <span />
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="text-nowrap">
                        {usuario.registro ? new Date(`${usuario.registro}T12:00:00`).toLocaleDateString("es-CL") : "—"}
                      </td>
                      <td className="text-end text-nowrap">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="admin-btn-editar me-2"
                          onClick={() => abrirFormulario(usuario)}
                          aria-label={`Editar a ${usuario.nombre}`}
                        >
                          <i className="bi bi-pencil-square me-1" aria-hidden="true" />
                          Editar
                        </Button>
                        <Button
                          variant={usuario.activo ? "outline-danger" : "outline-success"}
                          size="sm"
                          disabled={usuario.activo && esPropia(usuario)}
                          title={usuario.activo && esPropia(usuario) ? "No puedes desactivar tu propia cuenta" : undefined}
                          onClick={() => alternarEstado(usuario)}
                          aria-label={`${usuario.activo ? "Desactivar" : "Activar"} a ${usuario.nombre}`}
                        >
                          {usuario.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        <div className="admin-vacio">
                          <i className="bi bi-search" aria-hidden="true" />
                          <strong>No se encontraron usuarios</strong>
                          <span>Prueba con otro término o cambia los filtros.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </section>
        </>
      )}

      {formulario && (
        <FormularioUsuario
          usuario={formulario.usuario}
          esCuentaPropia={Boolean(formulario.usuario) && esPropia(formulario.usuario)}
          guardando={guardando}
          error={errorAccion}
          onGuardar={guardar}
          onCancelar={() => setFormulario(null)}
        />
      )}
    </main>
  );
}

export default Usuarios;
