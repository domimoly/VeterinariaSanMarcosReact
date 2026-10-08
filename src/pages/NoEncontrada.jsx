import { Link } from "react-router-dom";

function NoEncontrada() {
  return (
    <main className="container py-5 text-center">
      <h1>Página no encontrada</h1>
      <p>La dirección solicitada no corresponde a una vista disponible.</p>
      <Link to="/" className="boton-agenda">
        Volver al inicio
      </Link>
    </main>
  );
}

export default NoEncontrada;