// Ubicación de la clínica. Para cambiarla basta con editar estas constantes.
export const CLINICA = {
  nombre: "Veterinaria San Marcos",
  direccion: "Av. San Marcos 123, Rancagua",
  latitud: -34.1708,
  longitud: -70.7444,
};

export function urlComoLlegar(origen) {
  const destino = `${CLINICA.latitud},${CLINICA.longitud}`;
  const base = `https://www.google.com/maps/dir/?api=1&destination=${destino}`;
  return origen ? `${base}&origin=${origen.latitud},${origen.longitud}` : base;
}
