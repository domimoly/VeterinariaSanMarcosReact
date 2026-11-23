// Pedidos de ejemplo con la forma que entrega pedidoService
export const pedidosDemo = [
  {
    id: 1,
    numero: "00000001",
    estado: "PAGADO",
    total: 12600,
    fecha: "2026-11-20",
    hora: "10:15",
    clienteCorreo: "camila@example.cl",
    nombre: "Camila",
    apellidos: "Rojas",
    correo: "camila@example.cl",
    calle: "Los Crisantemos 123",
    departamento: "",
    region: "Región Metropolitana",
    comuna: "Santiago",
    indicaciones: "",
    lineas: [{ codigo: "MED-001", nombre: "Amoxibay 250mg", precioUnitario: 4200, cantidad: 3, subtotal: 12600 }],
  },
  {
    id: 2,
    numero: "00000002",
    estado: "ENTREGADO",
    total: 6800,
    fecha: "2026-11-18",
    hora: "16:40",
    clienteCorreo: "valentina@example.cl",
    nombre: "Valentina",
    apellidos: "Soto",
    correo: "valentina@example.cl",
    calle: "Av. Siempre Viva 742",
    departamento: "12B",
    region: "Región de Valparaíso",
    comuna: "Viña del Mar",
    indicaciones: "Dejar con conserje",
    lineas: [{ codigo: "MED-002", nombre: "Enrox 50mg", precioUnitario: 6800, cantidad: 1, subtotal: 6800 }],
  },
];

// Simula ms-pedidos en las pruebas con una lista en memoria
export function instalarPedidosEnMemoria(servicio, iniciales = pedidosDemo) {
  ["crearPedido", "listarPedidos", "entregarPedido", "cancelarPedido"].forEach((nombre) => servicio[nombre].mockReset());

  let lista = iniciales.map((p) => ({ ...p }));
  let siguienteId = 100;
  const cambiar = (id, estado) => {
    lista = lista.map((p) => (p.id === id ? { ...p, estado } : p));
    return { ...lista.find((p) => p.id === id) };
  };

  servicio.listarPedidos.mockImplementation(async () => lista.map((p) => ({ ...p })));
  servicio.crearPedido.mockImplementation(async (datos, items) => {
    const id = siguienteId++;
    const nuevo = {
      id,
      numero: String(id).padStart(8, "0"),
      estado: "PAGADO",
      total: items.reduce((suma, i) => suma + i.cantidad * 1000, 0),
      fecha: "2026-11-23",
      hora: "15:00",
      clienteCorreo: datos.correo,
      ...datos,
      lineas: items.map((i) => ({ ...i, nombre: i.codigo, precioUnitario: 1000, subtotal: i.cantidad * 1000 })),
    };
    lista = [nuevo, ...lista];
    return { ...nuevo };
  });
  servicio.entregarPedido.mockImplementation(async (id) => cambiar(id, "ENTREGADO"));
  servicio.cancelarPedido.mockImplementation(async (id) => cambiar(id, "CANCELADO"));

  return { pedidos: () => lista };
}
