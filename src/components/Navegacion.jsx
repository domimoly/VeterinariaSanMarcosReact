import { useState } from "react";
import { Badge, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCantidadCarrito } from "../hooks/useCantidadCarrito";
import { ROLES, cerrarSesion, obtenerUsuarioSesion } from "../utils/sesion";

function Navegacion() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Al cambiar de página se vuelve a leer la sesión, así el menú se actualiza tras entrar o salir.
  useLocation();
  const usuario = obtenerUsuarioSesion();
  const unidadesCarrito = useCantidadCarrito();

  function salir() {
    cerrarSesion();
    navigate("/", { replace: true });
  }

  return (
    <Navbar expand="xl" variant="dark" className="navbar-sanmarcos py-3" sticky="top" expanded={menuAbierto} onToggle={setMenuAbierto}>
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center gap-2">
          <img src="/img/logo-veterinaria-header.png" alt="" height="40" />
          Veterinaria San Marcos
        </Navbar.Brand>
        {/* Fuera del menú plegable para que el carrito se vea siempre, también en el celular */}
        <Nav className="flex-row ms-auto ms-xl-0 me-2 me-xl-0 order-xl-last">
          <Nav.Link
            as={NavLink}
            to="/carrito"
            aria-label={`Carrito, ${unidadesCarrito} producto${unidadesCarrito === 1 ? "" : "s"}`}
          >
            <span aria-hidden="true">🛒</span> <span className="d-none d-sm-inline">Carrito</span>
            {unidadesCarrito > 0 && (
              <Badge pill bg="info" className="ms-1" aria-hidden="true">
                {unidadesCarrito}
              </Badge>
            )}
          </Nav.Link>
        </Nav>
        <Navbar.Toggle aria-controls="menu-principal" />
        {/* Al elegir una opción (cualquier clic dentro del menú) se pliega, para no tapar la página en el celular */}
        <Navbar.Collapse id="menu-principal" onClick={() => setMenuAbierto(false)}>
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
              <>
                <Nav.Link as={NavLink} to="/login">
                  Iniciar sesión
                </Nav.Link>
                <Nav.Link as={NavLink} to="/registro">
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navegacion;
