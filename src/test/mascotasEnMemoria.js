import { mascotasDemo } from "../data/Tutor/mascotas";

// Simula ms-mascotas en las pruebas: las funciones del servicio (ya reemplazadas con vi.mock)
// leen y escriben en una lista en memoria, igual que lo haría la base de datos.
export function instalarMascotasEnMemoria(servicio, iniciales = mascotasDemo) {
  let lista = iniciales.map((m) => ({ ...m, tutorCorreo: m.tutorCorreo ?? "camila.rojas@example.cl" }));
  let siguienteId = 100;

  servicio.listarMascotas.mockImplementation(async () => lista.map((m) => ({ ...m })));
  servicio.crearMascota.mockImplementation(async (datos) => {
    const nueva = { ...datos, id: siguienteId++, tutorCorreo: "camila.rojas@example.cl" };
    lista = [...lista, nueva];
    return nueva;
  });
  servicio.actualizarMascota.mockImplementation(async (id, datos) => {
    const editada = { ...datos, id, tutorCorreo: "camila.rojas@example.cl" };
    lista = lista.map((m) => (m.id === id ? editada : m));
    return editada;
  });
  servicio.eliminarMascota.mockImplementation(async (id) => {
    lista = lista.filter((m) => m.id !== id);
    return null;
  });
}
