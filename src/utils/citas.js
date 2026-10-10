export function servicioAplica(servicio, mascota) {
  if (!servicio.especies.includes(mascota.especie)) return false;
  if (servicio.sexo && servicio.sexo !== mascota.sexo) return false;
  if (servicio.pesoMin !== null && mascota.peso < servicio.pesoMin) return false;
  if (servicio.pesoMax !== null && mascota.peso > servicio.pesoMax) return false;
  if (servicio.soloNoEsterilizado && mascota.esterilizado) return false;
  return true;
}

// Un servicio aplica a una mascota si coincide su especie, sexo, peso y estado de esterilización.