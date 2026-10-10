import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function PasoTutor({ usuario, cita, onContinuar, onAtras }) {
  // Teléfono y correo se pueden ajustar para esta cita; el resto viene de la cuenta
  const [datos, setDatos] = useState({
    telefono: cita.tutor ? cita.tutor.telefono : usuario.telefono,
    correo: cita.tutor ? cita.tutor.correo : usuario.correo,
    medioRecordatorio: cita.tutor ? cita.tutor.medioRecordatorio : "Correo",
  });
  const [errores, setErrores] = useState({});

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};

    const telefono = datos.telefono.trim();
    const correo = datos.correo.trim();

    if (!telefono) nuevosErrores.telefono = "El teléfono es obligatorio";
    else if (!/^\+?\d{8,12}$/.test(telefono)) {
      nuevosErrores.telefono = "Ingresa solo números (8 a 12 dígitos), ej: +56912345678";
    }

    const formatoCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correo) nuevosErrores.correo = "El correo es obligatorio";
    else if (!correo.includes("@")) nuevosErrores.correo = "El correo debe contener @";
    else if (!formatoCorreoValido) nuevosErrores.correo = "Ingresa un correo válido, ej: nombre@dominio.cl";
    else if (correo.length > 100) nuevosErrores.correo = "Máximo 100 caracteres";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onContinuar({
      run: usuario.run,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono,
      correo,
      medioRecordatorio: datos.medioRecordatorio,
    });
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <h2 className="h4 mb-2">Datos del tutor</h2>
      <p className="text-secondary">
        Los usaremos para confirmar tu cita y recordártela. El RUN y el nombre vienen de tu cuenta; para
        cambiarlos ve a <Link to="/mi-perfil">Mi perfil</Link>.
      </p>

      <Row className="g-3">
        <Col xs={12} md={6}>
          <Form.Group controlId="tutor-run">
            <Form.Label>RUN</Form.Label>
            <Form.Control type="text" value={usuario.run} readOnly disabled />
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="tutor-nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" value={usuario.nombre} readOnly disabled />
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group controlId="tutor-apellidos">
            <Form.Label>Apellidos</Form.Label>
            <Form.Control type="text" value={usuario.apellidos} readOnly disabled />
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="tutor-telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              name="telefono"
              type="tel"
              placeholder="+56912345678"
              value={datos.telefono}
              onChange={cambiar}
              isInvalid={Boolean(errores.telefono)}
            />
            <Form.Control.Feedback type="invalid">{errores.telefono}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="tutor-correo">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              name="correo"
              type="email"
              maxLength={100}
              value={datos.correo}
              onChange={cambiar}
              isInvalid={Boolean(errores.correo)}
            />
            <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Label as="legend" className="form-label">
            ¿Cómo prefieres recibir la confirmación y el recordatorio?
          </Form.Label>
          <Form.Check
            id="medio-correo"
            type="radio"
            name="medioRecordatorio"
            value="Correo"
            label="Por correo electrónico"
            checked={datos.medioRecordatorio === "Correo"}
            onChange={cambiar}
          />
          <Form.Check
            id="medio-telefono"
            type="radio"
            name="medioRecordatorio"
            value="Teléfono"
            label="Por teléfono (llamada o mensaje)"
            checked={datos.medioRecordatorio === "Teléfono"}
            onChange={cambiar}
          />
        </Col>
      </Row>

      <div className="d-flex gap-2 mt-4">
        <Button type="button" variant="outline-secondary" onClick={onAtras}>
          Atrás
        </Button>
        <Button type="submit" className="btn-contacto">
          Continuar
        </Button>
      </div>
    </Form>
  );
}

export default PasoTutor;