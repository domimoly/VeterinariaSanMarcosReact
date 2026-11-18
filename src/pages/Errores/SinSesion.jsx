import PaginaError from "../../components/Errores/PaginaError";

// 401: la persona no inició sesión o su sesión venció.
function SinSesion() {
  return (
    <PaginaError
      codigo="401"
      titulo="Inicia sesión para continuar"
      mensaje="Esta sección requiere una sesión activa. Si tu sesión venció, vuelve a ingresar."
      acciones={[
        { texto: "Iniciar sesión", to: "/login" },
        { texto: "Volver al inicio", to: "/" },
      ]}
    />
  );
}

export default SinSesion;
