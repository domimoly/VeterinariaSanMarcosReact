import { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { Link, Navigate, useLocation } from "react-router-dom";
import EncabezadoPerfil from "../../components/Tutor/EncabezadoPerfil";
import FormularioPerfil from "../../components/Tutor/FormularioPerfil";
import TarjetaMascota from "../../components/Tutor/TarjetaMascota";
import FormularioMascota from "../../components/Tutor/FormularioMascota";
import HistorialMascota from "../../components/Tutor/HistorialMascota";
import ListaCitas from "../../components/Tutor/ListaCitas";
import { useCitas } from "../../hooks/useCitas";
import { useMascotas } from "../../hooks/useMascotas";
import { usePerfil } from "../../hooks/usePerfil";
import "./Tutor.css";

function MiPerfil() {
  // Los datos personales viven en ms-auth (base de datos), no en el navegador
  const {
    perfil: usuario,
    cargando: cargandoPerfil,
    error: errorPerfil,
    errorAccion: errorGuardarPerfil,
    sesionVencida: perfilSinSesion,
    recargar: recargarPerfil,
    guardar: guardarPerfil,
  } = usePerfil();

  // Las mascotas viven en ms-mascotas (base de datos), no en el navegador
  const {
    mascotas,
    cargando,
    error,
    errorAccion,
    sesionVencida: mascotasSinSesion,
    recargar,
    crear,
    actualizar,
    eliminar,
  } = useMascotas();

  // Las citas viven en ms-citas: el tutor recibe solo las suyas
  const {
    citas,
    cargando: cargandoCitas,
    error: errorCitas,
    errorAccion: errorAccionCitas,
    sesionVencida: citasSinSesion,
    recargar: recargarCitas,
    cancelar,
  } = useCitas();

  const { hash } = useLocation();

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState(null);

  // Permite llegar directo a una sección con /mi-perfil#mis-citas
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

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

  async function cancelarCita(id) {
    if (window.confirm("¿Seguro que quieres cancelar esta cita?")) {
      await cancelar(id);
    }
  }

  async function eliminarMascota(id) {
    if (window.confirm("¿Seguro que quieres eliminar esta mascota?")) {
      await eliminar(id);
    }
  }

  // El token venció mientras se usaba la página
  if (mascotasSinSesion || citasSinSesion || perfilSinSesion) return <Navigate to="/sesion-requerida" replace />;

  return (
    <main className="container py-4">
      {usuario && <EncabezadoPerfil usuario={usuario} />}

      <section className="perfil-caja mt-4">
        <h2 className="h4 mb-4">Mis datos personales</h2>
        {cargandoPerfil ? (
          <p className="text-secondary mb-0" role="status">
            Cargando tus datos...
          </p>
        ) : errorPerfil ? (
          <Alert variant="danger" role="alert" className="mb-0">
            {errorPerfil}{" "}
            <Alert.Link as="button" type="button" onClick={recargarPerfil}>
              Reintentar
            </Alert.Link>
          </Alert>
        ) : (
          <>
            {errorGuardarPerfil && (
              <Alert variant="danger" role="alert">
                {errorGuardarPerfil}
              </Alert>
            )}
            <FormularioPerfil usuario={usuario} onGuardar={guardarPerfil} />
          </>
        )}
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
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/mis-pedidos" className="btn btn-outline-secondary d-inline-flex align-items-center">
              Mis pedidos
            </Link>
            <Link to="/agendar-cita" className="btn btn-contacto">
              Agendar cita
            </Link>
          </div>
        </div>

        {errorAccionCitas && (
          <Alert variant="danger" role="alert">
            {errorAccionCitas}
          </Alert>
        )}

        {cargandoCitas ? (
          <p className="text-secondary mb-0" role="status">
            Cargando tus citas...
          </p>
        ) : errorCitas ? (
          <Alert variant="danger" role="alert" className="mb-0">
            {errorCitas}{" "}
            <Alert.Link as="button" type="button" onClick={recargarCitas}>
              Reintentar
            </Alert.Link>
          </Alert>
        ) : (
          <ListaCitas citas={citas} onCancelar={cancelarCita} />
        )}
      </section>

      <section className="perfil-caja mt-4">
        <h2 className="h4 mb-4">Ficha clínica</h2>
        <HistorialMascota mascotas={mascotas} />
      </section>
    </main>
  );
}

export default MiPerfil;
