import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, InputGroup, Modal, Row, Table } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { usuarioDemo } from "../../data/Tutor/usuario";
import "./Usuarios.css";

const CLAVE_USUARIOS = "usuariosVeterinariaSanMarcos";
const CLAVE_SESION = "usuarioVeterinariaSanMarcos";

const usuariosIniciales = [
  { id: "admin-001", run: "11111111-1", nombre: "Administrador", apellidos: "San Marcos", correo: "admin@duoc.cl", telefono: "+56900000000", direccion: "Av. San Marcos 123", region: "ohiggins", comuna: "Rancagua", rol: "Administrador", estado: "Activo", fechaRegistro: "2026-01-10" },
  { ...usuarioDemo, id: "tutor-001", rol: "Tutor", estado: "Activo", fechaRegistro: "2026-02-15" },
  { id: "tutor-002", run: "16234567-8", nombre: "María", apellidos: "González Pérez", correo: "maria.gonzalez@example.cl", telefono: "+56912345671", direccion: "Av. Providencia 123", region: "metropolitana", comuna: "Providencia", rol: "Tutor", estado: "Activo", fechaRegistro: "2026-03-02" },
  { id: "tutor-003", run: "17456789-0", nombre: "Diego", apellidos: "Muñoz Silva", correo: "diego.munoz@example.cl", telefono: "+56912345672", direccion: "Los Robles 456", region: "ohiggins", comuna: "Rancagua", rol: "Tutor", estado: "Activo", fechaRegistro: "2026-03-18" },
  { id: "tutor-004", run: "18987654-3", nombre: "Valentina", apellidos: "Soto Rojas", correo: "valentina.soto@example.cl", telefono: "+56912345673", direccion: "Las Flores 789", region: "valparaiso", comuna: "Viña del Mar", rol: "Tutor", estado: "Inactivo", fechaRegistro: "2026-04-01" },
  { id: "tutor-005", run: "20123456-7", nombre: "Javier", apellidos: "Contreras Díaz", correo: "javier.contreras@example.cl", telefono: "+56912345674", direccion: "Av. Central 321", region: "metropolitana", comuna: "Santiago", rol: "Tutor", estado: "Activo", fechaRegistro: "2026-04-20" },
  { id: "tutor-006", run: "15432109-6", nombre: "Fernanda", apellidos: "Vargas León", correo: "fernanda.vargas@example.cl", telefono: "+56912345675", direccion: "El Parque 654", region: "maule", comuna: "Talca", rol: "Tutor", estado: "Activo", fechaRegistro: "2026-05-09" },
  { id: "tutor-007", run: "19345678-2", nombre: "Tomás", apellidos: "Herrera Castro", correo: "tomas.herrera@example.cl", telefono: "+56912345676", direccion: "Los Aromos 987", region: "biobio", comuna: "Concepción", rol: "Tutor", estado: "Activo", fechaRegistro: "2026-06-12" },
];

function leerUsuarios() {
  try {
    const guardados = localStorage.getItem(CLAVE_USUARIOS);
    if (guardados) {
      const lista = JSON.parse(guardados);
      if (Array.isArray(lista)) return lista;
    }
  } catch {
    // Si el almacenamiento está dañado, se recupera con datos de demostración.
  }
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuariosIniciales));
  return usuariosIniciales;
}

const formularioVacio = {
  run: "", nombre: "", apellidos: "", correo: "", telefono: "", direccion: "", region: "", comuna: "", rol: "Tutor", estado: "Activo",
};

