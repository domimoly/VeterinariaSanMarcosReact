import { Table } from "react-bootstrap";
import { estadoControl, etiquetasEstado, formatearFecha } from "../utils/fechas";

function TablaControles({ titulo, columnaNombre, filas }) {
  return (
    <div className="mb-4">
      <h3 className="h5">{titulo}</h3>

      {filas.length === 0 ? (
        <p className="text-secondary">Sin registros.</p>
      ) : (
        <Table responsive hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>{columnaNombre}</th>
              <th>Fecha aplicada</th>
              <th>Próxima dosis</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => {
              const estado = estadoControl(fila.proximaDosis);
              return (
                <tr key={fila.id}>
                  <td>{fila.nombre}</td>
                  <td>{formatearFecha(fila.fecha)}</td>
                  <td>{formatearFecha(fila.proximaDosis)}</td>
                  <td>
                    <span className={`estado-control estado-${estado}`}>{etiquetasEstado[estado]}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default TablaControles;