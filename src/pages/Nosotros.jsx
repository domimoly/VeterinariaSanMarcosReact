import { parrafosPresentacion, puntosImportantes } from "../data/nosotros";
import { resenas } from "../data/resenas";
import TarjetaClinica from "../components/TarjetaClinica";
import TarjetaPuntos from "../components/TarjetaPuntos";
import TarjetaResena from "../components/TarjetaResena";

function Nosotros() {
  return (
    <main className="container py-4">
      <section className="row align-items-center g-4">
        <div className="col-12 col-md-6">
          <header className="encabezado-pagina">
            <h1>Quiénes somos</h1>
          </header>
          {parrafosPresentacion.map((parrafo) => (
            <p key={parrafo}>{parrafo}</p>
          ))}
        </div>
        <div className="col-12 col-md-6">
          <img
            src="/img/gatopulento.png"
            alt="Equipo de Veterinaria San Marcos"
            className="img-fluid rounded shadow"
          />
        </div>
      </section>

      <hr className="my-5" />

      <section aria-labelledby="titulo-puntos" className="row g-4">
        <div className="col-12 col-md-6">
          <TarjetaClinica />
        </div>
        <div className="col-12 col-md-6">
          <TarjetaPuntos puntos={puntosImportantes} />
        </div>
      </section>

      <hr className="my-5" />

      <section>
        <h2 className="text-center mb-4">Atención cálida, cómoda, profesional y moderna</h2>
        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-md-6">
            <img
              src="/img/imagenReview-1.jpg"
              alt="Imagen explicando los servicios"
              className="img-fluid rounded shadow h-100 object-fit-cover"
            />
          </div>
          <div className="col-12 col-md-6 d-flex flex-column gap-3">
            {resenas.map((resena) => (
              <TarjetaResena key={resena.id} resena={resena} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Nosotros;
