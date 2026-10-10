// src/data/clinica.js
export const clinica = {
  nombre: "Veterinaria San Marcos",
  direccion: "Av. San Marcos 123, Rancagua",
  telefono: "+56 9 1234 5678",
};

// Horario regular de atención. Clave = día de la semana (0 = domingo ... 6 = sábado).
// Cada tramo es [desde, hasta]; entre tramos hay pausa (almuerzo).
export const horarioAtencion = {
  0: [],
  1: [["09:00", "13:00"], ["14:00", "18:00"]],
  2: [["09:00", "13:00"], ["14:00", "18:00"]],
  3: [["09:00", "13:00"], ["14:00", "18:00"]],
  4: [["09:00", "13:00"], ["14:00", "18:00"]],
  5: [["09:00", "13:00"], ["14:00", "18:00"]],
  6: [["10:00", "13:00"]],
};

export const horarioTexto = [
  "Lunes a viernes: 09:00 – 13:00 y 14:00 – 18:00",
  "Sábado: 10:00 – 13:00",
  "Domingo: cerrado",
];

// Reglas del agendamiento
export const agendamiento = {
  bloqueMin: 30, // las horas se ofrecen cada 30 minutos
  cuposPorBloque: 3, // un cupo por médico veterinario
  semanasMaximas: 4, // hasta cuántas semanas hacia adelante se puede agendar
  anticipacionMin: 120, // anticipación mínima (en minutos) respecto de la hora de inicio
};