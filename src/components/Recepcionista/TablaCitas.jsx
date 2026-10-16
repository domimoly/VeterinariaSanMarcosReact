import { Button, Table } from "react-bootstrap";
import { formatearFecha } from "../../utils/fechas";
import { citaEsProxima } from "../../utils/citas";

function TablaCitas({ citas, onConfirmar, onReagendar }) {
  if (citas.length === 0) {
    return <p className="text-secondary mb-0">No hay citas que coincidan con los filtros.</p>;
  }

  return (
    <Table responsive hover className="align-middle mb-0">
      <thead>
        <tr>
          <th>Fecha y hora</th>
          <th>Paciente</th>
          <th>Tutor</th>
          <th>Servicio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {citas.map((cita) => {
          const proxima = citaEsProxima(cita);

          return (
            <tr key={cita.id}>
              <td>
                {formatearFecha(cita.fecha)} {cita.hora}
              </td>
              <td>
                {cita.mascotaNombre} ({cita.especie})
              </td>
              <td>
                {cita.tutor.nombre} {cita.tutor.apellidos}
                <small className="d-block text-secondary">{cita.tutor.telefono}</small>
              </td>
              <td>
                {cita.servicioNombre}
                <small className="d-block text-secondary">{cita.duracion}</small>
              </td>
              <td>
                <span className={`estado-control estado-cita-${cita.estado.toLowerCase()}`}>{cita.estado}</span>
                {cita.nota && <small className="d-block text-secondary mt-1">{cita.nota}</small>}
              </td>
              <td>
                <div className="d-flex gap-2 flex-wrap">
                  {proxima && cita.estado === "Pendiente" && (
                    <Button size="sm" className="btn-servicio" onClick={() => onConfirmar(cita.id)}>
                      Confirmar
                    </Button>
                  )}
                  {proxima && (
                    <Button size="sm" variant="outline-secondary" onClick={() => onReagendar(cita)}>
                      Reagendar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default TablaCitas;
