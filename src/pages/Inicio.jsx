import { Link } from "react-router-dom";
import { resenas } from "../data/resenas";

const servicios = [
  "Consultas",
  "Vacunación",
  "Cirugías",
  "Desparasitación",
  "Exámenes",
  "Otros",
];

function Inicio() {
  return (
    <main className="container py-4">
      {/* Presentación principal */}
      <section className="row align-items-center g-4">
        <div className="col-12 col-md-6">
          <h1>Tu mascota sana y más feliz con un veterinario en casa</h1>
          <p>
            Desde el año 2009, en Veterinaria San Marcos nos dedicamos al cuidado
            integral de perros, gatos, aves y conejos. Nuestro equipo médico está
            preparado para brindar desde consultas generales hasta cirugías
            menores, garantizando siempre el bienestar de tu mejor amigo.
          </p>
        </div>
        <div className="col-12 col-md-6">
          <img
            src="/img/logo-veterinaria.png"
            alt="Veterinario atendiendo a una mascota en su hogar"
            className="img-fluid rounded shadow"
          />
        </div>
      </section>

      <hr className="my-5" />

      {/* Servicios destacados */}
      <section className="row row-cols-2 row-cols-md-6 g-3 text-center">
        {servicios.map((servicio) => (
          <div className="col" key={servicio}>
            <div className="servicio-item h-100">
              <Link to="/servicios">{servicio}</Link>
            </div>
          </div>
        ))}
      </section>

      <hr className="my-5" />

      {/* Atención y reseñas */}
      <section>
        <h2 className="text-center">
          Atención cálida, cómoda, profesional y moderna
        </h2>
        <p className="text-center">
          Nuestro equipo médico está comprometido en brindar a tu mascota un
          trato empático y libre de estrés.
          <br />
          Contamos con instalaciones de primer nivel para asegurar su bienestar
          en cada visita.
        </p>
        <div className="row g-4 align-items-stretch mt-3">
          <div className="col-12 col-md-6">
            <img
              src="/img/index-imagen-resenas.png"
              alt="Equipo veterinario atendiendo con calidez a una mascota"
              className="img-fluid rounded shadow h-100 object-fit-cover"
            />
          </div>
          <div className="col-12 col-md-6 d-flex flex-column gap-3">
            {resenas.map((resena) => (
              <div className="resena-card p-3 bg-white" key={resena.id}>
                <div className="d-flex justify-content-between flex-wrap">
                  <strong>{resena.autor}</strong>
                  <span
                    className="resena-estrellas"
                    aria-label={`${resena.estrellas} de 5 estrellas`}
                  >
                    {"★".repeat(resena.estrellas)}
                    {"☆".repeat(5 - resena.estrellas)}
                  </span>
                </div>
                <p className="mb-0 text-secondary">{resena.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="my-5" />

      {/* Agenda tu hora */}
      <section className="row align-items-center g-4">
        <div className="col-12 col-md-6">
          <h2>¡Agenda tu hora online!</h2>
          <p>
            Olvídate de las esperas al teléfono. Ahora puedes solicitar la cita
            médica para tu mascota, revisar su historial clínico y estar al
            tanto de sus vacunas directamente desde nuestra plataforma web.
          </p>
          <Link className="boton-agenda" to="/agendar-cita">
            Agendar cita
          </Link>
          <div className="mt-4">
            <p>
              ¿Tienes dudas o consultas sobre alguno de nuestros servicios?
              <br />
              Rellena el formulario de contacto aquí.
            </p>
            <Link className="boton-agenda" to="/contacto">
              Contacto
            </Link>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <img src="/img/index-imagen-agenda.png" alt="" className="img-fluid rounded shadow" />
        </div>
      </section>

      <hr className="my-5" />

      {/* Video */}
      <section className="seccion-video mx-auto">
        <h2 className="text-center">
          La importancia de los cuidados de tu mascota
        </h2>
        <p className="text-center">
          Adoptar es un compromiso de por vida. En Veterinaria San Marcos te
          acompañamos en cada etapa para garantizar que tu mejor amigo reciba
          el cuidado, el cariño y la atención médica que merece, porque ellos
          confían en ti.
        </p>
        <div className="ratio ratio-16x9 rounded shadow mt-3">
          <iframe
            src="https://www.youtube.com/embed/L1FXKsLUVb8"
            title="Video sobre el cuidado de mascotas"
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </main>
  );
}

export default Inicio;