import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import PasoFecha from "../PasoFecha";
import { formatearFecha } from "../../utils/fechas";

function ReagendarCita({ cita, citasGuardadas, onGuardar, onCancelar }) {
  const [paso, setPaso] = useState(1);
  const [horario, setHorario] = useState(null);
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");

  // PasoFecha espera la solicitud con la forma del agendamiento del tutor
  const citaParaFecha = {
    mascota: { id: cita.mascotaId, nombre: cita.mascotaNombre },
    servicio: { nombre: cita.servicioNombre, duracion: cita.duracion, duracionMin: cita.duracionMin },
    fecha: "",
    hora: "",
  };
  // La cita que se mueve no debe bloquearse a sí misma
  const otrasCitas = citasGuardadas.filter((otra) => otra.id !== cita.id);

  function elegirHorario(datos) {
    setHorario(datos);
    setPaso(2);
  }

  function enviar(evento) {
    evento.preventDefault();
    const texto = nota.trim();

    if (!texto) setError("Explica el motivo del cambio");
    else if (texto.length < 5) setError("Escribe al menos 5 caracteres");
    else if (texto.length > 200) setError("Máximo 200 caracteres");
    else onGuardar({ ...horario, nota: texto });
  }

  return (
    <Modal show onHide={onCancelar} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5">
          Reagendar cita {cita.codigo}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {paso === 1 ? (
          <PasoFecha
            cita={citaParaFecha}
            citasGuardadas={otrasCitas}
            titulo="Elige el nuevo horario"
            textoContinuar="Siguiente"
            textoAtras="Cancelar"
            onContinuar={elegirHorario}
            onAtras={onCancelar}
          />
        ) : (
          <Form onSubmit={enviar} noValidate>
            <p>
              Nuevo horario:{" "}
              <strong>
                {formatearFecha(horario.fecha)} a las {horario.hora}
              </strong>
            </p>

            <Form.Group className="mb-4" controlId="nota-reagendar">
              <Form.Label>Motivo del cambio (lo verá el tutor)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={200}
                value={nota}
                onChange={(evento) => setNota(evento.target.value)}
                isInvalid={Boolean(error)}
              />
              <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="button" variant="outline-secondary" onClick={() => setPaso(1)}>
                Volver
              </Button>
              <Button type="submit" className="btn-contacto">
                Reagendar cita
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ReagendarCita;
