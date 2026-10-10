import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import FilaResumen from "./FilaResumen";
import { clinica } from "../data/clinica";
import { formatearFecha } from "../utils/fechas";
import { validarHorario } from "../utils/horarios";

function PasoConfirmacion({ cita, citasGuardadas, onConfirmar, onAtras, onCambiarHora }) {
  const [acepta, setAcepta] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorHorario, setErrorHorario] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};

    if (!acepta) nuevosErrores.acepta = "Debes confirmar que los datos son correctos";

    // Se vuelve a validar la hora por si cambió desde que la elegiste
    const erroresHorario = validarHorario({
      fecha: cita.fecha,
      hora: cita.hora,
      duracionMin: cita.servicio.duracionMin,
      citasGuardadas,
      mascotaId: cita.mascota.id,
    });

    setErrores(nuevosErrores);
    setErrorHorario(erroresHorario.fecha || erroresHorario.hora || "");
    if (Object.keys(nuevosErrores).length > 0 || Object.keys(erroresHorario).length > 0) return;

    const ahora = Date.now();
    onConfirmar({
      id: ahora,
      codigo: `SM-${String(ahora).slice(-6)}`,
      mascotaId: cita.mascota.id,
      mascotaNombre: cita.mascota.nombre,
      especie: cita.mascota.especie,
      servicioId: cita.servicio.id,
      servicioNombre: cita.servicio.nombre,
      duracion: cita.servicio.duracion,
      duracionMin: cita.servicio.duracionMin,
      precio: cita.servicio.precio,
      fecha: cita.fecha,
      hora: cita.hora,
      observaciones: cita.observaciones,
      tutor: cita.tutor,
      estado: "Pendiente",
      creadaEn: new Date(ahora).toISOString(),
    });
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <h2 className="h4 mb-2">Revisa y confirma</h2>
      <p className="text-secondary">Verifica que todo esté correcto antes de enviar tu solicitud.</p>

      <dl className="mb-4">
        <FilaResumen titulo="Mascota" valor={`${cita.mascota.nombre} (${cita.mascota.especie})`} />
        <FilaResumen titulo="Servicio" valor={cita.servicio.nombre} />
        <FilaResumen titulo="Fecha y hora" valor={`${formatearFecha(cita.fecha)} a las ${cita.hora}`} />
        <FilaResumen titulo="Lugar" valor={clinica.direccion} />
        <FilaResumen titulo="Tutor" valor={`${cita.tutor.nombre} ${cita.tutor.apellidos}`} />
        <FilaResumen titulo="Teléfono" valor={cita.tutor.telefono} />
        <FilaResumen titulo="Correo" valor={cita.tutor.correo} />
        <FilaResumen titulo="Recordatorio" valor={`Por ${cita.tutor.medioRecordatorio.toLowerCase()}`} />
        <FilaResumen titulo="Antecedentes" valor={cita.observaciones || "Sin antecedentes"} />
      </dl>

      <div className="aviso-horario mb-4">
        Tu solicitud quedará <strong>pendiente</strong> hasta que la clínica la confirme o te proponga otro
        horario. Te avisaremos por el medio que elegiste.
      </div>

      {errorHorario && (
        <Alert variant="danger" role="alert">
          <strong>No pudimos reservar tu hora.</strong> {errorHorario}
          <div className="mt-2">
            <Button type="button" size="sm" variant="outline-danger" onClick={onCambiarHora}>
              Elegir otra hora
            </Button>
          </div>
        </Alert>
      )}

      <Form.Check
        id="acepta-datos"
        type="checkbox"
        className="mb-4"
        label="Confirmo que los datos ingresados son correctos"
        checked={acepta}
        onChange={(evento) => setAcepta(evento.target.checked)}
        isInvalid={Boolean(errores.acepta)}
        feedback={errores.acepta}
        feedbackType="invalid"
      />

      <div className="d-flex gap-2">
        <Button type="button" variant="outline-secondary" onClick={onAtras}>
          Atrás
        </Button>
        <Button type="submit" className="btn-contacto">
          Solicitar cita
        </Button>
      </div>
    </Form>
  );
}

export default PasoConfirmacion;