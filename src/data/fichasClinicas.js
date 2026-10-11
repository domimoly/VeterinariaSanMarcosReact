// src/data/fichasClinicas.js
// La ficha la registra el personal de la clínica; el dueño solo la consulta.
// La clave es el id de la mascota.
import { fechaRelativa as dia } from "../utils/fechas";

// Las fechas son relativas a hoy para que siempre se vean los tres estados:
// "al día" (más de 30 días), "vence pronto" (30 días o menos) y "vencida" (ya pasó).
export const fichasClinicas = {
  1: {
    vacunas: [
      { id: 1, nombre: "Séxtuple canina", fecha: dia(-325), proximaDosis: dia(40) },
      { id: 2, nombre: "Antirrábica", fecha: dia(-390), proximaDosis: dia(-25) },
      { id: 3, nombre: "Tos de las perreras", fecha: dia(-347), proximaDosis: dia(18) },
    ],
    desparasitaciones: [
      { id: 1, nombre: "Antiparasitario interno", fecha: dia(-100), proximaDosis: dia(80) },
      { id: 2, nombre: "Antipulgas y garrapatas", fecha: dia(-15), proximaDosis: dia(15) },
    ],
    consultas: [
      {
        id: 1,
        fecha: dia(-60),
        motivo: "Control anual",
        diagnostico: "Paciente sano, buen estado general.",
        medicamentos: "Ninguno",
        veterinario: "Dra. Paula Muñoz",
        proximoControl: dia(305),
      },
      {
        id: 2,
        fecha: dia(-220),
        motivo: "Picazón en la piel",
        diagnostico: "Dermatitis alérgica leve.",
        medicamentos: "Antihistamínico 10 mg cada 12 hrs por 5 días",
        veterinario: "Dr. Andrés Soto",
        proximoControl: "",
      },
    ],
  },
  2: {
    vacunas: [
      { id: 1, nombre: "Triple felina", fecha: dia(-240), proximaDosis: dia(125) },
      { id: 2, nombre: "Leucemia felina", fecha: dia(-345), proximaDosis: dia(20) },
    ],
    desparasitaciones: [
      { id: 1, nombre: "Antiparasitario interno", fecha: dia(-50), proximaDosis: dia(40) },
    ],
    consultas: [
      {
        id: 1,
        fecha: dia(-130),
        motivo: "Vómitos recurrentes",
        diagnostico: "Gastritis leve.",
        medicamentos: "Omeprazol 5 mg cada 24 hrs por 7 días",
        veterinario: "Dra. Paula Muñoz",
        proximoControl: dia(-116),
      },
    ],
  },
};
