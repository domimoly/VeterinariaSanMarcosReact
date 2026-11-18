import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { registrarTutor } from "../services/authService";
import { guardarSesion, rutaInicialDelRol } from "../utils/sesion";

const formularioVacio = { nombre: "", correo: "", password: "", repetir: "" };

// Validaciones del mismo nivel que el backend (ms-auth vuelve a validar todo).
function validar(datos) {
  const errores = {};
  const nombre = datos.nombre.trim();
  if (!nombre) errores.nombre = "El nombre es obligatorio.";
  else if (nombre.length < 2 || nombre.length > 80) errores.nombre = "El nombre debe tener entre 2 y 80 caracteres.";

  if (!datos.correo.trim()) errores.correo = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) errores.correo = "El correo no tiene un formato válido.";

  if (!datos.password) errores.password = "La contraseña es obligatoria.";
  else if (datos.password.length < 6 || datos.password.length > 64) errores.password = "La contraseña debe tener entre 6 y 64 caracteres.";

  if (datos.repetir !== datos.password) errores.repetir = "Las contraseñas no coinciden.";
  return errores;
}

function Registro() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(formularioVacio);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorGeneral("");
    const nuevosErrores = validar(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    setEnviando(true);
    try {
      const sesion = await registrarTutor({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        password: datos.password,
      });
      guardarSesion(sesion);
      navigate(rutaInicialDelRol(sesion.rol), { replace: true });
    } catch (e) {
      if (e.estado === 409) setErrores({ correo: e.message });
      else setErrorGeneral(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: "500px" }}>
      <section className="perfil-caja">
        <h1 className="h3 text-center mb-4">Crear cuenta de tutor</h1>
        <Form onSubmit={enviar} noValidate>
          <Form.Group className="mb-3" controlId="nombreRegistro">
            <Form.Label>Nombre completo</Form.Label>
            <Form.Control name="nombre" value={datos.nombre} onChange={cambiar} isInvalid={!!errores.nombre} />
            <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="correoRegistro">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              autoComplete="username"
              value={datos.correo}
              onChange={cambiar}
              isInvalid={!!errores.correo}
            />
            <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="passRegistro">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              autoComplete="new-password"
              value={datos.password}
              onChange={cambiar}
              isInvalid={!!errores.password}
            />
            <Form.Control.Feedback type="invalid">{errores.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="repetirRegistro">
            <Form.Label>Repetir contraseña</Form.Label>
            <Form.Control
              type="password"
              name="repetir"
              autoComplete="new-password"
              value={datos.repetir}
              onChange={cambiar}
              isInvalid={!!errores.repetir}
            />
            <Form.Control.Feedback type="invalid">{errores.repetir}</Form.Control.Feedback>
          </Form.Group>

          {errorGeneral && (
            <p className="text-danger small fw-bold mb-3" role="alert">
              {errorGeneral}
            </p>
          )}

          <Button type="submit" className="btn-contacto w-100" disabled={enviando}>
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </Form>
        <p className="text-center small mt-4 mb-0">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}

export default Registro;
