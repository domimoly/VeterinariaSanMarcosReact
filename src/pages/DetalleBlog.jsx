import { Link, useParams } from "react-router-dom";
import { publicacionesBlog } from "../data/blog";

function DetalleBlog() {
  const { slug } = useParams();
  const publicacion = publicacionesBlog.find((item) => item.slug === slug);

  if (!publicacion) {
    return (
      <main className="container py-5 text-center">
        <h1>Artículo no encontrado</h1>
        <p>La publicación solicitada no existe.</p>
        <Link to="/blog" className="boton-agenda">
          Volver al Blog
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <article>
        <header className="blog-hero row align-items-center g-4 mb-5">
          <div className="col-12 col-md-6">
            <h1>{publicacion.titulo}</h1>
            <p className="blog-hero-meta mb-0">
              <strong>Por {publicacion.autor}</strong>
              <span>{publicacion.fecha}</span>
            </p>
          </div>
          <div className="col-12 col-md-6">
            <div className="tarjeta-blog-imagen tarjeta-blog-imagen-hero d-flex align-items-center justify-content-center text-white">
              <span className="p-3 text-center small">
                {publicacion.contenido ? publicacion.contenido.heroImagenAlt : publicacion.imagenAlt}
              </span>
            </div>
          </div>
        </header>

        {publicacion.contenido ? (
          <>
            <div className="articulo-contenido">
              {publicacion.contenido.parrafos.map((parrafo, indice) => (
                <p key={indice}>{parrafo}</p>
              ))}
            </div>

            <aside className="caja-autor">
              <i className="fa-solid fa-user-doctor icono-autor" aria-hidden="true"></i>
              <div className="caja-autor-info">
                <p>
                  <strong>{publicacion.autor}</strong>
                </p>
                <span>{publicacion.contenido.especialidadAutor}</span>
              </div>
            </aside>
          </>
        ) : (
          <div className="articulo-contenido text-center">
            <p>{publicacion.extracto}</p>
            <p className="text-secondary">
              Estamos redactando la versión completa de este artículo. Vuelve pronto para leerlo.
            </p>
          </div>
        )}

        <div className="text-center mt-5">
          <Link to="/blog" className="boton-agenda">
            ← Volver al Blog
          </Link>
        </div>
      </article>
    </main>
  );
}

export default DetalleBlog;