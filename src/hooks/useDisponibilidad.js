import { useEffect, useState } from "react";
import { horasLibres } from "../services/citaService";

// Pide a ms-citas las horas con cupo de cada día indicado, para un servicio.
// libres[fecha] es la lista de horas libres ("09:00"...). Mientras llega la respuesta, cargando es true.
export function useDisponibilidad(servicioId, fechas) {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState({ clave: "", libres: {}, error: "", sesionVencida: false });

  // Una sola cadena identifica la consulta; así el efecto solo se repite cuando cambia de verdad
  const clave = `${servicioId}|${fechas.join(",")}#${intento}`;

  useEffect(() => {
    let activo = true;
    const [consulta] = clave.split("#");
    const [servicio, dias] = consulta.split("|");
    const lista = dias.split(",");

    Promise.all(lista.map((fecha) => horasLibres(fecha, servicio)))
      .then((respuestas) => {
        if (!activo) return;
        setResultado({ clave, libres: Object.fromEntries(lista.map((f, i) => [f, respuestas[i]])), error: "", sesionVencida: false });
      })
      .catch((e) => {
        if (!activo) return;
        setResultado({ clave, libres: {}, error: e.message, sesionVencida: e.estado === 401 });
      });

    return () => {
      activo = false;
    };
  }, [clave]);

  return {
    libres: resultado.libres,
    cargando: resultado.clave !== clave,
    error: resultado.clave === clave ? resultado.error : "",
    sesionVencida: resultado.sesionVencida,
    recargar: () => setIntento((n) => n + 1),
  };
}
