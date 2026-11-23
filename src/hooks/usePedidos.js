import { useEffect, useState } from "react";
import { cancelarPedido, entregarPedido, listarPedidos } from "../services/pedidoService";

// Carga los pedidos desde ms-pedidos: el cliente recibe los suyos y el personal todos.
// Las acciones (entregar, cancelar) son solo para recepción y administrador.
export function usePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [sesionVencida, setSesionVencida] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    listarPedidos()
      .then((lista) => {
        if (!activo) return;
        setPedidos(lista);
        setError("");
      })
      .catch((e) => {
        if (!activo) return;
        if (e.estado === 401) setSesionVencida(true);
        else setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [intento]);

  function recargar() {
    setCargando(true);
    setIntento((n) => n + 1);
  }

  async function ejecutar(accion, id) {
    setErrorAccion("");
    try {
      const actualizado = await accion(id);
      setPedidos((actuales) => actuales.map((p) => (p.id === id ? actualizado : p)));
      return true;
    } catch (e) {
      if (e.estado === 401) setSesionVencida(true);
      else setErrorAccion(e.message);
      return false;
    }
  }

  return {
    pedidos,
    cargando,
    error,
    errorAccion,
    sesionVencida,
    recargar,
    entregar: (id) => ejecutar(entregarPedido, id),
    cancelar: (id) => ejecutar(cancelarPedido, id),
  };
}
