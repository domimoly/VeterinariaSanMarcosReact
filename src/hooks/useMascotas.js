import { useEffect, useState } from "react";
import { actualizarMascota, crearMascota, eliminarMascota, listarMascotas } from "../services/mascotaService";

// Carga las mascotas desde ms-mascotas y expone las acciones de crear, editar y eliminar.
// Cada acción devuelve true si salió bien. Si el token venció, sesionVencida pasa a true.
export function useMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [sesionVencida, setSesionVencida] = useState(false);

  // Cada vez que cambia "intento" se vuelve a pedir la lista (primera carga y "Reintentar")
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    listarMascotas()
      .then((lista) => {
        if (!activo) return;
        setMascotas(lista);
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

  const crear = (datos) =>
    ejecutar(async () => {
      const nueva = await crearMascota(datos);
      setMascotas((actuales) => [...actuales, nueva]);
    });

  const actualizar = (id, datos) =>
    ejecutar(async () => {
      const editada = await actualizarMascota(id, datos);
      setMascotas((actuales) => actuales.map((m) => (m.id === id ? editada : m)));
    });

  const eliminar = (id) =>
    ejecutar(async () => {
      await eliminarMascota(id);
      setMascotas((actuales) => actuales.filter((m) => m.id !== id));
    });

  return { mascotas, cargando, error, errorAccion, sesionVencida, recargar, crear, actualizar, eliminar };
}
