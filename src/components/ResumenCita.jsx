import { clinica } from "../data/clinica";
import { formatearFecha } from "../utils/fechas";

function FilaResumen({ titulo, valor }) {
  return (
    <div className="resumen-cita-fila">
      <dt>{titulo}</dt>
      <dd className="mb-0">{valor || <span className="text-secondary">Pendiente</span>}</dd>
    </div>
  );
}

function ResumenCita({ cita }) {
  const mascota = cita.mascota ? `${cita.mascota.nombre} (${cita.mascota.especie})` : "";
  const fechaHora = cita.fecha && cita.hora ? `${formatearFecha(cita.fecha)} a las ${cita.hora}` : "";

  return (
    <aside className="resumen-cita" aria-label="Resumen de tu cita">
      <h2 className="h5 mb-3">Resumen de tu cita</h2>

      <dl className="mb-0">
        <FilaResumen titulo="Mascota" valor={mascota} />
        <FilaResumen titulo="Servicio" valor={cita.servicio ? cita.servicio.nombre : ""} />
        <FilaResumen titulo="Fecha y hora" valor={fechaHora} />
        <FilaResumen titulo="Lugar" valor={clinica.direccion} />
        <FilaResumen titulo="Duración" valor={cita.servicio ? cita.servicio.duracion : ""} />
      </dl>

      <div className="resumen-cita-total">
        <span>Valor</span>
        <strong>{cita.servicio ? cita.servicio.precio : "—"}</strong>
      </div>

      <p className="small text-secondary mt-3 mb-0">
        Tu solicitud quedará pendiente hasta que la clínica la confirme.
      </p>
    </aside>
  );
}

export default ResumenCita;