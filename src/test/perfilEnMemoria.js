import { usuarioDemo } from "./perfilDemo";

// Simula el perfil de ms-auth en las pruebas: las funciones del servicio (ya reemplazadas con vi.mock)
// leen y escriben un perfil en memoria, igual que lo haría la base de datos.
export function instalarPerfilEnMemoria(servicio, inicial = usuarioDemo) {
  let perfil = { ...inicial };

  servicio.obtenerPerfil.mockReset();
  servicio.guardarPerfil.mockReset();
  servicio.obtenerPerfil.mockImplementation(async () => ({ ...perfil }));
  servicio.guardarPerfil.mockImplementation(async (datos) => {
    perfil = { ...perfil, ...datos, correo: perfil.correo, rol: perfil.rol };
    return { ...perfil };
  });
}
