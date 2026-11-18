import PaginaError from "../../components/Errores/PaginaError";

// 500 / sin conexión: el sistema no pudo responder (útil cuando se integre el backend).
function ErrorServidor() {
  return (
    <PaginaError
      codigo="500"
      titulo="No pudimos completar la solicitud"
      mensaje="El sistema no respondió. Revisa tu conexión e inténtalo de nuevo en unos minutos."
      acciones={[
        { texto: "Reintentar", onClick: () => window.location.reload() },
        { texto: "Volver al inicio", to: "/" },
      ]}
    />
  );
}

export default ErrorServidor;
