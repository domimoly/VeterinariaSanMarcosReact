import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import FormularioRegistroClinico from "../../components/Recepcionista/FormularioRegistroClinico";
import ListaRegistrosClinicos from "../../components/Recepcionista/ListaRegistrosClinicos";
import MenuRecepcion from "../../components/Recepcionista/MenuRecepcion";
import { fichasClinicas } from "../../data/fichasClinicas";
import { mascotasDemo } from "../../data/Tutor/mascotas";
import { usuarioDemo } from "../../data/Tutor/usuario";
import "./Recepcionista.css";

const secciones = [
  { tipo: "vacunas", titulo: "Vacunas", agregar: "Agregar vacuna" },
  { tipo: "desparasitaciones", titulo: "Desparasitaciones", agregar: "Agregar desparasitación" },
  { tipo: "consultas", titulo: "Consultas y tratamientos", agregar: "Agregar consulta" },
];

const fichaVacia = { vacunas: [], desparasitaciones: [], consultas: [] };

function FichasPacientes() {
  // Los pacientes son las mascotas registradas; el tutor es el usuario de la cuenta
  const [mascotas] = useState(() => {
    const guardado = localStorage.getItem("mascotasVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : mascotasDemo;
  });
  const [tutor] = useState(() => {
    const guardado = localStorage.getItem("usuarioVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : usuarioDemo;
  });
  const [fichas, setFichas] = useState(() => {
    const guardado = localStorage.getItem("fichasClinicasVeterinariaSanMarcos");
    return guardado ? JSON.parse(guardado) : fichasClinicas;
  });

  const [pacienteId, setPacienteId] = useState("");
  const [edicion, setEdicion] = useState(null); // { tipo, registro } mientras hay un formulario abierto

  const paciente = mascotas.find((m) => String(m.id) === pacienteId) ?? mascotas[0];
  const ficha = paciente ? (fichas[paciente.id] ?? fichaVacia) : fichaVacia;

  // Se guarda al registrar o editar (no al abrir la página) para no congelar las fechas de demostración
  function guardarFichas(nuevas) {
    setFichas(nuevas);
    localStorage.setItem("fichasClinicasVeterinariaSanMarcos", JSON.stringify(nuevas));
  }

  function cambiarPaciente(evento) {
    setPacienteId(evento.target.value);
    setEdicion(null);
  }

  function guardarRegistro(datos) {
    const { tipo, registro } = edicion;
    const lista = registro
      ? ficha[tipo].map((existente) => (existente.id === registro.id ? { ...datos, id: existente.id } : existente))
      : [...ficha[tipo], { ...datos, id: Date.now() }];

    guardarFichas({ ...fichas, [paciente.id]: { ...ficha, [tipo]: lista } });
    setEdicion(null);
  }

  function eliminarRegistro(tipo, id) {
    if (window.confirm("¿Seguro que quieres eliminar este registro?")) {
      guardarFichas({ ...fichas, [paciente.id]: { ...ficha, [tipo]: ficha[tipo].filter((r) => r.id !== id) } });
    }
  }

  return (
    <main className="container py-4">
      <header className="encabezado-pagina text-center mb-4">
        <h1>Recepción</h1>
        <p className="text-secondary mb-0">Gestiona las citas y las fichas clínicas de los pacientes.</p>
      </header>

      <MenuRecepcion />

      <section className="panel-recepcion">
        <h2 className="h4 mb-3">Fichas de pacientes</h2>

        {!paciente ? (
          <p className="text-secondary mb-0">Todavía no hay pacientes registrados.</p>
        ) : (
          <>
            <Form.Group className="mb-4" controlId="paciente">
              <Form.Label>Paciente</Form.Label>
              <Form.Select value={String(paciente.id)} onChange={cambiarPaciente}>
                {mascotas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.especie}) · tutor: {tutor.nombre} {tutor.apellidos}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {secciones.map(({ tipo, titulo, agregar }) => (
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
