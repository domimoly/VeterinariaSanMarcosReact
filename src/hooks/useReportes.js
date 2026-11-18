import { useEffect, useState } from "react";
import { listarCitas } from "../services/citaService";
import { listarMascotas } from "../services/mascotaService";
import { listarUsuarios } from "../services/usuarioService";
import { resumirReportes } from "../utils/reportes";

// Junta lo que el administrador puede ver de todo el sistema: cuentas (ms-auth), citas (ms-citas) y
// mascotas (ms-mascotas). El administrador recibe las listas completas, no solo las propias.
export function useReportes() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [sesionVencida, setSesionVencida] = useState(false);

  // Cada vez que cambia "intento" se vuelve a pedir todo (primera carga y "Reintentar")
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    Promise.all([listarUsuarios(), listarCitas(), listarMascotas()])
      .then(([usuarios, citas, mascotas]) => {
        if (!activo) return;
        setReporte(resumirReportes({ usuarios, citas, mascotas }));
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

  return { reporte, cargando, error, sesionVencida, recargar };
}
