import { Link, useParams } from "react-router-dom";
import { detalleServicios } from "../data/detalleServicios";
import TarjetaDetalleServicio from "../components/TarjetaDetalleServicio";

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
        <TarjetaDetalleServicio
          variante={variante}
          key={`${variante.nombre}-${variante.subtitulo}`}
        />
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