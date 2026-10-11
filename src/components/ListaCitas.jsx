import { Link } from "react-router-dom";
import TarjetaCita from "./TarjetaCita";
import { citaEsProxima, fechaHoraDeCita } from "../utils/citas";

function ListaCitas({ citas, onCancelar }) {
  if (citas.length === 0) {
    return (
      <div>
        <p className="text-secondary">Aún no has solicitado citas.</p>
        <Link to="/agendar-cita" className="boton-agenda">
          Agendar cita
        </Link>
      </div>
    );
  }

  const ahora = new Date();
  const proximas = citas
    .filter((cita) => citaEsProxima(cita, ahora))
    .sort((a, b) => fechaHoraDeCita(a) - fechaHoraDeCita(b));
  const anteriores = citas
    .filter((cita) => !citaEsProxima(cita, ahora))
    .sort((a, b) => fechaHoraDeCita(b) - fechaHoraDeCita(a));

  return (
    <div>
      <h3 className="h5">Próximas citas</h3>
      {proximas.length === 0 ? (
        <p className="text-secondary">No tienes citas próximas.</p>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {proximas.map((cita) => (
            <TarjetaCita key={cita.id} cita={cita} onCancelar={onCancelar} />
          ))}
        </div>
      )}

      {anteriores.length > 0 && (
        <>
          <h3 className="h5">Historial</h3>
          <div className="d-flex flex-column gap-3">
            {anteriores.map((cita) => (
              <TarjetaCita key={cita.id} cita={cita} onCancelar={onCancelar} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ListaCitas;
