import { useEffect, useState } from "react";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "../services/productoService";

// Carga el catálogo desde ms-productos. La tienda solo lee; el administrador usa además las acciones
// (con incluirInactivos para ver también los desactivados). Cada acción devuelve true si salió bien.
export function useProductos({ incluirInactivos = false } = {}) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [sesionVencida, setSesionVencida] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    listarProductos({ incluirInactivos })
      .then((lista) => {
        if (!activo) return;
        setProductos(lista);
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
  }, [intento, incluirInactivos]);

  function recargar() {
    setCargando(true);
    setIntento((n) => n + 1);
  }

  async function ejecutar(accion) {
    setErrorAccion("");
    try {
      await accion();
      return true;
    } catch (e) {
      if (e.estado === 401) setSesionVencida(true);
      else setErrorAccion(e.message);
      return false;
    }
  }

  const crear = (datos) =>
    ejecutar(async () => {
      const nuevo = await crearProducto(datos);
      setProductos((actuales) => [...actuales, nuevo]);
    });

  const actualizar = (id, datos) =>
    ejecutar(async () => {
      const guardado = await actualizarProducto(id, datos);
      setProductos((actuales) => actuales.map((p) => (p.id === id ? guardado : p)));
    });

  const eliminar = (id) =>
    ejecutar(async () => {
      await eliminarProducto(id);
      setProductos((actuales) => actuales.filter((p) => p.id !== id));
    });

  return {
    productos,
    cargando,
    error,
    errorAccion,
    sesionVencida,
    recargar,
    limpiarError: () => setErrorAccion(""),
    crear,
    actualizar,
    eliminar,
  };
}
