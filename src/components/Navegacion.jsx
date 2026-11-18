import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ROLES, cerrarSesion, obtenerUsuarioSesion } from "../utils/sesion";

function Navegacion() {
  const navigate = useNavigate();
  // Al cambiar de página se vuelve a leer la sesión, así el menú se actualiza tras entrar o salir.
  useLocation();
  const usuario = obtenerUsuarioSesion();

  function salir() {
    cerrarSesion();
    navigate("/", { replace: true });
  }

  return (
    <Navbar expand="md" variant="dark" className="navbar-sanmarcos py-3" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center gap-2">
          <img src="/img/logo-veterinaria-header.png" alt="" height="40" />
          Veterinaria San Marcos
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/servicios">
              Servicios
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">
              Contacto
            </Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros">
              Nosotros
            </Nav.Link>
            <Nav.Link as={NavLink} to="/tienda">
              Tienda
            </Nav.Link>
            <Nav.Link as={NavLink} to="/blog">
              Blog
            </Nav.Link>
            {usuario?.rol === ROLES.tutor && (
              <Nav.Link as={NavLink} to="/mi-perfil">
                Mi perfil
              </Nav.Link>
            )}
            {usuario?.rol === ROLES.recepcionista && (
              <Nav.Link as={NavLink} to="/recepcion">
                Recepción
              </Nav.Link>
            )}
            {usuario?.rol === ROLES.administrador && (
              <Nav.Link as={NavLink} to="/admin/usuarios">
                Administración
              </Nav.Link>
            )}
            {usuario ? (
              <Nav.Link as="button" type="button" onClick={salir}>
                Cerrar sesión
              </Nav.Link>
            ) : (
              <Nav.Link as={NavLink} to="/login">
                Iniciar sesión
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navegacion;
