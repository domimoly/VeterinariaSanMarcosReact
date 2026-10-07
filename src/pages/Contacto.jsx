import { useEffect, useState } from "react";
import FormularioContacto from "../components/FormularioContacto";

function Contacto() {
  const [ultimoContacto, setUltimoContacto] = useState(() => {
    const guardado = localStorage.getItem("ultimoContactoVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : null;
  });

  useEffect(() => {
    if (ultimoContacto) {
      localStorage.setItem(
        "ultimoContactoVeterinariaSanMarcos",
        JSON.stringify(ultimoContacto)
      );
    }
  }, [ultimoContacto]);

  function guardarContacto(mensaje) {
    setUltimoContacto(mensaje);
  }

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-4">
        <h1>Contacto</h1>
        <p className="text-secondary mb-0">¿Tienes dudas? Contáctanos para resolverlas.</p>
      </header>

      <section className="contacto-seccion row g-4">
        <div className="col-12 col-md-6">
          <div className="contacto-formulario-caja h-100">
            <h2 className="text-center h4">Formulario de Contacto</h2>

            <FormularioContacto onEnviar={guardarContacto} />

            {ultimoContacto && (
              <p className="text-secondary small mt-3 mb-0">
                Último mensaje enviado: {ultimoContacto.nombre} ({ultimoContacto.correo})
              </p>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="contacto-mapa h-100">
            <iframe
              title="Ubicación de Veterinaria San Marcos en el mapa"
              src="https://www.google.com/maps?q=Av.+San+Marcos+123,+Rancagua&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contacto;