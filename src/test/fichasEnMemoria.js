import { fichasClinicas } from "../data/fichasClinicas";

// Simula ms-fichas en las pruebas: las funciones del servicio (ya reemplazadas con vi.mock)
// leen y escriben en una ficha en memoria por mascota, igual que lo haría la base de datos.
// "iniciales" tiene la forma { [mascotaId]: { vacunas, desparasitaciones, consultas } }.
export function instalarFichasEnMemoria(servicio, iniciales = fichasClinicas) {
  ["listarFicha", "crearRegistro", "actualizarRegistro", "eliminarRegistro"].forEach((nombre) =>
    servicio[nombre].mockReset()
  );

  const fichas = JSON.parse(JSON.stringify(iniciales));
  let siguienteId = 1000;
  const de = (mascotaId) => (fichas[mascotaId] ??= { vacunas: [], desparasitaciones: [], consultas: [] });
  const copia = (valor) => JSON.parse(JSON.stringify(valor));

  servicio.listarFicha.mockImplementation(async (mascotaId) => copia(de(mascotaId)));
  servicio.crearRegistro.mockImplementation(async (mascotaId, lista, datos) => {
    const nuevo = { ...datos, id: siguienteId++ };
    de(mascotaId)[lista].push(nuevo);
    return copia(nuevo);
  });
  servicio.actualizarRegistro.mockImplementation(async (id, mascotaId, lista, datos) => {
    const editado = { ...datos, id };
    de(mascotaId)[lista] = de(mascotaId)[lista].map((r) => (r.id === id ? editado : r));
    return copia(editado);
  });
  servicio.eliminarRegistro.mockImplementation(async (id) => {
    Object.values(fichas).forEach((ficha) =>
      Object.keys(ficha).forEach((lista) => {
        ficha[lista] = ficha[lista].filter((r) => r.id !== id);
      })
    );
    return null;
  });

  return { fichas: () => fichas };
}
