import { citasACsv, estaEnPeriodo, nombreMes, resumirReportes } from "./reportes";

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
    expect(reporte.totales).toEqual({ usuarios: 3, usuariosActivos: 2, mascotas: 3, citas: 4, citasPendientes: 1, pacientesNuevos: 3 });
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

describe("reportes por período", () => {
  const citasFechadas = [
    { codigo: "C-1", fecha: "2026-10-05", hora: "10:00", estado: "Confirmada", servicioNombre: "Consulta General", mascotaNombre: "Luna", especie: "Perro", tutorCorreo: "a@a.cl" },
    { codigo: "C-2", fecha: "2026-11-02", hora: "11:00", estado: "Pendiente", servicioNombre: "Consulta General", mascotaNombre: "Michi", especie: "Gato", tutorCorreo: "b@b.cl" },
    { codigo: "C-3", fecha: "2026-11-20", hora: "12:00", estado: "Cancelada", servicioNombre: "Vacuna Triple Felina", mascotaNombre: "Michi", especie: "Gato", tutorCorreo: "b@b.cl" },
  ];
  const mascotasFechadas = [
    { especie: "Perro", registradaEn: "2026-10-03" },
    { especie: "Gato", registradaEn: "2026-11-01" },
    { especie: "Gato", registradaEn: "2026-11-15" },
    { especie: "Perro", registradaEn: "" },
  ];

  it("sin límites incluye todo, incluso lo que no tiene fecha", () => {
    expect(estaEnPeriodo("", "", "")).toBe(true);
    expect(estaEnPeriodo("", "2026-11-01", "")).toBe(false);
  });

  it("incluye los días de los extremos", () => {
    expect(estaEnPeriodo("2026-11-01", "2026-11-01", "2026-11-30")).toBe(true);
    expect(estaEnPeriodo("2026-11-30", "2026-11-01", "2026-11-30")).toBe(true);
    expect(estaEnPeriodo("2026-10-31", "2026-11-01", "2026-11-30")).toBe(false);
    expect(estaEnPeriodo("2026-12-01", "2026-11-01", "2026-11-30")).toBe(false);
  });

  it("filtra las citas y los pacientes nuevos por el período, pero no cuentas ni mascotas totales", () => {
    const r = resumirReportes({ usuarios, citas: citasFechadas, mascotas: mascotasFechadas, desde: "2026-11-01", hasta: "2026-11-30" });

    expect(r.totales.citas).toBe(2);
    expect(r.totales.pacientesNuevos).toBe(2);
    expect(r.totales.usuarios).toBe(3);
    expect(r.totales.mascotas).toBe(4);
    expect(r.citasPeriodo.map((c) => c.codigo)).toEqual(["C-2", "C-3"]);
    expect(r.serviciosMasSolicitados).toEqual([{ nombre: "Consulta General", total: 1 }]);
  });

  it("agrupa por mes de más antiguo a más reciente, sin contar las canceladas ni lo que no tiene fecha", () => {
    const r = resumirReportes({ usuarios, citas: citasFechadas, mascotas: mascotasFechadas });

    expect(r.citasPorMes).toEqual([
      { nombre: "2026-10", total: 1 },
      { nombre: "2026-11", total: 1 },
    ]);
    expect(r.pacientesNuevosPorMes).toEqual([
      { nombre: "2026-10", total: 1 },
      { nombre: "2026-11", total: 2 },
    ]);
  });

  it("escribe el nombre del mes en español", () => {
    expect(nombreMes("2026-11")).toBe("Noviembre 2026");
    expect(nombreMes("2027-01")).toBe("Enero 2027");
  });

  it("arma el CSV con encabezado, comillas escapadas y separador punto y coma", () => {
    const csv = citasACsv([{ ...citasFechadas[0], mascotaNombre: 'Luna "la grande"' }]);
    const [encabezado, fila] = csv.split("\r\n");

    expect(encabezado).toBe('"Código";"Fecha";"Hora";"Mascota";"Especie";"Servicio";"Tutor";"Estado"');
    expect(fila).toBe('"C-1";"2026-10-05";"10:00";"Luna ""la grande""";"Perro";"Consulta General";"a@a.cl";"Confirmada"');
  });
});
