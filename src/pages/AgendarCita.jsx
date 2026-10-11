import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PasosCita from "../components/PasosCita";
import ResumenCita from "../components/ResumenCita";
import PasoMascota from "../components/PasoMascota";
import PasoFecha from "../components/PasoFecha";
import PasoTutor from "../components/PasoTutor";
import PasoConfirmacion from "../components/PasoConfirmacion";
import CitaSolicitada from "../components/CitaSolicitada";
import { pasosCita } from "../data/pasosCita";
import { mascotasDemo } from "../data/mascotas";
import { usuarioDemo } from "../data/usuario";
import { citasDemo } from "../data/citas";

const citaInicial = {
  mascota: null,
  servicio: null,
  fecha: "",
  hora: "",
  observaciones: "",
  tutor: null,
};

function AgendarCita() {
  // Desde Servicios se puede llegar con un servicio ya elegido: /agendar-cita?servicio=...
  const [parametros] = useSearchParams();
  const servicioInicial = parametros.get("servicio") ?? "";

  const [paso, setPaso] = useState(1);
  const [cita, setCita] = useState(citaInicial);

  // Las mascotas son las que el dueño registró en Mi perfil
  const [mascotas] = useState(() => {
    const guardado = localStorage.getItem("mascotasVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : mascotasDemo;
  });

  // Los datos del tutor vienen del perfil
  const [usuario] = useState(() => {
    const guardado = localStorage.getItem("usuarioVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : usuarioDemo;
  });

  // Citas que el dueño ya solicitó (las guarda el paso de confirmación)
  const [citasGuardadas, setCitasGuardadas] = useState(() => {
    const guardado = localStorage.getItem("citasVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : citasDemo;
  });

  // La solicitud recién enviada (para mostrar el mensaje de éxito)
  const [solicitud, setSolicitud] = useState(null);

  useEffect(() => {
    localStorage.setItem("citasVeterinariaSanMarcos", JSON.stringify(citasGuardadas));
  }, [citasGuardadas]);

  function continuarMascota(datos) {
    // Si cambió el servicio o la mascota, la hora elegida antes puede ya no servir
    const cambio =
      !cita.servicio || cita.servicio.id !== datos.servicio.id || cita.mascota.id !== datos.mascota.id;
    setCita({ ...cita, ...datos, ...(cambio ? { fecha: "", hora: "" } : {}) });
    setPaso(2);
  }

  function continuarFecha(datos) {
    setCita({ ...cita, ...datos });
    setPaso(3);
  }

  function continuarTutor(tutor) {
    setCita({ ...cita, tutor });
    setPaso(4);
  }

  function confirmarCita(nuevaSolicitud) {
    setCitasGuardadas([...citasGuardadas, nuevaSolicitud]);
    setSolicitud(nuevaSolicitud);
  }

  function agendarOtra() {
    setCita(citaInicial);
    setPaso(1);
    setSolicitud(null);
  }

  if (solicitud) {
    return (
      <main className="container py-4">
        <CitaSolicitada solicitud={solicitud} onAgendarOtra={agendarOtra} />
      </main>
    );
  }

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-4">
        <h1>Agendar cita</h1>
        <p className="text-secondary mb-0">Solicita una hora para tu mascota en pocos pasos.</p>
      </header>

      <PasosCita pasos={pasosCita} pasoActual={paso} />

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <section className="perfil-caja">
            {paso === 1 && <PasoMascota
                mascotas={mascotas}
                cita={cita}
                servicioInicial={servicioInicial}
                onContinuar={continuarMascota}
              />}

            {paso === 2 && (
              <PasoFecha
                cita={cita}
                citasGuardadas={citasGuardadas}
                onContinuar={continuarFecha}
                onAtras={() => setPaso(1)}
              />
            )}

            {paso === 3 && (
              <PasoTutor
                usuario={usuario}
                cita={cita}
                onContinuar={continuarTutor}
                onAtras={() => setPaso(2)}
              />
            )}

            {paso === 4 && (
              <PasoConfirmacion
                cita={cita}
                citasGuardadas={citasGuardadas}
                onConfirmar={confirmarCita}
                onAtras={() => setPaso(3)}
                onCambiarHora={() => setPaso(2)}
              />
            )}
          </section>
        </div>

        <div className="col-12 col-lg-4">
          <ResumenCita cita={cita} />
        </div>
      </div>
    </main>
  );
}

export default AgendarCita;
