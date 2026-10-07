import { publicacionesBlog } from "../data/blog";
import TarjetaBlog from "../components/TarjetaBlog";

function Blog() {
  return (
    <main className="container py-4">
      <header className="encabezado-blog text-center mb-5">
        <h1>El Blog de Veterinaria San Marcos</h1>
        <p className="text-secondary">Noticias, educación y tendencias para amantes de las mascotas.</p>
      </header>

      <div className="row row-cols-1 row-cols-md-2 g-4">
        {publicacionesBlog.map((publicacion) => (
          <div className="col" key={publicacion.slug}>
            <TarjetaBlog publicacion={publicacion} />
          </div>
        ))}
      </div>
    </main>
  );
}

export default Blog;