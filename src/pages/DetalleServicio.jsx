import { Link, useParams } from "react-router-dom";
import { detalleServicios } from "../data/detalleServicios";

function DetalleServicio() {
  const { categoria } = useParams();
  const datos = detalleServicios[categoria];

  if (!datos) {
    return (
      <main className="container py-5 text-center">
        <h1>Servicio no encontrado</h1>
        <p>La categoría solicitada no existe.</p>
        <Link to="/servicios" className="boton-agenda">
          Volver a Servicios
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <h1 className="text-center mb-4">{datos.titulo}</h1>
      <hr className="mb-5" />

      {datos.variantes.map((variante) => (
        <section
          className="row align-items-center g-4 mb-5 detalle-servicio-fila"
          key={`${variante.nombre}-${variante.subtitulo}`}
        >
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
      ))}

      <div className="text-center">
        <Link to="/servicios" className="boton-agenda">
          ← Volver a todos los servicios
        </Link>
      </div>
    </main>
  );
}

export default DetalleServicio;