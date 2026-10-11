import { Button } from "react-bootstrap";
import { clinica } from "../data/clinica";
import { formatearFecha } from "../utils/fechas";
import { citaEsProxima } from "../utils/citas";

function TarjetaCita({ cita, onCancelar }) {
  const estado = cita.estado.toLowerCase();

  return (
    <div className={`tarjeta-cita tarjeta-cita-${estado}`}>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h4 className="h6 mb-1">{cita.servicioNombre}</h4>
          <small className="text-secondary">Código {cita.codigo}</small>
        </div>
        <span className={`estado-control estado-cita-${estado}`}>{cita.estado}</span>
      </div>

      <ul className="list-unstyled small mt-2 mb-0">
        <li><strong>Mascota:</strong> {cita.mascotaNombre} ({cita.especie})</li>
        <li><strong>Fecha y hora:</strong> {formatearFecha(cita.fecha)} a las {cita.hora}</li>
        <li><strong>Lugar:</strong> {clinica.direccion}</li>
        <li><strong>Valor:</strong> {cita.precio}</li>
        {cita.nota && <li className="mt-1"><em>{cita.nota}</em></li>}
      </ul>

      {citaEsProxima(cita) && (
        <Button size="sm" variant="outline-danger" className="mt-3" onClick={() => onCancelar(cita.id)}>
          Cancelar cita
        </Button>
      )}
    </div>
  );
}

export default TarjetaCita;
