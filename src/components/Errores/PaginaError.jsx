import { Link } from "react-router-dom";

// Pantalla de error reutilizable: código, título, explicación y acciones.
// Cada acción es { texto, to } (enlace) o { texto, onClick } (botón).
function PaginaError({ codigo, titulo, mensaje, acciones = [] }) {
  return (
    <main className="container py-5 text-center pagina-error">
      <p className="pagina-error-codigo" aria-hidden="true">
        {codigo}
      </p>
      <h1>{titulo}</h1>
      <p className="text-secondary">{mensaje}</p>
      <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
        {acciones.map((accion) =>
          accion.to ? (
            <Link key={accion.texto} to={accion.to} className="boton-agenda">
              {accion.texto}
            </Link>
          ) : (
            <button key={accion.texto} type="button" className="boton-agenda border-0" onClick={accion.onClick}>
              {accion.texto}
            </button>
          )
        )}
      </div>
    </main>
  );
}

export default PaginaError;
