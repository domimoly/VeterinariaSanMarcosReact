import { useEffect, useState } from "react";
import FiltrosCitas from "../../components/Recepcionista/FiltrosCitas";
import MenuRecepcion from "../../components/Recepcionista/MenuRecepcion";
import ReagendarCita from "../../components/Recepcionista/ReagendarCita";
import TablaCitas from "../../components/Recepcionista/TablaCitas";
import { citasDemo } from "../../data/citas";
import { citaEsProxima, fechaHoraDeCita } from "../../utils/citas";
import "./Recepcionista.css";

const filtrosIniciales = { estado: "", fecha: "" };

function AgendaCitas() {
  // Son las mismas citas que solicita el tutor (clave citasVeterinariaSanMarcos)
  const [citas, setCitas] = useState(() => {
    const guardado = localStorage.getItem("citasVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : citasDemo;
  });
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [citaAReagendar, setCitaAReagendar] = useState(null);

  useEffect(() => {
    localStorage.setItem("citasVeterinariaSanMarcos", JSON.stringify(citas));
  }, [citas]);

  function cambiarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros({ ...filtros, [name]: value });
  }

  function confirmar(id) {
    setCitas(citas.map((cita) => (cita.id === id ? { ...cita, estado: "Confirmada" } : cita)));
  }

  function guardarReagendamiento({ fecha, hora, nota }) {
    setCitas(
      citas.map((cita) =>
        cita.id === citaAReagendar.id ? { ...cita, fecha, hora, nota, estado: "Reagendada" } : cita
      )
    );
    setCitaAReagendar(null);
  }

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

        <TablaCitas citas={[...proximas, ...anteriores]} onConfirmar={confirmar} onReagendar={setCitaAReagendar} />
      </section>

      {citaAReagendar && (
        <ReagendarCita
          cita={citaAReagendar}
          citasGuardadas={citas}
          onGuardar={guardarReagendamiento}
          onCancelar={() => setCitaAReagendar(null)}
        />
      )}
    </main>
  );
}

export default AgendaCitas;
