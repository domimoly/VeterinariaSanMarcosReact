/*La ficha la registra el personal de la clínica; el dueño solo la consulta y la clave es el id de la mascota. */
export const fichasClinicas = {
  1: {
    vacunas: [
      { id: 1, nombre: "Séxtuple canina", fecha: "2025-11-20", proximaDosis: "2026-11-20" },
      { id: 2, nombre: "Antirrábica", fecha: "2025-09-15", proximaDosis: "2026-09-15" },
      { id: 3, nombre: "Tos de las perreras", fecha: "2026-09-25", proximaDosis: "2026-10-25" },
    ],
    desparasitaciones: [
      { id: 1, nombre: "Antiparasitario interno", fecha: "2026-07-01", proximaDosis: "2026-12-01" },
      { id: 2, nombre: "Antipulgas y garrapatas", fecha: "2026-09-20", proximaDosis: "2026-10-20" },
    ],
    consultas: [
      {
        id: 1,
        fecha: "2026-08-12",
        motivo: "Control anual",
        diagnostico: "Paciente sano, buen estado general.",
        medicamentos: "Ninguno",
        veterinario: "Dra. Paula Muñoz",
        proximoControl: "2027-08-12",
      },
      {
        id: 2,
        fecha: "2026-03-05",
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
      { id: 1, nombre: "Triple felina", fecha: "2026-02-10", proximaDosis: "2027-02-10" },
      { id: 2, nombre: "Leucemia felina", fecha: "2025-10-30", proximaDosis: "2026-10-30" },
    ],
    desparasitaciones: [
      { id: 1, nombre: "Antiparasitario interno", fecha: "2026-08-15", proximaDosis: "2026-11-15" },
    ],
    consultas: [
      {
        id: 1,
        fecha: "2026-06-03",
        motivo: "Vómitos recurrentes",
        diagnostico: "Gastritis leve.",
        medicamentos: "Omeprazol 5 mg cada 24 hrs por 7 días",
        veterinario: "Dra. Paula Muñoz",
        proximoControl: "2026-06-17",
      },
    ],
  },
};