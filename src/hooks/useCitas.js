import { useEffect, useState } from "react";
import { cancelarCita, confirmarCita, crearCita, listarCitas, reagendarCita } from "../services/citaService";

// Carga las citas desde ms-citas (el tutor ve las suyas; la recepción, toda la agenda)
// y expone las acciones. Cada acción devuelve la cita resultante, o null si falló
// (el mensaje queda en errorAccion). Si el token venció, sesionVencida pasa a true.
export function useCitas() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [sesionVencida, setSesionVencida] = useState(false);

  // Cada vez que cambia "intento" se vuelve a pedir la lista (primera carga y "Reintentar")
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    listarCitas()
      .then((lista) => {
        if (!activo) return;
        setCitas(lista);
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
      return await accion();
    } catch (e) {
      if (e.estado === 401) setSesionVencida(true);
      else setErrorAccion(e.message);
      return null;
    }
  }

  const reemplazar = (cita) => setCitas((actuales) => actuales.map((c) => (c.id === cita.id ? cita : c)));

  const crear = (solicitud) =>
    ejecutar(async () => {
      const nueva = await crearCita(solicitud);
      setCitas((actuales) => [...actuales, nueva]);
      return nueva;
    });

  const confirmar = (id) =>
    ejecutar(async () => {
      const cita = await confirmarCita(id);
      reemplazar(cita);
      return cita;
    });

  const reagendar = (id, datos) =>
    ejecutar(async () => {
      const cita = await reagendarCita(id, datos);
      reemplazar(cita);
      return cita;
    });

  const cancelar = (id) =>
    ejecutar(async () => {
      const cita = await cancelarCita(id);
      reemplazar(cita);
      return cita;
    });

  return {
    citas,
    cargando,
    error,
    errorAccion,
    sesionVencida,
    recargar,
    limpiarError: () => setErrorAccion(""),
    crear,
    confirmar,
    reagendar,
    cancelar,
  };
}
