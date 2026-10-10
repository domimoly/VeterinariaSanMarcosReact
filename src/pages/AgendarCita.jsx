import { useState } from "react";
import { Button } from "react-bootstrap";
import PasosCita from "../components/PasosCita";
import ResumenCita from "../components/ResumenCita";
import PasoMascota from "../components/PasoMascota";
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

  function continuarMascota(datos) {
    setCita({ ...cita, ...datos });
    setPaso(2);
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

            {paso > 1 && (
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