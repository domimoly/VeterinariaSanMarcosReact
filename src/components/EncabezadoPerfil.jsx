const clasesRol = {
  Administrador: "badge-rol-admin",
  Recepcionista: "badge-rol-recepcion",
  "Dueño de mascota": "badge-rol-dueno",
};

function EncabezadoPerfil({ usuario }) {
  const iniciales = `${usuario.nombre.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase();

  return (
    <header className="perfil-encabezado d-flex align-items-center gap-3 flex-wrap">
      <div className="avatar-perfil" aria-hidden="true">
        {iniciales}
      </div>
      <div>
        <h1 className="h3 mb-1">
          {usuario.nombre} {usuario.apellidos}
        </h1>
        <p className="mb-1 text-secondary">{usuario.correo}</p>
        <span className={`badge-rol ${clasesRol[usuario.rol]}`}>{usuario.rol}</span>
      </div>
    </header>
  );
}

export default EncabezadoPerfil;