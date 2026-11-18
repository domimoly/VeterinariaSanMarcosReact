import { useEffect, useState } from "react";
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  listarUsuarios,
} from "../services/usuarioService";

// Carga las cuentas desde ms-auth y expone las acciones del administrador.
// Cada acción devuelve true si salió bien (si no, el motivo queda en errorAccion).
// Si el token venció, sesionVencida pasa a true.
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [sesionVencida, setSesionVencida] = useState(false);

  // Cada vez que cambia "intento" se vuelve a pedir la lista (primera carga y "Reintentar")
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    listarUsuarios()
      .then((lista) => {
        if (!activo) return;
        setUsuarios(lista);
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

  const reemplazar = (usuario) => setUsuarios((actuales) => actuales.map((u) => (u.id === usuario.id ? usuario : u)));

  const crear = (datos) =>
    ejecutar(async () => {
      const nuevo = await crearUsuario(datos);
      setUsuarios((actuales) => [...actuales, nuevo]);
    });

  const actualizar = (id, datos) =>
    ejecutar(async () => reemplazar(await actualizarUsuario(id, datos)));

  const cambiarEstado = (id, activo) =>
    ejecutar(async () => reemplazar(await cambiarEstadoUsuario(id, activo)));

  return {
    usuarios,
    cargando,
    error,
    errorAccion,
    sesionVencida,
    recargar,
    limpiarError: () => setErrorAccion(""),
    crear,
    actualizar,
    cambiarEstado,
  };
}
