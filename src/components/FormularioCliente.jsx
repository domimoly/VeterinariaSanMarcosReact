import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { regiones } from "../data/Tutor/regiones";
import { formatearPrecio } from "../utils/precios";

function FormularioCliente({ datosIniciales, total, onPagar }) {
  const [datos, setDatos] = useState(datosIniciales);
  const [errores, setErrores] = useState({});

  const comunasDisponibles = regiones.find((region) => region.id === datos.region)?.comunas ?? [];

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
    const calle = datos.calle.trim();
    const formatoCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    if (!nombre) nuevosErrores.nombre = "El nombre es obligatorio";
    else if (nombre.length < 2) nuevosErrores.nombre = "Mínimo 2 caracteres";

    if (!apellidos) nuevosErrores.apellidos = "Los apellidos son obligatorios";
    else if (apellidos.length < 2) nuevosErrores.apellidos = "Mínimo 2 caracteres";

    if (!correo) nuevosErrores.correo = "El correo es obligatorio";
    else if (!correo.includes("@")) nuevosErrores.correo = "El correo debe contener @";
    else if (!formatoCorreoValido) nuevosErrores.correo = "Ingresa un correo válido, ej: nombre@dominio.cl";

    if (!calle) nuevosErrores.calle = "La calle es obligatoria";
    if (!datos.region) nuevosErrores.region = "Selecciona una región";
    if (!datos.comuna) nuevosErrores.comuna = "Selecciona una comuna";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onPagar({ ...datos, nombre, apellidos, correo, calle });
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <h2 className="h4">Información del cliente</h2>
      <p className="text-secondary small">Completa la siguiente información</p>
      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <Form.Group controlId="nombre">
            <Form.Label>
              Nombre<span className="text-danger">*</span>
            </Form.Label>
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
            <Form.Label>
              Apellidos<span className="text-danger">*</span>
            </Form.Label>
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
            <Form.Label>
              Correo<span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="correo"
              type="email"
              value={datos.correo}
              onChange={cambiar}
              isInvalid={Boolean(errores.correo)}
            />
            <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <h2 className="h4">Dirección de entrega de los productos</h2>
      <p className="text-secondary small">Ingrese dirección de forma detallada</p>
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Form.Group controlId="calle">
            <Form.Label>
              Calle<span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="calle"
              type="text"
              maxLength={100}
              value={datos.calle}
              onChange={cambiar}
              isInvalid={Boolean(errores.calle)}
            />
            <Form.Control.Feedback type="invalid">{errores.calle}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="departamento">
            <Form.Label>Departamento (opcional)</Form.Label>
            <Form.Control
              name="departamento"
              type="text"
              maxLength={20}
              placeholder="Ej: 603"
              value={datos.departamento}
              onChange={cambiar}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="region">
            <Form.Label>
              Región<span className="text-danger">*</span>
            </Form.Label>
            <Form.Select name="region" value={datos.region} onChange={cambiar} isInvalid={Boolean(errores.region)}>
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
            <Form.Label>
              Comuna<span className="text-danger">*</span>
            </Form.Label>
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
          <Form.Group controlId="indicaciones">
            <Form.Label>Indicaciones para la entrega (opcional)</Form.Label>
            <Form.Control
              name="indicaciones"
              as="textarea"
              rows={3}
              maxLength={300}
              placeholder="Ej.: Entre calles, color del edificio, no tiene timbre."
              value={datos.indicaciones}
              onChange={cambiar}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="text-end mt-3">
        <Button type="submit" className="btn-contacto">
          Pagar ahora {formatearPrecio(total)}
        </Button>
      </div>
    </Form>
  );
}

export default FormularioCliente;
