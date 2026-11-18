import { screen, waitFor } from "@testing-library/react";
import { citasDemo } from "../data/citas";

// Todas las medias horas de 09:00 a 17:30: así cualquier día laboral tiene horas libres
export const HORAS_LIBRES = Array.from({ length: 18 }, (_, i) => {
  const minutos = 9 * 60 + i * 30;
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
});

// Simula ms-citas en las pruebas: las funciones del servicio (ya reemplazadas con vi.mock)
// leen y escriben en una lista en memoria, igual que lo haría la base de datos.
export function instalarCitasEnMemoria(servicio, iniciales = citasDemo) {
  // Cada prueba empieza sin llamadas anteriores
  ["listarCitas", "crearCita", "confirmarCita", "reagendarCita", "cancelarCita", "horasLibres"].forEach((nombre) =>
    servicio[nombre].mockReset()
  );

  let lista = iniciales.map((c) => ({ ...c }));
  let siguienteId = 100;

  const cambiar = (id, cambios) => {
    const cita = { ...lista.find((c) => c.id === id), ...cambios };
    lista = lista.map((c) => (c.id === id ? cita : c));
    return { ...cita };
  };

  servicio.listarCitas.mockImplementation(async () => lista.map((c) => ({ ...c })));
  servicio.crearCita.mockImplementation(async (solicitud) => {
    const id = siguienteId++;
    const nueva = {
      id,
      codigo: `SM-${String(id).padStart(6, "0")}`,
      mascotaId: solicitud.mascota.id,
      mascotaNombre: solicitud.mascota.nombre,
      especie: solicitud.mascota.especie,
      servicioId: solicitud.servicio.id,
      servicioNombre: solicitud.servicio.nombre,
      duracion: solicitud.servicio.duracion,
      duracionMin: solicitud.servicio.duracionMin,
      precio: solicitud.servicio.precio,
      fecha: solicitud.fecha,
      hora: solicitud.hora,
      observaciones: solicitud.observaciones,
      tutor: solicitud.tutor,
      estado: "Pendiente",
      nota: "",
    };
    lista = [...lista, nueva];
    return { ...nueva };
  });
  servicio.confirmarCita.mockImplementation(async (id) => cambiar(id, { estado: "Confirmada" }));
  servicio.reagendarCita.mockImplementation(async (id, datos) => cambiar(id, { ...datos, estado: "Reagendada" }));
  servicio.cancelarCita.mockImplementation(async (id) => cambiar(id, { estado: "Cancelada" }));
  servicio.horasLibres.mockImplementation(async () => [...HORAS_LIBRES]);

  return { citas: () => lista };
}

// Espera a que ms-citas responda las horas libres (después de abrir el paso o de cambiar de semana)
export const esperarHoras = () =>
  waitFor(() => expect(screen.queryByText("Consultando horas disponibles...")).not.toBeInTheDocument());
