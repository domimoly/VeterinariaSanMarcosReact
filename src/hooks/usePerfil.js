import { useEffect, useState } from "react";
import { guardarPerfil, obtenerPerfil } from "../services/perfilService";

// Carga los datos personales del tutor desde ms-auth y permite guardarlos.
// guardar() devuelve true si salió bien. Si el token venció, sesionVencida pasa a true.
export function usePerfil() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [sesionVencida, setSesionVencida] = useState(false);

  // Cada vez que cambia "intento" se vuelve a pedir el perfil (primera carga y "Reintentar")
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    obtenerPerfil()
      .then((datos) => {
        if (!activo) return;
        setPerfil(datos);
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

  async function guardar(datos) {
    setErrorAccion("");
    try {
      setPerfil(await guardarPerfil(datos));
      return true;
    } catch (e) {
      if (e.estado === 401) setSesionVencida(true);
      else setErrorAccion(e.message);
      return false;
    }
  }

  return { perfil, cargando, error, errorAccion, sesionVencida, recargar, guardar };
}
