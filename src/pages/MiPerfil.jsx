import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import EncabezadoPerfil from "../components/EncabezadoPerfil";
import FormularioPerfil from "../components/FormularioPerfil";
import TarjetaMascota from "../components/TarjetaMascota";
import FormularioMascota from "../components/FormularioMascota";
import HistorialMascota from "../components/HistorialMascota";
import { usuarioDemo } from "../data/usuario";
import { mascotasDemo } from "../data/mascotas";
import { fichasClinicas } from "../data/fichasClinicas";

function MiPerfil() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuarioVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : usuarioDemo;
  });

  const [mascotas, setMascotas] = useState(() => {
    const guardado = localStorage.getItem("mascotasVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : mascotasDemo;
  });

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState(null);

  useEffect(() => {
    localStorage.setItem("usuarioVeterinariaSanMarcos", JSON.stringify(usuario));
  }, [usuario]);

  useEffect(() => {
    localStorage.setItem("mascotasVeterinariaSanMarcos", JSON.stringify(mascotas));
  }, [mascotas]);

  function guardarUsuario(nuevosDatos) {
    setUsuario(nuevosDatos);
  }

  function abrirFormularioNuevo() {
    setMascotaEditando(null);
    setFormularioAbierto(true);
  }

  function abrirFormularioEdicion(mascota) {
    setMascotaEditando(mascota);
    setFormularioAbierto(true);
  }

  function cerrarFormulario() {
    setMascotaEditando(null);
    setFormularioAbierto(false);
  }

  function guardarMascota(datos) {
    if (mascotaEditando) {
      setMascotas(mascotas.map((m) => (m.id === mascotaEditando.id ? { ...datos, id: m.id } : m)));
    } else {
      setMascotas([...mascotas, { ...datos, id: Date.now() }]);
    }
    cerrarFormulario();
  }

  function eliminarMascota(id) {
    if (window.confirm("¿Seguro que quieres eliminar esta mascota?")) {
      setMascotas(mascotas.filter((m) => m.id !== id));
    }
  }

  return (
    <main className="container py-4">
      <EncabezadoPerfil usuario={usuario} />

      {usuario.rol === "Administrador" && (
        <div className="perfil-caja mt-4">
          <h2 className="h5">Panel de administración</h2>
          <p className="mb-0 text-secondary">
            Como administrador podrás gestionar usuarios y roles desde el panel (próximamente).
          </p>
        </div>
      )}

      <section className="perfil-caja mt-4">
        <h2 className="h4 mb-4">Mis datos personales</h2>
        <FormularioPerfil usuario={usuario} onGuardar={guardarUsuario} />
      </section>

      <section className="perfil-caja mt-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h2 className="h4 mb-0">Mis mascotas</h2>
          {!formularioAbierto && (
            <Button className="btn-contacto" onClick={abrirFormularioNuevo}>
              Agregar mascota
            </Button>
          )}
        </div>

        {formularioAbierto && (
          <div className="mascota-formulario-caja mb-4">
            <h3 className="h5 mb-3">{mascotaEditando ? "Editar mascota" : "Nueva mascota"}</h3>
            <FormularioMascota
              key={mascotaEditando ? mascotaEditando.id : "nueva"}
              mascota={mascotaEditando}
              onGuardar={guardarMascota}
              onCancelar={cerrarFormulario}
            />
          </div>
        )}

        {mascotas.length === 0 ? (
          <p className="text-secondary mb-0">Aún no has registrado mascotas.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {mascotas.map((mascota) => (
              <div className="col" key={mascota.id}>
                <TarjetaMascota
                  mascota={mascota}
                  onEditar={abrirFormularioEdicion}
                  onEliminar={eliminarMascota}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="perfil-caja mt-4">
        <h2 className="h4 mb-4">Ficha clínica</h2>
        <HistorialMascota mascotas={mascotas} fichas={fichasClinicas} />
      </section>
    </main>
  );
}

export default MiPerfil;