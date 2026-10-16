import { Button, Table } from "react-bootstrap";
import { estadoControl, etiquetasEstado, formatearFecha } from "../../utils/fechas";

function Acciones({ registro, onEditar, onEliminar }) {
  return (
    <div className="d-flex gap-2 flex-wrap">
      <Button size="sm" variant="outline-secondary" onClick={() => onEditar(registro)}>
        Editar
      </Button>
      <Button size="sm" variant="outline-danger" onClick={() => onEliminar(registro.id)}>
        Eliminar
      </Button>
    </div>
  );
}

function ListaRegistrosClinicos({ tipo, registros, onEditar, onEliminar }) {
  if (registros.length === 0) {
    return <p className="text-secondary">Sin registros.</p>;
  }

  if (tipo === "consultas") {
    return (
      <div className="d-flex flex-column gap-3">
        {registros.map((consulta) => (
          <div className="registro-consulta" key={consulta.id}>
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <h4 className="h6 mb-0">{consulta.motivo}</h4>
              <small className="text-secondary">{formatearFecha(consulta.fecha)}</small>
            </div>
            <ul className="list-unstyled small my-2">
              <li><strong>Diagnóstico:</strong> {consulta.diagnostico}</li>
              <li><strong>Medicamentos:</strong> {consulta.medicamentos}</li>
              <li><strong>Atendió:</strong> {consulta.veterinario}</li>
            </ul>
            <Acciones registro={consulta} onEditar={onEditar} onEliminar={onEliminar} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table responsive hover className="align-middle">
      <thead>
        <tr>
          <th>{tipo === "vacunas" ? "Vacuna" : "Producto"}</th>
          <th>Aplicada</th>
          <th>Próxima dosis</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((registro) => {
          const estado = estadoControl(registro.proximaDosis);
          return (
            <tr key={registro.id}>
              <td>{registro.nombre}</td>
              <td>{formatearFecha(registro.fecha)}</td>
              <td>{formatearFecha(registro.proximaDosis)}</td>
              <td>
                <span className={`estado-control estado-${estado}`}>{etiquetasEstado[estado]}</span>
              </td>
              <td>
                <Acciones registro={registro} onEditar={onEditar} onEliminar={onEliminar} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default ListaRegistrosClinicos;
