import PaginaError from "../../components/Errores/PaginaError";

// 403: hay sesión, pero el rol de la persona no permite ver esta sección.
function SinPermiso() {
  return (
    <PaginaError
      codigo="403"
      titulo="No tienes permiso para ver esta página"
      mensaje="Tu cuenta no tiene acceso a esta sección. Si crees que es un error, contacta a la clínica."
      acciones={[
        { texto: "Ir a mi perfil", to: "/mi-perfil" },
        { texto: "Volver al inicio", to: "/" },
      ]}
    />
  );
}

export default SinPermiso;
