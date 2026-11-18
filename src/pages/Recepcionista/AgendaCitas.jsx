import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import FiltrosCitas from "../../components/Recepcionista/FiltrosCitas";
import MenuRecepcion from "../../components/Recepcionista/MenuRecepcion";
import ReagendarCita from "../../components/Recepcionista/ReagendarCita";
import TablaCitas from "../../components/Recepcionista/TablaCitas";
import { useCitas } from "../../hooks/useCitas";
import { citaEsProxima, fechaHoraDeCita } from "../../utils/citas";
import "./Recepcionista.css";

const filtrosIniciales = { estado: "", fecha: "" };

function AgendaCitas() {
  // La recepción recibe de ms-citas la agenda completa (las citas de todos los tutores)
  const { citas, cargando, error, errorAccion, sesionVencida, recargar, limpiarError, confirmar, reagendar } =
    useCitas();
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [citaAReagendar, setCitaAReagendar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function cambiarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros({ ...filtros, [name]: value });
  }

  function abrirReagendar(cita) {
    limpiarError();
    setCitaAReagendar(cita);
  }

  async function guardarReagendamiento(datos) {
    setGuardando(true);
    const cita = await reagendar(citaAReagendar.id, datos);
    setGuardando(false);
    if (cita) setCitaAReagendar(null);
  }

  // El token venció mientras se usaba la página
  if (sesionVencida) return <Navigate to="/sesion-requerida" replace />;

  const ahora = new Date();
  const filtradas = citas.filter(
    (cita) => (!filtros.estado || cita.estado === filtros.estado) && (!filtros.fecha || cita.fecha === filtros.fecha)
  );
  // Primero las que vienen (la más cercana arriba) y después el historial
  const proximas = filtradas
    .filter((cita) => citaEsProxima(cita, ahora))
    .sort((a, b) => fechaHoraDeCita(a) - fechaHoraDeCita(b));
  const anteriores = filtradas
    .filter((cita) => !citaEsProxima(cita, ahora))
    .sort((a, b) => fechaHoraDeCita(b) - fechaHoraDeCita(a));

  const pendientes = citas.filter((cita) => cita.estado === "Pendiente" && citaEsProxima(cita, ahora)).length;

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-4">
        <h1>Recepción</h1>
        <p className="text-secondary mb-0">Gestiona las citas y las fichas clínicas de los pacientes.</p>
      </header>

      <MenuRecepcion />

      <section className="panel-recepcion">
        <h2 className="h4 mb-3">Agenda de citas</h2>

        <p className="aviso-pendientes" role="status">
          {pendientes === 0
            ? "No hay citas pendientes por revisar."
            : `${pendientes} ${pendientes === 1 ? "cita pendiente" : "citas pendientes"} por revisar.`}
        </p>

        <FiltrosCitas filtros={filtros} onCambiar={cambiarFiltro} onLimpiar={() => setFiltros(filtrosIniciales)} />

        {errorAccion && !citaAReagendar && (
          <Alert variant="danger" role="alert">
            {errorAccion}
          </Alert>
        )}

        {cargando ? (
          <p className="text-secondary mb-0" role="status">
            Cargando la agenda...
          </p>
        ) : error ? (
          <Alert variant="danger" role="alert" className="mb-0">
            {error}{" "}
            <Alert.Link as="button" type="button" onClick={recargar}>
              Reintentar
            </Alert.Link>
          </Alert>
        ) : (
          <TablaCitas citas={[...proximas, ...anteriores]} onConfirmar={confirmar} onReagendar={abrirReagendar} />
        )}
      </section>

      {citaAReagendar && (
        <ReagendarCita
          cita={citaAReagendar}
          citasGuardadas={citas}
          guardando={guardando}
          error={errorAccion}
          onGuardar={guardarReagendamiento}
          onCancelar={() => setCitaAReagendar(null)}
        />
      )}
    </main>
  );
}

export default AgendaCitas;
