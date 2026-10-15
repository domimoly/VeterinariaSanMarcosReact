import { clinica } from "../data/clinica";

function TarjetaClinica() {
  return (
    <div className="card shadow-sm p-4 h-100">
      <address className="mb-0">
        <p className="fw-bold mb-1">{clinica.nombre}</p>
        <p className="mb-1">{clinica.direccion}</p>
        <p className="mb-0">
          Contacto: <a href="mailto:contacto@veterinariasanmarcos.cl">contacto@veterinariasanmarcos.cl</a>
        </p>
      </address>
    </div>
  );
}

export default TarjetaClinica;
