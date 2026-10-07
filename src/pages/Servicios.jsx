import { Link } from "react-router-dom";
import { categoriasServicios } from "../data/servicios";

function Servicios() {
  return (
    <main className="container py-4">
      {/* Presentación */}
      <section className="row align-items-center g-4">
        <div className="col-12 col-md-6">
          <h1>Nuestros Servicios Médicos</h1>
          <p>
            En Veterinaria San Marcos contamos con un equipo de 3 médicos
            veterinarios y 1 técnico dedicados a brindar la mejor atención
            para tus perros, gatos, aves y conejos. Nuestro objetivo es
            garantizar la salud y bienestar de tus mascotas mediante un
            servicio integral y profesional.
          </p>
          <ul className="list-unstyled d-flex flex-column gap-2">
            <li>✓ Médicos veterinarios colegiados</li>
            <li>✓ Instalaciones seguras y equipadas</li>
            <li>✓ Sistema de agendamiento online rápido</li>
          </ul>
        </div>
        <div className="col-12 col-md-6">
          <img
            src="/img/servicios-header.png"
            alt="Veterinario atendiendo a una mascota"
            className="img-fluid rounded shadow"
          />
        </div>
      </section>

      {/* Una sección por categoría */}
      {categoriasServicios.map((categoria) => {
        const categoriasAcento = ["titulo-vacunas", "titulo-desparasitacion", "titulo-otros"];
        const claseIcono = categoriasAcento.includes(categoria.id)
          ? "icono-acento"
          : "icono-secundario";

        return (
        <section key={categoria.id} className="mt-5">
          <hr className="mb-5" />
          <h2 className="text-center mb-4">{categoria.titulo}</h2>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            {categoria.items.map((servicio) => (
              <div className="col" key={servicio.nombre}>
                <div className="card h-100 shadow-sm text-center p-3">
                  <i className={`${servicio.icono} fs-1 mb-3 ${claseIcono}`}></i>
                  <div className="card-body d-flex flex-column">
                    <h3 className="h5">{servicio.nombre}</h3>
                    <p className="text-secondary small flex-grow-1">{servicio.descripcion}</p>
                    <p className="mb-1">
                      <small>Duración aprox: {servicio.duracion}</small>
                    </p>
                    <p className="fw-bold mb-3">Valor: {servicio.precio}</p>
                    <Link
                      to={`/servicios/${servicio.categoriaSlug}`}
                      className="btn btn-sm btn-servicio"
                    >
                      Conoce más →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        );
      })}
    </main>
  );
}

export default Servicios;