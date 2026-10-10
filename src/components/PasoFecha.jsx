import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { agendamiento, horarioTexto } from "../data/clinica";
import {
  bloquesNecesarios,
  diasDeLaSemana,
  etiquetaDia,
  horasDelDia,
  semanaDeFecha,
  validarHorario,
} from "../utils/horarios";

const nombresSemana = ["Esta semana", "Próxima semana", "En 3 semanas", "En 4 semanas"];
const semanas = Array.from({ length: agendamiento.semanasMaximas }, (_, indice) => indice);

function rangoDeSemana(offset) {
  const dias = diasDeLaSemana(offset);
  return `${etiquetaDia(dias[0]).fechaCorta} al ${etiquetaDia(dias[5]).fechaCorta}`;
}

function PasoFecha({ cita, citasGuardadas, onContinuar, onAtras }) {
  const [semana, setSemana] = useState(cita.fecha ? semanaDeFecha(cita.fecha) : 0);
  const [fecha, setFecha] = useState(cita.fecha);
  const [hora, setHora] = useState(cita.hora);
  const [errores, setErrores] = useState({});

  const duracionMin = cita.servicio.duracionMin;
  const bloques = bloquesNecesarios(duracionMin);

  const dias = diasDeLaSemana(semana).map((fechaIso) => {
    const horas = horasDelDia(fechaIso, duracionMin, citasGuardadas);
    return { fechaIso, ...etiquetaDia(fechaIso), horas, hayDisponibles: horas.some((h) => h.disponible) };
  });
  const diaElegido = dias.find((dia) => dia.fechaIso === fecha);

  function cambiarSemana(evento) {
    setSemana(Number(evento.target.value));
    setFecha("");
    setHora("");
  }

  function elegirDia(fechaIso) {
    setFecha(fechaIso);
    setHora("");
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = validarHorario({
      fecha,
      hora,
      duracionMin,
      citasGuardadas,
      mascotaId: cita.mascota.id,
    });

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onContinuar({ fecha, hora });
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <h2 className="h4 mb-2">Elige una hora para visitarnos</h2>
      <p className="text-secondary">
        {cita.servicio.nombre} para {cita.mascota.nombre}
        {bloques > 1 && ` · dura ${cita.servicio.duracion}, por lo que reservaremos ${bloques} bloques de 30 minutos`}.
      </p>

      <Form.Group className="mb-4" controlId="semana">
        <Form.Label>Semana</Form.Label>
        <Form.Select value={semana} onChange={cambiarSemana}>
          {semanas.map((numero) => (
            <option key={numero} value={numero}>
              {nombresSemana[numero]} ({rangoDeSemana(numero)})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <fieldset className="mb-4">
        <legend className="form-label">Día</legend>
        <div className="opciones-dias">
          {dias.map((dia) => (
            <label className="opcion-cita" key={dia.fechaIso}>
              <input
                type="radio"
                name="fecha"
                value={dia.fechaIso}
                checked={fecha === dia.fechaIso}
                onChange={() => elegirDia(dia.fechaIso)}
                disabled={!dia.hayDisponibles}
              />
              <strong>{dia.nombre}</strong>
              <span>{dia.fechaCorta}</span>
              {!dia.hayDisponibles && <small>Sin horas</small>}
            </label>
          ))}
        </div>
        {errores.fecha && <div className="invalid-feedback d-block">{errores.fecha}</div>}
      </fieldset>

      <fieldset className="mb-4">
        <legend className="form-label">Hora</legend>
        {!diaElegido ? (
          <p className="text-secondary">Elige un día para ver las horas disponibles.</p>
        ) : (
          <div className="opciones-horas">
            {diaElegido.horas.map((opcion) => (
              <label className="opcion-cita opcion-hora" key={opcion.hora}>
                <input
                  type="radio"
                  name="hora"
                  value={opcion.hora}
                  checked={hora === opcion.hora}
                  onChange={() => setHora(opcion.hora)}
                  disabled={!opcion.disponible}
                />
                <strong>{opcion.hora}</strong>
              </label>
            ))}
          </div>
        )}
        {errores.hora && <div className="invalid-feedback d-block">{errores.hora}</div>}
        <p className="small text-secondary mt-2 mb-0">Las horas tachadas ya no están disponibles.</p>
      </fieldset>

      <div className="aviso-horario mb-4">
        <strong>Horario de atención</strong>
        <ul className="list-unstyled small mb-0 mt-1">
          {horarioTexto.map((linea) => (
            <li key={linea}>{linea}</li>
          ))}
        </ul>
        <small className="text-secondary">Urgencias: 24 horas, todos los días.</small>
      </div>

      <div className="d-flex gap-2">
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

export default PasoFecha;