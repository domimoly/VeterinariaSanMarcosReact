import { useState } from "react";
import { Alert, Form } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import TablaControles from "./TablaControles";
import TarjetaConsulta from "./TarjetaConsulta";
import { useFicha } from "../../hooks/useFicha";
import { estadoControl, etiquetasEstado, formatearFecha } from "../../utils/fechas";

// La ficha de la mascota elegida viene de ms-fichas
function HistorialMascota({ mascotas }) {
  const [idSeleccionado, setIdSeleccionado] = useState("");

  const mascota = mascotas.find((m) => String(m.id) === idSeleccionado) ?? mascotas[0];
  const { ficha, cargando, error, sesionVencida, recargar } = useFicha(mascota?.id);

  if (!mascota) {
    return <p className="text-secondary mb-0">Registra una mascota para ver su ficha clínica.</p>;
  }

  // El token venció mientras se consultaba la ficha
  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  const consultas = [...ficha.consultas].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const avisos = [...ficha.vacunas, ...ficha.desparasitaciones].filter(
    (control) => estadoControl(control.proximaDosis) !== "aldia"
  );

  return (
    <div>
      <Form.Group controlId="ficha-mascota" className="mb-4">
        <Form.Label>Mascota</Form.Label>
        <Form.Select value={String(mascota.id)} onChange={(evento) => setIdSeleccionado(evento.target.value)}>
          {mascotas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre} ({m.especie})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {cargando && (
        <p className="text-secondary" role="status">
          Cargando la ficha...
        </p>
      )}

      {!cargando && error && (
        <Alert variant="danger" role="alert">
          {error}{" "}
          <Alert.Link as="button" type="button" onClick={recargar}>
            Reintentar
          </Alert.Link>
        </Alert>
      )}

      {avisos.length > 0 && (
        <div className="aviso-vencimiento mb-4" role="alert">
          <strong>Atención: {mascota.nombre} tiene controles pendientes</strong>
          <ul className="mb-0 mt-2">
            {avisos.map((control) => (
              <li key={`${control.nombre}-${control.proximaDosis}`}>
                {control.nombre}: {etiquetasEstado[estadoControl(control.proximaDosis)].toLowerCase()} (
                {formatearFecha(control.proximaDosis)})
              </li>
            ))}
          </ul>
        </div>
      )}

      <TablaControles titulo="Historial de vacunación" columnaNombre="Vacuna" filas={ficha.vacunas} />
      <TablaControles titulo="Desparasitaciones" columnaNombre="Producto" filas={ficha.desparasitaciones} />

      <h3 className="h5">Consultas y tratamientos</h3>
      {consultas.length === 0 ? (
        <p className="text-secondary mb-0">Esta mascota aún no tiene consultas registradas.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {consultas.map((consulta) => (
            <TarjetaConsulta key={consulta.id} consulta={consulta} />
          ))}
        </div>
      )}

      <p className="small text-secondary mt-4 mb-0">
        Esta ficha la registra el equipo de la clínica. Si ves algún dato incorrecto, contáctanos.
      </p>
    </div>
  );
}

export default HistorialMascota;
