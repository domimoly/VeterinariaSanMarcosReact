import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { regiones } from "../data/regiones";
import { hoyIso } from "../utils/fechas";

function FormularioPerfil({ usuario, onGuardar }) {
  const [datos, setDatos] = useState(usuario);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  const comunasDisponibles = regiones.find((region) => region.id === datos.region)?.comunas ?? [];
  const hoy = hoyIso();

  function cambiar(evento) {
    const { name, value } = evento.target;
    if (name === "region") {
      setDatos({ ...datos, region: value, comuna: "" });
    } else {
      setDatos({ ...datos, [name]: value });
    }
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};

    const nombre = datos.nombre.trim();
    const apellidos = datos.apellidos.trim();
    const correo = datos.correo.trim();
    const telefono = datos.telefono.trim();
    const direccion = datos.direccion.trim();

    if (!nombre) nuevosErrores.nombre = "El nombre es obligatorio";
    else if (nombre.length < 2) nuevosErrores.nombre = "Mínimo 2 caracteres";
    else if (nombre.length > 50) nuevosErrores.nombre = "Máximo 50 caracteres";

    if (!apellidos) nuevosErrores.apellidos = "Los apellidos son obligatorios";
    else if (apellidos.length < 2) nuevosErrores.apellidos = "Mínimo 2 caracteres";
    else if (apellidos.length > 100) nuevosErrores.apellidos = "Máximo 100 caracteres";

    if (!datos.fechaNacimiento) nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    else if (datos.fechaNacimiento > hoy) nuevosErrores.fechaNacimiento = "La fecha no puede ser futura";

    if (telefono && !/^\+?\d{8,12}$/.test(telefono)) {
      nuevosErrores.telefono = "Ingresa solo números (8 a 12 dígitos), ej: +56912345678";
    }

    if (!datos.region) nuevosErrores.region = "Selecciona una región";
    if (!datos.comuna) nuevosErrores.comuna = "Selecciona una comuna";

    if (!direccion) nuevosErrores.direccion = "La dirección es obligatoria";
    else if (direccion.length > 300) nuevosErrores.direccion = "Máximo 300 caracteres";

    const formatoCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correo) nuevosErrores.correo = "El correo es obligatorio";
    else if (!correo.includes("@")) nuevosErrores.correo = "El correo debe contener @";
    else if (!formatoCorreoValido) nuevosErrores.correo = "Ingresa un correo válido, ej: nombre@dominio.cl";
    else if (correo.length > 100) nuevosErrores.correo = "Máximo 100 caracteres";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      setMensaje("Revisa los campos marcados");
      return;
    }

    onGuardar({ ...datos, nombre, apellidos, correo, telefono, direccion });
    setMensaje("Tus datos se guardaron correctamente.");
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Form.Group controlId="run">
            <Form.Label>RUN</Form.Label>
            <Form.Control name="run" type="text" value={datos.run} readOnly disabled />
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="fechaNacimiento">
            <Form.Label>Fecha de nacimiento</Form.Label>
            <Form.Control
              name="fechaNacimiento"
              type="date"
              max={hoy}
              value={datos.fechaNacimiento}
              onChange={cambiar}
              isInvalid={Boolean(errores.fechaNacimiento)}
            />
            <Form.Control.Feedback type="invalid">{errores.fechaNacimiento}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              type="text"
              maxLength={50}
              value={datos.nombre}
              onChange={cambiar}
              isInvalid={Boolean(errores.nombre)}
            />
            <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="apellidos">
            <Form.Label>Apellidos</Form.Label>
            <Form.Control
              name="apellidos"
              type="text"
              maxLength={100}
              value={datos.apellidos}
              onChange={cambiar}
              isInvalid={Boolean(errores.apellidos)}
            />
            <Form.Control.Feedback type="invalid">{errores.apellidos}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="correo">
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

        <Col xs={12} md={6}>
          <Form.Group controlId="telefono">
            <Form.Label>Teléfono (opcional)</Form.Label>
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
          <Form.Group controlId="region">
            <Form.Label>Región</Form.Label>
            <Form.Select
              name="region"
              value={datos.region}
              onChange={cambiar}
              isInvalid={Boolean(errores.region)}
            >
              <option value="">Seleccione región</option>
              {regiones.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errores.region}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="comuna">
            <Form.Label>Comuna</Form.Label>
            <Form.Select
              name="comuna"
              value={datos.comuna}
              onChange={cambiar}
              disabled={!datos.region}
              isInvalid={Boolean(errores.comuna)}
            >
              <option value="">Seleccione comuna</option>
              {comunasDisponibles.map((comuna) => (
                <option key={comuna} value={comuna}>
                  {comuna}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errores.comuna}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group controlId="direccion">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              name="direccion"
              type="text"
              maxLength={300}
              value={datos.direccion}
              onChange={cambiar}
              isInvalid={Boolean(errores.direccion)}
            />
            <Form.Control.Feedback type="invalid">{errores.direccion}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Button type="submit" className="btn-contacto mt-4">
        Guardar cambios
      </Button>

      {mensaje && (
        <p
          role="status"
          className={`mt-3 mb-0 fw-bold ${Object.keys(errores).length > 0 ? "text-danger" : "text-success"}`}
        >
          {mensaje}
        </p>
      )}
    </Form>
  );
}

export default FormularioPerfil;