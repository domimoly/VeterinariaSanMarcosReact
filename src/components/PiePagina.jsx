import { Link } from "react-router-dom";

function PiePagina() {
  return (
    <footer className="pie-sitio pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row g-4 text-center text-md-start">
          <div className="col-12 col-md-4">
            <h3 className="h5">Veterinaria San Marcos</h3>
            <p>
              Cuidando a tu mejor amigo con vocación y tecnología desde 2009.
              Especialistas en perros, gatos y animales exóticos.
            </p>
          </div>

          <div className="col-12 col-md-4">
            <h3 className="h5">Contacto y Ubicación</h3>
            <p className="mb-1">📍 Av. San Marcos 123, Rancagua</p>
            <p className="mb-1">📞 +56 9 1234 5678</p>
            <p className="mb-1">
              ✉️ <a href="mailto:contacto@veterinariasanmarcos.cl">contacto@veterinariasanmarcos.cl</a>
            </p>
            <p className="mb-0">⏰ Urgencias 24 hrs · 365 días</p>
          </div>

          <div className="col-12 col-md-4">
            <h3 className="h5">Enlaces rápidos</h3>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/servicios">Nuestros servicios</Link></li>
              <li><Link to="/blog">Blog veterinario</Link></li>
              <li><Link to="/contacto">Formulario de contacto</Link></li>
            </ul>
          </div>
        </div>

        <hr />

        <p className="text-center small mb-0">
          © 2026 Veterinaria San Marcos. Proyecto académico · Desarrollo FullStack II.
        </p>
      </div>
    </footer>
  );
}

export default PiePagina;