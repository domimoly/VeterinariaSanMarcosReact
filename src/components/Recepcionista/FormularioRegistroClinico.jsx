import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { hoyIso } from "../../utils/fechas";

const inicialControl = { nombre: "", fecha: "", proximaDosis: "" };
const inicialConsulta = { fecha: "", motivo: "", diagnostico: "", medicamentos: "", veterinario: "", proximoControl: "" };

const etiquetasNombre = { vacunas: "Vacuna", desparasitaciones: "Producto" };

function FormularioRegistroClinico({ tipo, registro, onGuardar, onCancelar }) {
  const esConsulta = tipo === "consultas";
  const [datos, setDatos] = useState(registro ?? (esConsulta ? inicialConsulta : inicialControl));
  const [errores, setErrores] = useState({});
  const hoy = hoyIso();

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  function validarControl() {
    const nuevos = {};
    const nombre = datos.nombre.trim();

    if (!nombre) nuevos.nombre = "El nombre es obligatorio";
    else if (nombre.length < 2) nuevos.nombre = "Mínimo 2 caracteres";
    else if (nombre.length > 80) nuevos.nombre = "Máximo 80 caracteres";

    if (!datos.fecha) nuevos.fecha = "La fecha de aplicación es obligatoria";
    else if (datos.fecha > hoy) nuevos.fecha = "La fecha no puede ser futura";

    if (!datos.proximaDosis) nuevos.proximaDosis = "La próxima dosis es obligatoria";
    else if (datos.fecha && datos.proximaDosis <= datos.fecha) {
      nuevos.proximaDosis = "Debe ser posterior a la fecha de aplicación";
    }
    return nuevos;
  }

  function validarConsulta() {
    const nuevos = {};
    const motivo = datos.motivo.trim();
    const diagnostico = datos.diagnostico.trim();
    const veterinario = datos.veterinario.trim();

    if (!datos.fecha) nuevos.fecha = "La fecha es obligatoria";
    else if (datos.fecha > hoy) nuevos.fecha = "La fecha no puede ser futura";

    if (!motivo) nuevos.motivo = "El motivo es obligatorio";
    else if (motivo.length > 100) nuevos.motivo = "Máximo 100 caracteres";

    if (!diagnostico) nuevos.diagnostico = "El diagnóstico es obligatorio";
    else if (diagnostico.length > 300) nuevos.diagnostico = "Máximo 300 caracteres";

    if (datos.medicamentos.trim().length > 300) nuevos.medicamentos = "Máximo 300 caracteres";

    if (!veterinario) nuevos.veterinario = "El veterinario es obligatorio";
    else if (veterinario.length > 80) nuevos.veterinario = "Máximo 80 caracteres";

    if (datos.proximoControl && datos.fecha && datos.proximoControl <= datos.fecha) {
      nuevos.proximoControl = "Debe ser posterior a la fecha de la consulta";
    }
    return nuevos;
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevos = esConsulta ? validarConsulta() : validarControl();

    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    if (esConsulta) {
      onGuardar({
        fecha: datos.fecha,
        motivo: datos.motivo.trim(),
        diagnostico: datos.diagnostico.trim(),
        medicamentos: datos.medicamentos.trim() || "Ninguno",
        veterinario: datos.veterinario.trim(),
        proximoControl: datos.proximoControl,
      });
    } else {
      onGuardar({ nombre: datos.nombre.trim(), fecha: datos.fecha, proximaDosis: datos.proximaDosis });
    }
  }

  const campo = (nombre, etiqueta, propiedades = {}) => (
    <Form.Group controlId={`reg-${nombre}`}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Control
        name={nombre}
        value={datos[nombre]}
        onChange={cambiar}
        isInvalid={Boolean(errores[nombre])}
        {...propiedades}
      />
      <Form.Control.Feedback type="invalid">{errores[nombre]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <Form onSubmit={enviar} noValidate className="registro-formulario mb-4">
      <Row className="g-3">
        {esConsulta ? (
          <>
            <Col xs={12} md={4}>{campo("fecha", "Fecha", { type: "date", max: hoy })}</Col>
            <Col xs={12} md={8}>{campo("motivo", "Motivo", { type: "text", maxLength: 100 })}</Col>
            <Col xs={12}>{campo("diagnostico", "Diagnóstico", { as: "textarea", rows: 2, maxLength: 300 })}</Col>
            <Col xs={12}>{campo("medicamentos", "Medicamentos (opcional)", { type: "text", maxLength: 300 })}</Col>
            <Col xs={12} md={6}>{campo("veterinario", "Veterinario", { type: "text", maxLength: 80 })}</Col>
            <Col xs={12} md={6}>{campo("proximoControl", "Próximo control (opcional)", { type: "date" })}</Col>
          </>
        ) : (
          <>
            <Col xs={12}>{campo("nombre", etiquetasNombre[tipo], { type: "text", maxLength: 80 })}</Col>
            <Col xs={12} md={6}>{campo("fecha", "Fecha de aplicación", { type: "date", max: hoy })}</Col>
            <Col xs={12} md={6}>{campo("proximaDosis", "Próxima dosis", { type: "date" })}</Col>
          </>
        )}
      </Row>

      <div className="d-flex gap-2 mt-3">
        <Button type="submit" className="btn-contacto">
          {registro ? "Guardar cambios" : "Guardar registro"}
        </Button>
        <Button type="button" variant="outline-secondary" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
}

export default FormularioRegistroClinico;
