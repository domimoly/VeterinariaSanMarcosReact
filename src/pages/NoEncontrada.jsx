import PaginaError from "../components/Errores/PaginaError";

function NoEncontrada() {
  return (
    <PaginaError
      codigo="404"
      titulo="Página no encontrada"
      mensaje="La dirección solicitada no corresponde a una vista disponible."
      acciones={[{ texto: "Volver al inicio", to: "/" }]}
    />
  );
}

export default NoEncontrada;
