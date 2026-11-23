// RUN chileno: se aceptan puntos y guion ("12.345.678-5"); el dígito verificador se calcula con módulo 11.
export function normalizarRun(texto) {
  const limpio = String(texto ?? "").replace(/[.\s-]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return null;

  const cuerpo = limpio.slice(0, -1);
  const digito = limpio.slice(-1);
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return digito === esperado ? `${cuerpo}-${digito}` : null;
}

export const esRunValido = (texto) => normalizarRun(texto) !== null;
