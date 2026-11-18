import { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { Link, Navigate, useLocation } from "react-router-dom";
import EncabezadoPerfil from "../../components/Tutor/EncabezadoPerfil";
import FormularioPerfil from "../../components/Tutor/FormularioPerfil";
import TarjetaMascota from "../../components/Tutor/TarjetaMascota";
import FormularioMascota from "../../components/Tutor/FormularioMascota";
import HistorialMascota from "../../components/Tutor/HistorialMascota";
import ListaCitas from "../../components/Tutor/ListaCitas";
import { usuarioDemo } from "../../data/Tutor/usuario";
import { fichasClinicas } from "../../data/fichasClinicas";
import { citasDemo } from "../../data/citas";
import { useMascotas } from "../../hooks/useMascotas";
import { leerJSON } from "../../utils/almacenamiento";
import "./Tutor.css";

function MiPerfil() {
  const [usuario, setUsuario] = useState(() => leerJSON("usuarioVeterinariaSanMarcos", usuarioDemo));

  // Las mascotas viven en ms-mascotas (base de datos), no en el navegador
  const { mascotas, cargando, error, errorAccion, sesionVencida, recargar, crear, actualizar, eliminar } = useMascotas();

  const [citas, setCitas] = useState(() => leerJSON("citasVeterinariaSanMarcos", citasDemo));

  const { hash } = useLocation();

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState(null);

  useEffect(() => {
    localStorage.setItem("usuarioVeterinariaSanMarcos", JSON.stringify(usuario));
  }, [usuario]);

  useEffect(() => {
    localStorage.setItem("citasVeterinariaSanMarcos", JSON.stringify(citas));
  }, [citas]);

  // Permite llegar directo a una sección con /mi-perfil#mis-citas
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

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

  async function guardarMascota(datos) {
    const guardada = mascotaEditando ? await actualizar(mascotaEditando.id, datos) : await crear(datos);
    if (guardada) cerrarFormulario();
  }

  function cancelarCita(id) {
    if (window.confirm("¿Seguro que quieres cancelar esta cita?")) {
      setCitas(citas.map((cita) => (cita.id === id ? { ...cita, estado: "Cancelada" } : cita)));
    }
  }

  async function eliminarMascota(id) {
    if (window.confirm("¿Seguro que quieres eliminar esta mascota?")) {
      await eliminar(id);
    }
  }

  // El token venció mientras se usaba la página
  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  return (
    <main className="container py-4">
      <EncabezadoPerfil usuario={usuario} />

      {usuario.rol === "Administrador" && sessionStorage.getItem("adminVeterinariaAutenticado") === "true" && (
        <div className="perfil-caja mt-4">
          <h2 className="h5">Panel de administración</h2>
          <p className="mb-3 text-secondary">
            Consulta las cuentas registradas y administra sus datos desde el panel.
          </p>
          <Link to="/admin/usuarios" className="btn btn-contacto">
            <i className="bi bi-people me-2" aria-hidden="true" />Gestionar usuarios
          </Link>
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

        {errorAccion && (
          <Alert variant="danger" role="alert">
            {errorAccion}
          </Alert>
        )}

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

        {cargando ? (
          <p className="text-secondary mb-0" role="status">
            Cargando tus mascotas...
          </p>
        ) : error ? (
          <Alert variant="danger" role="alert" className="mb-0">
            {error}{" "}
            <Alert.Link as="button" type="button" onClick={recargar}>
              Reintentar
            </Alert.Link>
          </Alert>
        ) : mascotas.length === 0 ? (
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

      <section className="perfil-caja mt-4" id="mis-citas">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h2 className="h4 mb-0">Mis citas</h2>
          <Link to="/agendar-cita" className="btn btn-contacto">
            Agendar cita
          </Link>
        </div>
        <ListaCitas citas={citas} onCancelar={cancelarCita} />
      </section>

      <section className="perfil-caja mt-4">
        <h2 className="h4 mb-4">Ficha clínica</h2>
        <HistorialMascota mascotas={mascotas} fichas={fichasClinicas} />
      </section>
    </main>
  );
}

export default MiPerfil;
