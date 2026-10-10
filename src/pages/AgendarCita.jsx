import { useState } from "react";
import { Button } from "react-bootstrap";
import PasosCita from "../components/PasosCita";
import ResumenCita from "../components/ResumenCita";
import PasoMascota from "../components/PasoMascota";
import PasoFecha from "../components/PasoFecha";
import { pasosCita } from "../data/pasosCita";
import { mascotasDemo } from "../data/mascotas";

const citaInicial = {
  mascota: null,
  servicio: null,
  fecha: "",
  hora: "",
  observaciones: "",
  tutor: null,
};

function AgendarCita() {
  const [paso, setPaso] = useState(1);
  const [cita, setCita] = useState(citaInicial);

  // Las mascotas son las que el dueño registró en Mi perfil
  const [mascotas] = useState(() => {
    const guardado = localStorage.getItem("mascotasVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : mascotasDemo;
  });

  // Citas que el dueño ya solicitó (las guarda el paso de confirmación)
  const [citasGuardadas] = useState(() => {
    const guardado = localStorage.getItem("citasVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : [];
  });

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
            {paso === 1 && <PasoMascota mascotas={mascotas} cita={cita} onContinuar={continuarMascota} />}

            {paso === 2 && (
              <PasoFecha
                cita={cita}
                citasGuardadas={citasGuardadas}
                onContinuar={continuarFecha}
                onAtras={() => setPaso(1)}
              />
            )}

            {paso > 2 && (
              <div>
                <h2 className="h4">{pasosCita[paso - 1]}</h2>
                <p className="text-secondary">Este paso se construirá en la siguiente etapa.</p>
                <div className="d-flex gap-2 mt-4">
                  <Button variant="outline-secondary" onClick={() => setPaso(paso - 1)}>
                    Atrás
                  </Button>
                  {paso < pasosCita.length && (
                    <Button className="btn-contacto" onClick={() => setPaso(paso + 1)}>
                      Continuar
                    </Button>
                  )}
                </div>
              </div>
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