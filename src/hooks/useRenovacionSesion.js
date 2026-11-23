import { useEffect } from "react";
import { renovarToken } from "../services/authService";
import { cerrarSesion, expiracionDelToken, guardarSesion, obtenerToken } from "../utils/sesion";

export const REVISION_MS = 60 * 1000;
export const MARGEN_RENOVACION_MS = 5 * 60 * 1000;

// Mantiene viva la sesión: mientras haya un token, cada minuto revisa cuánto le queda
// y lo renueva cuando faltan menos de 5 minutos. Si ya venció o la renovación falla, cierra la sesión.
export function useRenovacionSesion() {
  useEffect(() => {
    let renovando = false;

    async function revisar() {
      const token = obtenerToken();
      if (!token || renovando) return;
      const vence = expiracionDelToken(token);
      if (vence === null) return;
      if (vence <= Date.now()) {
        cerrarSesion();
        return;
      }
      if (vence - Date.now() > MARGEN_RENOVACION_MS) return;

      renovando = true;
      try {
        guardarSesion(await renovarToken(token));
      } catch {
        cerrarSesion();
      } finally {
        renovando = false;
      }
    }

    const temporizador = setInterval(revisar, REVISION_MS);
    return () => clearInterval(temporizador);
  }, []);
}
