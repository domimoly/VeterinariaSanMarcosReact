// Arma los números del reporte del administrador a partir de las listas que entregan los microservicios.

function contar(lista, clave) {
  const conteo = new Map();
  lista.forEach((elemento) => {
    const valor = clave(elemento) || "Sin dato";
    conteo.set(valor, (conteo.get(valor) ?? 0) + 1);
  });
  return [...conteo.entries()].map(([nombre, total]) => ({ nombre, total }));
}

const porTotalDesc = (a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre);

export const ESTADOS_CITA = ["Pendiente", "Confirmada", "Reagendada", "Cancelada"];

export function resumirReportes({ usuarios, citas, mascotas }) {
  const estados = ESTADOS_CITA.map((nombre) => ({ nombre, total: citas.filter((c) => c.estado === nombre).length }));
  // Las canceladas no cuentan como demanda real de un servicio
  const vigentes = citas.filter((c) => c.estado !== "Cancelada");

  return {
    totales: {
      usuarios: usuarios.length,
      usuariosActivos: usuarios.filter((u) => u.activo).length,
      mascotas: mascotas.length,
      citas: citas.length,
      citasPendientes: estados[0].total,
    },
    citasPorEstado: estados,
    serviciosMasSolicitados: contar(vigentes, (c) => c.servicioNombre).sort(porTotalDesc).slice(0, 5),
    usuariosPorRol: contar(usuarios, (u) => u.rol).sort(porTotalDesc),
    mascotasPorEspecie: contar(mascotas, (m) => m.especie).sort(porTotalDesc),
  };
}
