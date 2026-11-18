import { ROLES, cerrarSesion, guardarSesion, obtenerToken, obtenerUsuarioSesion, rutaInicialDelRol } from "./sesion";

const respuesta = { token: "abc.def.ghi", nombre: "Ana Pérez", correo: "ana@correo.cl", rol: "TUTOR" };

describe("sesion", () => {
  beforeEach(() => sessionStorage.clear());

  it("no hay sesión al comenzar", () => {
    expect(obtenerToken()).toBeNull();
    expect(obtenerUsuarioSesion()).toBeNull();
  });

  it("guarda el token y los datos del usuario", () => {
    guardarSesion(respuesta);
    expect(obtenerToken()).toBe("abc.def.ghi");
    expect(obtenerUsuarioSesion()).toEqual({ nombre: "Ana Pérez", correo: "ana@correo.cl", rol: "TUTOR" });
  });

  it("cerrar sesión elimina el token y el usuario", () => {
    guardarSesion(respuesta);
    cerrarSesion();
    expect(obtenerToken()).toBeNull();
    expect(obtenerUsuarioSesion()).toBeNull();
  });

  it("ignora una sesión dañada o sin token", () => {
    sessionStorage.setItem("sesionVeterinariaSanMarcos", "{dañado");
    expect(obtenerUsuarioSesion()).toBeNull();
    sessionStorage.setItem("sesionVeterinariaSanMarcos", JSON.stringify({ rol: "TUTOR" }));
    expect(obtenerUsuarioSesion()).toBeNull();
  });

  it("indica la página de inicio de cada rol", () => {
    expect(rutaInicialDelRol(ROLES.tutor)).toBe("/mi-perfil");
    expect(rutaInicialDelRol(ROLES.recepcionista)).toBe("/recepcion");
    expect(rutaInicialDelRol(ROLES.administrador)).toBe("/admin/usuarios");
  });
});
