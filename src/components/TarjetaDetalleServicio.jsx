import { Link } from "react-router-dom";

function TarjetaDetalleServicio({ variante }) {
  return (
    <section className="row align-items-center g-4 mb-5 detalle-servicio-fila">
      <div className="col-12 col-md-6">
        <h2 className="h3">
          {variante.nombre} <span className="text-secondary">{variante.subtitulo}</span>
        </h2>
        <p>{variante.descripcion}</p>
        <ul className="list-unstyled d-flex flex-column gap-2">
          {variante.caracteristicas.map((caracteristica) => (
            <li key={caracteristica}>✓ {caracteristica}</li>
          ))}
        </ul>
        <Link to="/contacto" className="boton-agenda">
          Agendar visita
        </Link>
      </div>
      <div className="col-12 col-md-6">
        <div className="detalle-servicio-imagen rounded shadow d-flex align-items-center justify-content-center text-white">
          <span className="p-3 text-center small">{variante.imagenAlt}</span>
        </div>
      </div>
    </section>
  );
}

export default TarjetaDetalleServicio;