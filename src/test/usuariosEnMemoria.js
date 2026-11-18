// Cuentas de ejemplo con la forma que entrega usuarioService
export const usuariosDemo = [
  { id: 1, nombre: "Administrador San Marcos", correo: "admin@veterinariasanmarcos.cl", rol: "ADMINISTRADOR", activo: true, registro: "2026-01-10" },
  { id: 2, nombre: "Recepción San Marcos", correo: "recepcion@veterinariasanmarcos.cl", rol: "RECEPCIONISTA", activo: true, registro: "2026-01-10" },
  { id: 3, nombre: "Camila Rojas", correo: "camila@example.cl", rol: "TUTOR", activo: true, registro: "2026-02-15" },
  { id: 4, nombre: "Valentina Soto", correo: "valentina@example.cl", rol: "TUTOR", activo: false, registro: "" },
];

// Simula ms-auth en las pruebas: las funciones del servicio (ya reemplazadas con vi.mock)
// leen y escriben en una lista en memoria, igual que lo haría la base de datos.
export function instalarUsuariosEnMemoria(servicio, iniciales = usuariosDemo) {
  ["listarUsuarios", "crearUsuario", "actualizarUsuario", "cambiarEstadoUsuario"].forEach((nombre) =>
    servicio[nombre].mockReset()
  );

  let lista = iniciales.map((u) => ({ ...u }));
  let siguienteId = 100;

  servicio.listarUsuarios.mockImplementation(async () => lista.map((u) => ({ ...u })));
  servicio.crearUsuario.mockImplementation(async ({ nombre, correo, rol }) => {
    const nuevo = { id: siguienteId++, nombre, correo, rol, activo: true, registro: "2026-11-18" };
    lista = [...lista, nuevo];
    return { ...nuevo };
  });
  servicio.actualizarUsuario.mockImplementation(async (id, { nombre, rol }) => {
    lista = lista.map((u) => (u.id === id ? { ...u, nombre, rol } : u));
    return { ...lista.find((u) => u.id === id) };
  });
  servicio.cambiarEstadoUsuario.mockImplementation(async (id, activo) => {
    lista = lista.map((u) => (u.id === id ? { ...u, activo } : u));
    return { ...lista.find((u) => u.id === id) };
  });

  return { usuarios: () => lista };
}
