import { useEffect, useState } from "react";
import FormularioContacto from "../components/FormularioContacto";

const direccionClinica = "Av. San Marcos 123, Rancagua";
const urlMapa = `https://www.google.com/maps?q=${encodeURIComponent(direccionClinica)}&output=embed`;
const urlComoLlegar = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccionClinica)}`;

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
                Último mensaje enviado: {ultimoContacto.nombre} {ultimoContacto.apellido} ({ultimoContacto.correo})
              </p>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="d-flex flex-column gap-3 h-100">
            <div className="contacto-mapa flex-grow-1">
              <iframe
                title="Ubicación de Veterinaria San Marcos en el mapa"
                src={urlMapa}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <p className="text-white mb-0">📍 {direccionClinica}</p>
            <a
              href={urlComoLlegar}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-contacto align-self-start"
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contacto;