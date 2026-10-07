import { Link } from "react-router-dom";

function TarjetaServicio({ servicio, claseIcono }) {
  return (
    <div className="card h-100 shadow-sm text-center p-3">
      <i className={`${servicio.icono} fs-1 mb-3 ${claseIcono}`}></i>
      <div className="card-body d-flex flex-column">
        <h3 className="h5">{servicio.nombre}</h3>
        <p className="text-secondary small flex-grow-1">{servicio.descripcion}</p>
        <p className="mb-1">
          <small>Duración aprox: {servicio.duracion}</small>
        </p>
        <p className="fw-bold mb-3">Valor: {servicio.precio}</p>
        <Link to={`/servicios/${servicio.categoriaSlug}`} className="btn btn-sm btn-servicio">
          Conoce más →
        </Link>
      </div>
    </div>
  );
}

export default TarjetaServicio;