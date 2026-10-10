import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { categoriasServicios } from "../data/servicios";
import { clinica } from "../data/clinica";
import { servicioAplica } from "../utils/citas";

const todosLosServicios = categoriasServicios.flatMap((categoria) =>
  categoria.items.map((servicio) => ({ ...servicio, categoria: categoria.titulo }))
);

function PasoMascota({ mascotas, cita, onContinuar }) {
  const [datos, setDatos] = useState({
    mascotaId: cita.mascota ? String(cita.mascota.id) : "",
    servicioId: cita.servicio ? cita.servicio.id : "",
    observaciones: cita.observaciones,
  });
  const [categoria, setCategoria] = useState("Todas");
  const [errores, setErrores] = useState({});

  if (mascotas.length === 0) {
    return (
      <div>
        <h2 className="h4">Tu mascota</h2>
        <p>Para agendar una cita primero debes registrar al menos una mascota.</p>
        <Link to="/mi-perfil" className="boton-agenda">
          Registrar mascota
        </Link>
      </div>
    );
  }

  const mascota = mascotas.find((m) => String(m.id) === datos.mascotaId);
  const serviciosVisibles = mascota
    ? todosLosServicios.filter(
        (servicio) =>
          servicioAplica(servicio, mascota) && (categoria === "Todas" || servicio.categoria === categoria)
      )
    : [];

  function cambiar(evento) {
    const { name, value } = evento.target;
    if (name === "mascotaId") {
      // Al cambiar de mascota, el servicio elegido puede dejar de corresponder
      setDatos({ ...datos, mascotaId: value, servicioId: "" });
    } else {
      setDatos({ ...datos, [name]: value });
    }
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};

    const observaciones = datos.observaciones.trim();
    const servicio = todosLosServicios.find((s) => s.id === datos.servicioId);

    if (!mascota) nuevosErrores.mascotaId = "Selecciona una mascota";

    if (!servicio) nuevosErrores.servicioId = "Selecciona un servicio";
    else if (mascota && !servicioAplica(servicio, mascota)) {
      nuevosErrores.servicioId = "Este servicio no corresponde a tu mascota";
    }

    if (observaciones.length > 300) nuevosErrores.observaciones = "Máximo 300 caracteres";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onContinuar({ mascota, servicio, observaciones });
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <h2 className="h4 mb-4">Cuéntanos de tu mascota</h2>

      <Form.Group className="mb-4" controlId="mascotaId">
        <Form.Label>Mascota</Form.Label>
        <Form.Select
          name="mascotaId"
          value={datos.mascotaId}
          onChange={cambiar}
          isInvalid={Boolean(errores.mascotaId)}
        >
          <option value="">Seleccione una mascota</option>
          {mascotas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre} ({m.especie})
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{errores.mascotaId}</Form.Control.Feedback>
      </Form.Group>

      <fieldset className="mb-4">
        <legend className="form-label">¿Cómo podemos ayudar a {mascota ? mascota.nombre : "tu mascota"}?</legend>

        {!mascota ? (
          <p className="text-secondary">Elige una mascota para ver los servicios disponibles.</p>
        ) : (
          <>
            <Form.Group className="mb-3" controlId="categoria">
              <Form.Label className="small text-secondary">Categoría</Form.Label>
              <Form.Select value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
                <option value="Todas">Todas</option>
                {categoriasServicios.map((c) => (
                  <option key={c.id} value={c.titulo}>
                    {c.titulo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <p className="small text-secondary">
              Mostramos solo los servicios que corresponden a {mascota.nombre} ({mascota.especie}).
            </p>

            {serviciosVisibles.length === 0 ? (
              <p className="text-secondary">No hay servicios disponibles para esta categoría.</p>
            ) : (
              <div className="servicios-lista">
                {serviciosVisibles.map((servicio) => (
                  <label className="servicio-opcion" key={servicio.id}>
                    <input
                      type="radio"
                      name="servicioId"
                      value={servicio.id}
                      checked={datos.servicioId === servicio.id}
                      onChange={cambiar}
                      disabled={!servicio.agendable}
                    />
                    <span className="servicio-opcion-texto">
                      <strong>{servicio.nombre}</strong>
                      <small>
                        {servicio.agendable
                          ? servicio.descripcion
                          : `${servicio.motivoNoAgendable} Tel. ${clinica.telefono}`}
                      </small>
                    </span>
                    <span className="servicio-opcion-precio">
                      <strong>{servicio.precio}</strong>
                      <small>{servicio.duracion}</small>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}

        {errores.servicioId && <div className="invalid-feedback d-block">{errores.servicioId}</div>}
      </fieldset>

      <Form.Group className="mb-4" controlId="observaciones">
        <Form.Label>Otros antecedentes (opcional)</Form.Label>
        <Form.Control
          name="observaciones"
          as="textarea"
          rows={3}
          maxLength={300}
          placeholder={`Cuéntanos sobre síntomas o lo que debamos saber sobre ${mascota ? mascota.nombre : "tu mascota"}`}
          value={datos.observaciones}
          onChange={cambiar}
          isInvalid={Boolean(errores.observaciones)}
        />
        <Form.Control.Feedback type="invalid">{errores.observaciones}</Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" className="btn-contacto">
        Continuar
      </Button>
    </Form>
  );
}

export default PasoMascota;