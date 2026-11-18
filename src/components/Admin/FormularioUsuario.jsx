import { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { ETIQUETAS_ROL } from "../../services/usuarioService";

const ROLES = Object.keys(ETIQUETAS_ROL);

// Crear (usuario = null) o editar una cuenta. El correo solo se escribe al crear.
// "esCuentaPropia" bloquea el cambio de rol para que el administrador no se quite el acceso.
function FormularioUsuario({ usuario, esCuentaPropia = false, guardando = false, error = "", onGuardar, onCancelar }) {
  const editando = Boolean(usuario);
  const [datos, setDatos] = useState({
    nombre: usuario?.nombre ?? "",
    correo: usuario?.correo ?? "",
    password: "",
    rol: usuario?.rol ?? "TUTOR",
  });
  const [errores, setErrores] = useState({});

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: "" }));
  }

  function validar() {
    const nuevos = {};
    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim();

    if (!nombre) nuevos.nombre = "El nombre es obligatorio";
    else if (nombre.length < 2 || nombre.length > 80) nuevos.nombre = "El nombre debe tener entre 2 y 80 caracteres";

    if (!editando) {
      if (!correo) nuevos.correo = "El correo es obligatorio";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) nuevos.correo = "El correo no tiene un formato válido";
      else if (correo.length > 100) nuevos.correo = "Máximo 100 caracteres";
    }

    // Al editar la contraseña es opcional: vacía significa "no cambiarla"
    if (!editando && !datos.password) nuevos.password = "La contraseña es obligatoria";
    else if (datos.password && (datos.password.length < 6 || datos.password.length > 64)) {
      nuevos.password = "La contraseña debe tener entre 6 y 64 caracteres";
    }
    return nuevos;
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    onGuardar({
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim(),
      password: datos.password,
      rol: datos.rol,
    });
  }

  return (
    <Modal show onHide={onCancelar} centered backdrop="static" className="admin-modal">
      <Form onSubmit={enviar} noValidate>
        <Modal.Header closeButton>
          <div>
            <span className="admin-etiqueta">{editando ? "Editar cuenta" : "Nueva cuenta"}</span>
            <Modal.Title as="h2" className="h5 mb-0">
              {editando ? "Datos del usuario" : "Crear usuario"}
            </Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" role="alert" className="py-2">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="usuario-nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={datos.nombre}
              onChange={cambiar}
              maxLength={80}
              isInvalid={Boolean(errores.nombre)}
            />
            <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="usuario-correo">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={datos.correo}
              onChange={cambiar}
              maxLength={100}
              readOnly={editando}
              isInvalid={Boolean(errores.correo)}
            />
            {editando && (
              <Form.Text className="text-secondary">
                El correo identifica la cuenta y sus datos, por eso no se puede cambiar.
              </Form.Text>
            )}
            <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="usuario-password">
            <Form.Label>{editando ? "Nueva contraseña (opcional)" : "Contraseña"}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={datos.password}
              onChange={cambiar}
              maxLength={64}
              autoComplete="new-password"
              isInvalid={Boolean(errores.password)}
            />
            {editando && <Form.Text className="text-secondary">Déjala vacía para mantener la actual.</Form.Text>}
            <Form.Control.Feedback type="invalid">{errores.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="usuario-rol">
            <Form.Label>Rol</Form.Label>
            <Form.Select name="rol" value={datos.rol} onChange={cambiar} disabled={esCuentaPropia}>
              {ROLES.map((rol) => (
                <option key={rol} value={rol}>
                  {ETIQUETAS_ROL[rol]}
                </option>
              ))}
            </Form.Select>
            {esCuentaPropia && <Form.Text className="text-secondary">No puedes cambiar tu propio rol.</Form.Text>}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" className="admin-btn-guardar" disabled={guardando}>
            {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default FormularioUsuario;