function Usuarios() {
  const [usuarios, setUsuarios] = useState(leerUsuarios);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [datos, setDatos] = useState(formularioVacio);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);
  const sesion = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(CLAVE_SESION) || "null"); }
    catch { return null; }
  }, []);
  const adminAutenticado = sessionStorage.getItem("adminVeterinariaAutenticado") === "true";

  useEffect(() => {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
  }, [usuarios]);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = `${usuario.nombre} ${usuario.apellidos} ${usuario.correo} ${usuario.run}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase())
      && (filtroRol === "Todos" || usuario.rol === filtroRol)
      && (filtroEstado === "Todos" || usuario.estado === filtroEstado);
  });

  const activos = usuarios.filter((usuario) => usuario.estado === "Activo").length;
  const administradores = usuarios.filter((usuario) => usuario.rol === "Administrador").length;

  if (!adminAutenticado || !sesion || sesion.rol !== "Administrador" || sesion.correo?.toLowerCase() !== "admin@duoc.cl") {
    return <Navigate to="/login" replace />;
  }

  function abrirEdicion(usuario) {
    setUsuarioEditando(usuario);
    setDatos({ ...formularioVacio, ...usuario });
    setErrores({});
    setMensaje("");
    setGuardado(false);
  }

  function cerrarEdicion() {
    setUsuarioEditando(null);
    setErrores({});
    setMensaje("");
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setDatos((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: "" }));
    setGuardado(false);
  }

  function guardarEdicion(evento) {
    evento.preventDefault();
    const nuevosErrores = {};
    const nombre = datos.nombre.trim();
    const apellidos = datos.apellidos.trim();
    const correo = datos.correo.trim().toLowerCase();
    if (nombre.length < 2) nuevosErrores.nombre = "Ingresa un nombre de al menos 2 caracteres.";
    if (apellidos.length < 2) nuevosErrores.apellidos = "Ingresa apellidos de al menos 2 caracteres.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) nuevosErrores.correo = "Ingresa un correo electrónico válido.";
    if (datos.telefono.trim() && !/^\+?[0-9\s()-]{8,16}$/.test(datos.telefono.trim())) nuevosErrores.telefono = "Revisa el formato del teléfono.";
    if (!datos.run.trim()) nuevosErrores.run = "El RUN es obligatorio.";
    if (usuarios.some((usuario) => usuario.id !== usuarioEditando.id && usuario.correo.toLowerCase() === correo)) {
      nuevosErrores.correo = "Ya existe un usuario registrado con ese correo.";
    }
    if (usuarios.some((usuario) => usuario.id !== usuarioEditando.id && usuario.run.toLowerCase() === datos.run.trim().toLowerCase())) {
      nuevosErrores.run = "Ya existe un usuario registrado con ese RUN.";
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    const actualizado = { ...usuarioEditando, ...datos, nombre, apellidos, correo, run: datos.run.trim(), telefono: datos.telefono.trim(), direccion: datos.direccion.trim() };
    setUsuarios((actuales) => actuales.map((usuario) => usuario.id === usuarioEditando.id ? actualizado : usuario));

    // Si el administrador edita su propio registro, se sincroniza también la sesión actual.
    if (usuarioEditando.id === sesion.id || usuarioEditando.correo === sesion.correo) {
      localStorage.setItem(CLAVE_SESION, JSON.stringify({ ...sesion, ...actualizado }));
    }
    setGuardado(true);
    setMensaje("Los cambios se guardaron correctamente.");
  }

  return (
    <main className="container admin-usuarios py-4 py-lg-5">
      <div className="admin-migas mb-3"><Link to="/mi-perfil">Mi perfil</Link><span>/</span><span>Administración</span></div>
      <header className="admin-encabezado mb-4">
        <div>
          <span className="admin-etiqueta"><i className="bi bi-shield-check" aria-hidden="true" /> Administración</span>
          <h1>Gestión de usuarios</h1>
          <p className="mb-0">Consulta y actualiza las cuentas registradas en Veterinaria San Marcos.</p>
        </div>
        <div className="admin-encabezado-acciones"><span className="admin-sesion"><span className="admin-punto" /> Sesión administrador</span><Link className="btn btn-outline-secondary" to="/mi-perfil">Volver al perfil</Link></div>
      </header>

      <section className="row g-3 mb-4" aria-label="Resumen de usuarios">
        <div className="col-12 col-sm-4"><article className="admin-resumen"><span className="admin-resumen-icono azul"><i className="bi bi-people" aria-hidden="true" /></span><div><span>Total de usuarios</span><strong>{usuarios.length}</strong></div></article></div>
        <div className="col-12 col-sm-4"><article className="admin-resumen"><span className="admin-resumen-icono verde"><i className="bi bi-person-check" aria-hidden="true" /></span><div><span>Usuarios activos</span><strong>{activos}</strong></div></article></div>
        <div className="col-12 col-sm-4"><article className="admin-resumen"><span className="admin-resumen-icono rosa"><i className="bi bi-shield-lock" aria-hidden="true" /></span><div><span>Administradores</span><strong>{administradores}</strong></div></article></div>
      </section>

      <section className="admin-tabla-caja">
        <div className="admin-tabla-titulo"><div><h2>Usuarios registrados</h2><p>Los datos se guardan localmente en este navegador.</p></div><span className="admin-conteo">{usuariosFiltrados.length} resultado{usuariosFiltrados.length === 1 ? "" : "s"}</span></div>
        <div className="admin-filtros">
          <InputGroup className="admin-busqueda"><InputGroup.Text><i className="bi bi-search" aria-hidden="true" /></InputGroup.Text><Form.Control aria-label="Buscar usuarios" placeholder="Buscar por nombre, correo o RUN..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></InputGroup>
          <Form.Select aria-label="Filtrar por rol" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}><option value="Todos">Todos los roles</option><option value="Tutor">Tutor</option><option value="Administrador">Administrador</option></Form.Select>
          <Form.Select aria-label="Filtrar por estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}><option value="Todos">Todos los estados</option><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></Form.Select>
        </div>
        <div className="table-responsive">
          <Table hover className="admin-tabla align-middle mb-0">
            <thead><tr><th>Usuario</th><th>RUN</th><th>Rol</th><th>Estado</th><th>Registro</th><th className="text-end">Acciones</th></tr></thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => <tr key={usuario.id}>
                <td><div className="admin-usuario-celda"><span className="admin-avatar">{`${usuario.nombre?.[0] || "U"}${usuario.apellidos?.[0] || ""}`.toUpperCase()}</span><div><strong>{usuario.nombre} {usuario.apellidos}</strong><small>{usuario.correo}</small></div></div></td>
                <td className="text-nowrap">{usuario.run}</td>
                <td><Badge bg={usuario.rol === "Administrador" ? "dark" : "light"} text={usuario.rol === "Administrador" ? undefined : "dark"} className="admin-badge-rol">{usuario.rol}</Badge></td>
                <td><span className={`admin-estado ${usuario.estado === "Activo" ? "activo" : "inactivo"}`}><span />{usuario.estado || "Activo"}</span></td>
                <td className="text-nowrap">{usuario.fechaRegistro ? new Date(`${usuario.fechaRegistro}T12:00:00`).toLocaleDateString("es-CL") : "—"}</td>
                <td className="text-end"><Button variant="outline-primary" size="sm" className="admin-btn-editar" onClick={() => abrirEdicion(usuario)}><i className="bi bi-pencil-square me-1" aria-hidden="true" />Editar</Button></td>
              </tr>)}
              {usuariosFiltrados.length === 0 && <tr><td colSpan="6"><div className="admin-vacio"><i className="bi bi-search" aria-hidden="true"/><strong>No se encontraron usuarios</strong><span>Prueba con otro término o cambia los filtros.</span></div></td></tr>}
            </tbody>
          </Table>
        </div>
        <div className="admin-nota"><i className="bi bi-info-circle" aria-hidden="true" /> Esta vista utiliza datos ficticios y almacenamiento local; no modifica una base de datos real.</div>
      </section>

      <Modal show={Boolean(usuarioEditando)} onHide={cerrarEdicion} centered size="lg" className="admin-modal" backdrop="static">
        <Form onSubmit={guardarEdicion} noValidate>
          <Modal.Header closeButton><div><span className="admin-etiqueta">Editar registro</span><Modal.Title>Datos del usuario</Modal.Title><p className="text-secondary small mb-0">Actualiza los campos y guarda los cambios.</p></div></Modal.Header>
          <Modal.Body>
            {mensaje && <Alert variant={guardado ? "success" : "danger"} className="py-2">{mensaje}</Alert>}
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>RUN</Form.Label><Form.Control name="run" value={datos.run} onChange={cambiarCampo} isInvalid={Boolean(errores.run)} required/><Form.Control.Feedback type="invalid">{errores.run}</Form.Control.Feedback></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Correo electrónico</Form.Label><Form.Control type="email" name="correo" value={datos.correo} onChange={cambiarCampo} isInvalid={Boolean(errores.correo)} required/><Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Nombre</Form.Label><Form.Control name="nombre" value={datos.nombre} onChange={cambiarCampo} isInvalid={Boolean(errores.nombre)} required maxLength={50}/><Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Apellidos</Form.Label><Form.Control name="apellidos" value={datos.apellidos} onChange={cambiarCampo} isInvalid={Boolean(errores.apellidos)} required maxLength={100}/><Form.Control.Feedback type="invalid">{errores.apellidos}</Form.Control.Feedback></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Teléfono</Form.Label><Form.Control name="telefono" type="tel" value={datos.telefono || ""} onChange={cambiarCampo} isInvalid={Boolean(errores.telefono)} placeholder="+56912345678"/><Form.Control.Feedback type="invalid">{errores.telefono}</Form.Control.Feedback></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Dirección</Form.Label><Form.Control name="direccion" value={datos.direccion || ""} onChange={cambiarCampo} maxLength={200}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Región</Form.Label><Form.Control name="region" value={datos.region || ""} onChange={cambiarCampo} placeholder="Ej. Metropolitana"/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Comuna</Form.Label><Form.Control name="comuna" value={datos.comuna || ""} onChange={cambiarCampo} placeholder="Ej. Santiago"/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Rol</Form.Label><Form.Select name="rol" value={datos.rol || "Tutor"} onChange={cambiarCampo}><option value="Tutor">Tutor</option><option value="Administrador">Administrador</option></Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Estado</Form.Label><Form.Select name="estado" value={datos.estado || "Activo"} onChange={cambiarCampo}><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></Form.Select></Form.Group></Col>
            </Row>
          </Modal.Body>
          <Modal.Footer><Button variant="outline-secondary" onClick={cerrarEdicion}>Cancelar</Button><Button type="submit" className="admin-btn-guardar"><i className="bi bi-check2 me-1" aria-hidden="true"/>Guardar cambios</Button></Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
}

export default Usuarios;
