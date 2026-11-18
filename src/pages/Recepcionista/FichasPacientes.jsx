import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import FormularioRegistroClinico from "../../components/Recepcionista/FormularioRegistroClinico";
import ListaRegistrosClinicos from "../../components/Recepcionista/ListaRegistrosClinicos";
import MenuRecepcion from "../../components/Recepcionista/MenuRecepcion";
import { useFicha } from "../../hooks/useFicha";
import { useMascotas } from "../../hooks/useMascotas";
import "./Recepcionista.css";

const secciones = [
  { tipo: "vacunas", titulo: "Vacunas", agregar: "Agregar vacuna" },
  { tipo: "desparasitaciones", titulo: "Desparasitaciones", agregar: "Agregar desparasitación" },
  { tipo: "consultas", titulo: "Consultas y tratamientos", agregar: "Agregar consulta" },
];

function FichasPacientes() {
  // Los pacientes son todas las mascotas registradas (vienen de ms-mascotas)
  const { mascotas, cargando, error, sesionVencida: mascotasSinSesion, recargar } = useMascotas();

  const [pacienteId, setPacienteId] = useState("");
  const [edicion, setEdicion] = useState(null); // { tipo, registro } mientras hay un formulario abierto

  const paciente = mascotas.find((m) => String(m.id) === pacienteId) ?? mascotas[0];

  // La ficha del paciente elegido viene de ms-fichas
  const {
    ficha,
    cargando: cargandoFicha,
    error: errorFicha,
    errorAccion,
    sesionVencida: fichaSinSesion,
    recargar: recargarFicha,
    limpiarError,
    guardar,
    eliminar,
  } = useFicha(paciente?.id);

  function cambiarPaciente(evento) {
    setPacienteId(evento.target.value);
    setEdicion(null);
    limpiarError();
  }

  async function guardarRegistro(datos) {
    const { tipo, registro } = edicion;
    const guardado = await guardar(tipo, registro ? registro.id : null, datos);
    if (guardado) setEdicion(null);
  }

  async function eliminarRegistro(tipo, id) {
    if (window.confirm("¿Seguro que quieres eliminar este registro?")) {
      await eliminar(tipo, id);
    }
  }

  // El token venció mientras se usaba la página
  if (mascotasSinSesion || fichaSinSesion) return <Navigate to="/sesion-requerida" replace />;

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-4">
        <h1>Recepción</h1>
        <p className="text-secondary mb-0">Gestiona las citas y las fichas clínicas de los pacientes.</p>
      </header>

      <MenuRecepcion />

      <section className="panel-recepcion">
        <h2 className="h4 mb-3">Fichas de pacientes</h2>

        {cargando ? (
          <p className="text-secondary mb-0" role="status">
            Cargando pacientes...
          </p>
        ) : error ? (
          <Alert variant="danger" role="alert" className="mb-0">
            {error}{" "}
            <Alert.Link as="button" type="button" onClick={recargar}>
              Reintentar
            </Alert.Link>
          </Alert>
        ) : !paciente ? (
          <p className="text-secondary mb-0">Todavía no hay pacientes registrados.</p>
        ) : (
          <>
            <Form.Group className="mb-4" controlId="paciente">
              <Form.Label>Paciente</Form.Label>
              <Form.Select value={String(paciente.id)} onChange={cambiarPaciente}>
                {mascotas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.especie}) · tutor: {m.tutorCorreo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {errorAccion && (
              <Alert variant="danger" role="alert">
                {errorAccion}
              </Alert>
            )}

            {cargandoFicha && (
              <p className="text-secondary" role="status">
                Cargando la ficha...
              </p>
            )}

            {!cargandoFicha && errorFicha && (
              <Alert variant="danger" role="alert">
                {errorFicha}{" "}
                <Alert.Link as="button" type="button" onClick={recargarFicha}>
                  Reintentar
                </Alert.Link>
              </Alert>
            )}

            {!cargandoFicha && !errorFicha && secciones.map(({ tipo, titulo, agregar }) => (
              <div className="mb-4" key={tipo}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h3 className="h5 mb-0">{titulo}</h3>
                  {edicion?.tipo !== tipo && (
                    <Button size="sm" className="btn-contacto" onClick={() => setEdicion({ tipo, registro: null })}>
                      {agregar}
                    </Button>
                  )}
                </div>

                {edicion?.tipo === tipo && (
                  <FormularioRegistroClinico
                    key={`${tipo}-${edicion.registro ? edicion.registro.id : "nuevo"}`}
                    tipo={tipo}
                    registro={edicion.registro}
                    onGuardar={guardarRegistro}
                    onCancelar={() => setEdicion(null)}
                  />
                )}

                <ListaRegistrosClinicos
                  tipo={tipo}
                  registros={ficha[tipo]}
                  onEditar={(registro) => setEdicion({ tipo, registro })}
                  onEliminar={(id) => eliminarRegistro(tipo, id)}
                />
              </div>
            ))}
          </>
        )}
      </section>
    </main>
  );
}

export default FichasPacientes;
