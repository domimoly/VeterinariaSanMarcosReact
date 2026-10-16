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
        <Link to="/agendar-cita" className="boton-agenda">
          Agendar visita
        </Link>
      </div>
      <div className="col-12 col-md-6">
        <img
          src={variante.imagen}
          alt={variante.imagenAlt}
          className="img-fluid rounded shadow detalle-servicio-imagen"
        />
      </div>
    </section>
  );
}

export default TarjetaDetalleServicio;