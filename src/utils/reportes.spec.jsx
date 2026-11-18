import { resumirReportes } from "./reportes";

const usuarios = [
  { rol: "ADMINISTRADOR", activo: true },
  { rol: "TUTOR", activo: true },
  { rol: "TUTOR", activo: false },
];
const mascotas = [{ especie: "Perro" }, { especie: "Perro" }, { especie: "Gato" }];
const citas = [
  { estado: "Pendiente", servicioNombre: "Consulta General" },
  { estado: "Confirmada", servicioNombre: "Consulta General" },
  { estado: "Cancelada", servicioNombre: "Consulta General" },
  { estado: "Reagendada", servicioNombre: "Vacuna Triple Felina" },
];

describe("resumirReportes", () => {
  const reporte = resumirReportes({ usuarios, citas, mascotas });

  it("calcula los totales", () => {
    expect(reporte.totales).toEqual({ usuarios: 3, usuariosActivos: 2, mascotas: 3, citas: 4, citasPendientes: 1 });
  });

  it("cuenta las citas por estado en un orden fijo, incluso las que están en cero", () => {
    expect(reporte.citasPorEstado).toEqual([
      { nombre: "Pendiente", total: 1 },
      { nombre: "Confirmada", total: 1 },
      { nombre: "Reagendada", total: 1 },
      { nombre: "Cancelada", total: 1 },
    ]);
    expect(resumirReportes({ usuarios: [], citas: [], mascotas: [] }).citasPorEstado.every((e) => e.total === 0)).toBe(true);
  });

  it("ordena los servicios más solicitados y no cuenta las citas canceladas", () => {
    expect(reporte.serviciosMasSolicitados).toEqual([
      { nombre: "Consulta General", total: 2 },
      { nombre: "Vacuna Triple Felina", total: 1 },
    ]);
  });

  it("deja solo los cinco servicios más pedidos", () => {
    const muchas = Array.from({ length: 7 }, (_, i) => ({ estado: "Pendiente", servicioNombre: `Servicio ${i}` }));

    expect(resumirReportes({ usuarios: [], citas: muchas, mascotas: [] }).serviciosMasSolicitados).toHaveLength(5);
  });

  it("agrupa los usuarios por rol y las mascotas por especie", () => {
    expect(reporte.usuariosPorRol).toEqual([
      { nombre: "TUTOR", total: 2 },
      { nombre: "ADMINISTRADOR", total: 1 },
    ]);
    expect(reporte.mascotasPorEspecie).toEqual([
      { nombre: "Perro", total: 2 },
      { nombre: "Gato", total: 1 },
    ]);
  });
});
