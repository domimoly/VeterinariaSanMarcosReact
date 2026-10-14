import { formatearFecha } from "../utils/fechas";

function TarjetaConsulta({ consulta }) {
  return (
    <div className="tarjeta-consulta">
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <h4 className="h6 mb-0">{consulta.motivo}</h4>
        <small className="text-secondary">{formatearFecha(consulta.fecha)}</small>
      </div>
      <ul className="list-unstyled small mt-2 mb-0">
        <li><strong>Diagnóstico:</strong> {consulta.diagnostico}</li>
        <li><strong>Medicamentos:</strong> {consulta.medicamentos}</li>
        <li><strong>Atendió:</strong> {consulta.veterinario}</li>
        {consulta.proximoControl && (
          <li><strong>Próximo control:</strong> {formatearFecha(consulta.proximoControl)}</li>
        )}
      </ul>
    </div>
  );
}

export default TarjetaConsulta;