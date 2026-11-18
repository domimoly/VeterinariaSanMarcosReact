import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { login } from "../services/authService";
import { guardarSesion, rutaInicialDelRol } from "../utils/sesion";

function Login() {
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarLogin(e) {
    e.preventDefault();
    setError("");

    if (!correo.trim() || !password) {
      setError("Ingresa tu correo y tu contraseña.");
      return;
    }

    setEnviando(true);
    try {
      const sesion = await login({ correo: correo.trim(), password });
      guardarSesion(sesion);
      // Si venía de una página protegida, vuelve a ella; si no, va a su vista según el rol.
      navigate(ubicacion.state?.desde ?? rutaInicialDelRol(sesion.rol), { replace: true });
    } catch (e) {
      setError(e.estado === 401 ? "Correo o contraseña incorrectos." : e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: "500px" }}>
      <section className="perfil-caja">
        <h1 className="h3 text-center mb-4">Iniciar sesión</h1>
        <Form onSubmit={manejarLogin} noValidate>
          <Form.Group className="mb-3" controlId="correoLogin">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              autoComplete="username"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="passLogin">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {error && (
            <p className="text-danger small fw-bold mb-3" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="btn-contacto w-100" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </Button>
        </Form>
        <p className="text-center small mt-4 mb-0">
          ¿Aún no tienes cuenta? <Link to="/registro">Regístrate como tutor</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
