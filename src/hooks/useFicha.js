import { useEffect, useState } from "react";
import { actualizarRegistro, crearRegistro, eliminarRegistro, fichaVacia, listarFicha } from "../services/fichaService";

// Más reciente primero, igual que entrega ms-fichas
const porFechaDesc = (a, b) => b.fecha.localeCompare(a.fecha);

// Carga la ficha clínica de una mascota desde ms-fichas (cada vez que cambia la mascota)
// y expone las acciones de la recepción. Cada acción devuelve true si salió bien.
// Con mascotaId vacío no consulta nada.
export function useFicha(mascotaId) {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState({ clave: "", ficha: fichaVacia, error: "", sesionVencida: false });
  const [errorAccion, setErrorAccion] = useState("");
  const [sesionAccion, setSesionAccion] = useState(false);

  // Una sola cadena identifica la consulta: mascota + número de intento ("Reintentar")
  const clave = `${mascotaId}#${intento}`;

  useEffect(() => {
    if (mascotaId == null) return;
    let activo = true;
    listarFicha(mascotaId)
      .then((ficha) => activo && setResultado({ clave, ficha, error: "", sesionVencida: false }))
      .catch((e) =>
        activo && setResultado({ clave, ficha: fichaVacia, error: e.message, sesionVencida: e.estado === 401 })
      );
    return () => {
      activo = false;
    };
  }, [mascotaId, clave]);

  const actual = resultado.clave === clave;
  const ficha = actual ? resultado.ficha : fichaVacia;

  const cambiarLista = (lista, transformar) =>
    setResultado((previo) => ({ ...previo, ficha: { ...previo.ficha, [lista]: transformar(previo.ficha[lista]) } }));

  async function ejecutar(accion) {
    setErrorAccion("");
    try {
      await accion();
      return true;
    } catch (e) {
      if (e.estado === 401) setSesionAccion(true);
      else setErrorAccion(e.message);
      return false;
    }
  }

  // id vacío = registro nuevo; con id = edición
  const guardar = (lista, id, datos) =>
    ejecutar(async () => {
      if (id == null) {
        const nuevo = await crearRegistro(mascotaId, lista, datos);
        cambiarLista(lista, (registros) => [...registros, nuevo].sort(porFechaDesc));
      } else {
        const editado = await actualizarRegistro(id, mascotaId, lista, datos);
        cambiarLista(lista, (registros) => registros.map((r) => (r.id === id ? editado : r)).sort(porFechaDesc));
      }
    });

  const eliminar = (lista, id) =>
    ejecutar(async () => {
      await eliminarRegistro(id);
      cambiarLista(lista, (registros) => registros.filter((r) => r.id !== id));
    });

  return {
    ficha,
    cargando: mascotaId != null && !actual,
    error: actual ? resultado.error : "",
    errorAccion,
    sesionVencida: sesionAccion || (actual && resultado.sesionVencida),
    recargar: () => setIntento((n) => n + 1),
    limpiarError: () => setErrorAccion(""),
    guardar,
    eliminar,
  };
}
