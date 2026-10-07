import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const inicial = { nombre: "", correo: "", comentario: "" };

function FormularioContacto({ onEnviar }) {
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};

    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim().toLowerCase();
    const comentario = datos.comentario.trim();

    if (!nombre) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (nombre.length > 50) {
      nuevosErrores.nombre = "Máximo 50 caracteres";
    }

    const formatoCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correo) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!correo.includes("@")) {
      nuevosErrores.correo = "El correo debe contener @";
    } else if (!formatoCorreoValido) {
      nuevosErrores.correo = "Ingresa un correo válido, ej: nombre@dominio.cl";
    }

    if (!comentario) {
      nuevosErrores.comentario = "Cuéntanos brevemente tu duda o comentario";
    } else if (comentario.length < 10) {
      nuevosErrores.comentario = "Escribe al menos 10 caracteres";
    } else if (comentario.length > 500) {
      nuevosErrores.comentario = "Máximo 500 caracteres";
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setMensajeExito("Revisa los campos marcados");
      return;
    }

    onEnviar({ nombre, correo, comentario, fecha: new Date().toISOString() });
    setMensajeExito(`¡Gracias, ${nombre}! Recibimos tu mensaje y te contactaremos pronto.`);
    setDatos(inicial);
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <Form.Group className="mb-3" controlId="nombre">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          name="nombre"
          type="text"
          maxLength={50}
          autoComplete="name"
          placeholder="Ej: Juan Pérez"
          value={datos.nombre}
          onChange={cambiar}
          isInvalid={Boolean(errores.nombre)}
        />
        <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="correo">
        <Form.Label>Correo</Form.Label>
        <Form.Control
          name="correo"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.cl"
          value={datos.correo}
          onChange={cambiar}
          isInvalid={Boolean(errores.correo)}
        />
        <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="comentario">
        <Form.Label>Comentario</Form.Label>
        <Form.Control
          name="comentario"
          as="textarea"
          rows={5}
          maxLength={500}
          placeholder="Cuéntanos en qué podemos ayudarte"
          value={datos.comentario}
          onChange={cambiar}
          isInvalid={Boolean(errores.comentario)}
        />
        <Form.Control.Feedback type="invalid">{errores.comentario}</Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" className="btn-contacto">
        Enviar
      </Button>

      {mensajeExito && (
        <p
          role="status"
          className={`mt-3 mb-0 fw-bold ${Object.keys(errores).length > 0 ? "text-danger" : "text-success"}`}
        >
          {mensajeExito}
        </p>
      )}
    </Form>
  );
}

export default FormularioContacto;