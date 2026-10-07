import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const inicial = { nombre: "", apellido: "", correo: "", comentario: "" };

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

    if (!datos.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    else if (datos.nombre.trim().length < 2) nuevosErrores.nombre = "Mínimo 2 caracteres";
    else if (datos.nombre.trim().length > 50) nuevosErrores.nombre = "Máximo 50 caracteres";

    if (!datos.apellido.trim()) nuevosErrores.apellido = "El apellido es obligatorio";
    else if (datos.apellido.trim().length < 2) nuevosErrores.apellido = "Mínimo 2 caracteres";
    else if (datos.apellido.trim().length > 100) nuevosErrores.apellido = "Máximo 100 caracteres";

    const correo = datos.correo.trim();
    const formatoCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    if (!correo) nuevosErrores.correo = "El correo es obligatorio";
    else if (!correo.includes("@")) nuevosErrores.correo = "El correo debe contener @";
    else if (!formatoCorreoValido) nuevosErrores.correo = "Ingresa un correo válido, ej: nombre@dominio.cl";

    const comentario = datos.comentario.trim();

    if (!comentario) nuevosErrores.comentario = "Cuéntanos brevemente tu duda o comentario";
    else if (comentario.length < 10) nuevosErrores.comentario = "Escribe al menos 10 caracteres";
    else if (comentario.length > 500) nuevosErrores.comentario = "Máximo 500 caracteres";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      setMensajeExito("Revisa los campos marcados");
      return;
    }

    const nombre = datos.nombre.trim();
    const apellido = datos.apellido.trim();
    onEnviar({
      nombre,
      apellido,
      correo,
      comentario,
      fecha: new Date().toISOString(),
    });
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
          placeholder="Ej: Juan"
          value={datos.nombre}
          onChange={cambiar}
          isInvalid={Boolean(errores.nombre)}
        />
        <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="apellido">
        <Form.Label>Apellido</Form.Label>
        <Form.Control
          name="apellido"
          type="text"
          maxLength={100}
          placeholder="Ej: Pérez"
          value={datos.apellido}
          onChange={cambiar}
          isInvalid={Boolean(errores.apellido)}
        />
        <Form.Control.Feedback type="invalid">{errores.apellido}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="correo">
        <Form.Label>Correo</Form.Label>
        <Form.Control
          name="correo"
          type="email"
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