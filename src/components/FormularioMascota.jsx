import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { especies } from "../data/mascotas";
import { hoyIso } from "../utils/fechas";

const inicial = {
  nombre: "",
  especie: "",
  raza: "",
  sexo: "",
  fechaNacimiento: "",
  peso: "",
  esterilizado: false,
  observaciones: "",
};

function FormularioMascota({ mascota, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(mascota ?? inicial);
  const [errores, setErrores] = useState({});

  const hoy = hoyIso();

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target;
    setDatos({ ...datos, [name]: type === "checkbox" ? checked : value });
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};

    const nombre = datos.nombre.trim();
    const raza = datos.raza.trim();
    const observaciones = datos.observaciones.trim();
    const peso = Number(datos.peso);

    if (!nombre) nuevosErrores.nombre = "El nombre es obligatorio";
    else if (nombre.length < 2) nuevosErrores.nombre = "Mínimo 2 caracteres";
    else if (nombre.length > 50) nuevosErrores.nombre = "Máximo 50 caracteres";

    if (!datos.especie) nuevosErrores.especie = "Selecciona una especie";
    if (raza.length > 50) nuevosErrores.raza = "Máximo 50 caracteres";
    if (!datos.sexo) nuevosErrores.sexo = "Selecciona el sexo";

    if (!datos.fechaNacimiento) nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    else if (datos.fechaNacimiento > hoy) nuevosErrores.fechaNacimiento = "La fecha no puede ser futura";

    if (datos.peso === "") nuevosErrores.peso = "El peso es obligatorio";
    else if (peso <= 0) nuevosErrores.peso = "El peso debe ser mayor a 0";
    else if (peso > 100) nuevosErrores.peso = "El peso no puede superar los 100 kg";

    if (observaciones.length > 300) nuevosErrores.observaciones = "Máximo 300 caracteres";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onGuardar({ ...datos, nombre, raza, observaciones, peso });
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Form.Group controlId="mascota-nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              type="text"
              maxLength={50}
              placeholder="Ej: Max"
              value={datos.nombre}
              onChange={cambiar}
              isInvalid={Boolean(errores.nombre)}
            />
            <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="mascota-especie">
            <Form.Label>Especie</Form.Label>
            <Form.Select
              name="especie"
              value={datos.especie}
              onChange={cambiar}
              isInvalid={Boolean(errores.especie)}
            >
              <option value="">Seleccione especie</option>
              {especies.map((especie) => (
                <option key={especie} value={especie}>
                  {especie}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errores.especie}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="mascota-raza">
            <Form.Label>Raza (opcional)</Form.Label>
            <Form.Control
              name="raza"
              type="text"
              maxLength={50}
              placeholder="Ej: Labrador"
              value={datos.raza}
              onChange={cambiar}
              isInvalid={Boolean(errores.raza)}
            />
            <Form.Control.Feedback type="invalid">{errores.raza}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="mascota-sexo">
            <Form.Label>Sexo</Form.Label>
            <Form.Select
              name="sexo"
              value={datos.sexo}
              onChange={cambiar}
              isInvalid={Boolean(errores.sexo)}
            >
              <option value="">Seleccione sexo</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errores.sexo}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="mascota-fecha">
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
          <Form.Group controlId="mascota-peso">
            <Form.Label>Peso (kg)</Form.Label>
            <Form.Control
              name="peso"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 4.5"
              value={datos.peso}
              onChange={cambiar}
              isInvalid={Boolean(errores.peso)}
            />
            <Form.Control.Feedback type="invalid">{errores.peso}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Check
            id="mascota-esterilizado"
            name="esterilizado"
            type="checkbox"
            label="Esterilizado/a"
            checked={datos.esterilizado}
            onChange={cambiar}
          />
        </Col>

        <Col xs={12}>
          <Form.Group controlId="mascota-observaciones">
            <Form.Label>Alergias u observaciones (opcional)</Form.Label>
            <Form.Control
              name="observaciones"
              as="textarea"
              rows={3}
              maxLength={300}
              value={datos.observaciones}
              onChange={cambiar}
              isInvalid={Boolean(errores.observaciones)}
            />
            <Form.Control.Feedback type="invalid">{errores.observaciones}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex gap-2 mt-4">
        <Button type="submit" className="btn-contacto">
          {mascota ? "Guardar cambios" : "Agregar mascota"}
        </Button>
        <Button type="button" variant="outline-secondary" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
}

export default FormularioMascota;