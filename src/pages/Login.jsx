import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const manejarLogin = (e) => {
    e.preventDefault();
    
    // Un intento fallido no debe conservar una sesión administrativa anterior.
    sessionStorage.removeItem("adminVeterinariaAutenticado");

    // Validación de demostración del administrador.
    if (correo.trim().toLowerCase() === "admin@duoc.cl" && password === "admin123") {
      const usuarioAdmin = {
        run: "11111111-1",
        nombre: "Administrador",
        apellidos: "San Marcos",
        correo: "admin@duoc.cl",
        telefono: "+56900000000",
        direccion: "Av. San Marcos 123",
        region: "ohiggins",
        comuna: "Rancagua",
        rol: "Administrador", // Este rol es la clave para que MiPerfil u otras vistas cambien
      };

      // La sesión del usuario se conserva en localStorage; la autorización de
      // administración solo vive en esta pestaña y se crea tras validar el login.
      localStorage.setItem("usuarioVeterinariaSanMarcos", JSON.stringify(usuarioAdmin));
      sessionStorage.setItem("adminVeterinariaAutenticado", "true");
      navigate("/admin/usuarios", { replace: true });
    } else {
      setError("Correo o contraseña incorrectos");
    }
  };

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
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </Form.Group>

          {error && <p className="text-danger small fw-bold mb-3">{error}</p>}

          <Button type="submit" className="btn-contacto w-100">
            Ingresar
          </Button>
        </Form>
      </section>
    </main>
  );
}

export default Login;