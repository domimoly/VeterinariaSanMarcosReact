import { Link } from "react-router-dom";

function TarjetaBlog({ publicacion }) {
  return (
    <div className="tarjeta-blog h-100">
      <div className="tarjeta-blog-imagen d-flex align-items-center justify-content-center text-white">
        <span className="p-3 text-center small">{publicacion.imagenAlt}</span>
      </div>
      <div className="tarjeta-blog-contenido">
        <h2 className="h5">
          <Link to={`/blog/${publicacion.slug}`}>{publicacion.titulo}</Link>
        </h2>
        <p className="text-secondary">{publicacion.extracto}</p>
        <div className="tarjeta-blog-meta">
          <div>
            <strong>{publicacion.autor}</strong>
            <br />
            {publicacion.fecha}
          </div>
          <i className="fa-solid fa-user-doctor icono-autor" aria-hidden="true"></i>
        </div>
      </div>
    </div>
  );
}

export default TarjetaBlog;