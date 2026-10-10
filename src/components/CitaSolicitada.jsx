import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import FilaResumen from "./FilaResumen";
import { clinica } from "../data/clinica";
import { formatearFecha } from "../utils/fechas";

function CitaSolicitada({ solicitud, onAgendarOtra }) {
  const porCorreo = solicitud.tutor.medioRecordatorio === "Correo";
  const destino = porCorreo ? solicitud.tutor.correo : solicitud.tutor.telefono;

  return (
    <section className="perfil-caja cita-solicitada" role="status">
      <div className="icono-exito" aria-hidden="true">
        ✓
      </div>
      <h1 className="h3">¡Solicitud enviada!</h1>
      <p>
        Tu solicitud quedó <strong>pendiente de confirmación</strong>. La clínica la revisará y te avisará
        {porCorreo ? " por correo a " : " por teléfono al "}
        <strong>{destino}</strong>.
      </p>
      <p className="codigo-solicitud">Código de solicitud: {solicitud.codigo}</p>

      <dl className="text-start mt-4">
        <FilaResumen titulo="Mascota" valor={`${solicitud.mascotaNombre} (${solicitud.especie})`} />
        <FilaResumen titulo="Servicio" valor={solicitud.servicioNombre} />
        <FilaResumen titulo="Fecha y hora" valor={`${formatearFecha(solicitud.fecha)} a las ${solicitud.hora}`} />
        <FilaResumen titulo="Lugar" valor={clinica.direccion} />
        <FilaResumen titulo="Valor" valor={solicitud.precio} />
        <FilaResumen titulo="Estado" valor={solicitud.estado} />
      </dl>

      <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
        <Button type="button" className="btn-contacto" onClick={onAgendarOtra}>
          Agendar otra cita
        </Button>
        <Link to="/" className="btn btn-outline-secondary">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}

export default CitaSolicitada;