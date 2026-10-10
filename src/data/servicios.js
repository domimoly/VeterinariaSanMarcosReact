// src/data/servicios.js
// Además de lo que se muestra en la tarjeta, cada servicio define a quién aplica
// (especies, sexo, peso) para validar el agendamiento de citas.
export const categoriasServicios = [
  {
    "id": "titulo-consultas",
    "titulo": "Consultas",
    "items": [
      {
        "id": "consulta-general",
        "icono": "fa-solid fa-stethoscope",
        "nombre": "Consulta General",
        "descripcion": "Evaluación médica integral para Perros y Gatos. Revisión completa del estado de salud de tu mascota.",
        "duracion": "30 min",
        "duracionMin": 30,
        "precio": "$15.000",
        "categoriaSlug": "consultas",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "consulta-urgencia",
        "icono": "fa-solid fa-truck-medical",
        "nombre": "Consulta Urgencia",
        "descripcion": "Atención prioritaria y estabilización para Perros y Gatos en situación crítica. * Fuera de horario aplica recargo de +$10.000.",
        "duracion": "30 min",
        "duracionMin": 30,
        "precio": "$25.000",
        "categoriaSlug": "consultas",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": false,
        "motivoNoAgendable": "Atención inmediata: llama o acércate a la clínica (urgencias 24 hrs)."
      },
      {
        "id": "segunda-opinion-medica",
        "icono": "fa-solid fa-user-doctor",
        "nombre": "Segunda Opinión Médica",
        "descripcion": "Revisión detallada de casos clínicos complejos. Válido para todas las especies. * Requiere traer ficha clínica previa.",
        "duracion": "40 min",
        "duracionMin": 40,
        "precio": "$20.000",
        "categoriaSlug": "consultas",
        "especies": [
          "Perro",
          "Gato",
          "Conejo",
          "Ave"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "consulta-ave-conejo",
        "icono": "fa-solid fa-paw",
        "nombre": "Consulta Ave/Conejo",
        "descripcion": "Atención especializada enfocada en el cuidado y tratamiento exclusivo de aves y conejos domésticos.",
        "duracion": "30 min",
        "duracionMin": 30,
        "precio": "$18.000",
        "categoriaSlug": "consultas",
        "especies": [
          "Conejo",
          "Ave"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      }
    ]
  },
  {
    "id": "titulo-vacunas",
    "titulo": "Plan de Vacunación",
    "items": [
      {
        "id": "vacuna-sextuple-canina",
        "icono": "fa-solid fa-syringe",
        "nombre": "Vacuna Séxtuple Canina",
        "descripcion": "Inmunización para Perros contra las principales enfermedades infecciosas. * Requiere refuerzo anual.",
        "duracion": "10 min",
        "duracionMin": 10,
        "precio": "$18.000",
        "categoriaSlug": "vacunas",
        "especies": [
          "Perro"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "vacuna-antirrabica-canina",
        "icono": "fa-solid fa-syringe",
        "nombre": "Vacuna Antirrábica Canina",
        "descripcion": "Aplicación de vacuna contra la rabia para Perros. * Vacunación obligatoria por ley.",
        "duracion": "10 min",
        "duracionMin": 10,
        "precio": "$12.000",
        "categoriaSlug": "vacunas",
        "especies": [
          "Perro"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "vacuna-triple-felina",
        "icono": "fa-solid fa-syringe",
        "nombre": "Vacuna Triple Felina",
        "descripcion": "Protección esencial para Gatos contra rinotraqueítis, calicivirosis y panleucopenia. * Requiere refuerzo anual.",
        "duracion": "10 min",
        "duracionMin": 10,
        "precio": "$17.000",
        "categoriaSlug": "vacunas",
        "especies": [
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "vacuna-bordetella-canina",
        "icono": "fa-solid fa-syringe",
        "nombre": "Vacuna Bordetella Canina",
        "descripcion": "Inmunización preventiva para Perros. Altamente recomendada para evitar la enfermedad conocida como \"Tos de las perreras\".",
        "duracion": "10 min",
        "duracionMin": 10,
        "precio": "$14.000",
        "categoriaSlug": "vacunas",
        "especies": [
          "Perro"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      }
    ]
  },
  {
    "id": "titulo-cirugias",
    "titulo": "Cirugías",
    "items": [
      {
        "id": "esterilizacion-canina",
        "icono": "fa-solid fa-kit-medical",
        "nombre": "Esterilización Canina",
        "descripcion": "Procedimiento quirúrgico para Caninas. * Hembras: Incluye anestesia y hospitalización 24h.",
        "duracion": "90 min",
        "duracionMin": 90,
        "precio": "$80.000",
        "categoriaSlug": "cirugias",
        "especies": [
          "Perro"
        ],
        "sexo": "Hembra",
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": true,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "esterilizacion-macho-canino",
        "icono": "fa-solid fa-scissors",
        "nombre": "Esterilización Macho Canino",
        "descripcion": "Procedimiento quirúrgico para Perros. * Incluye anestesia.",
        "duracion": "60 min",
        "duracionMin": 60,
        "precio": "$60.000",
        "categoriaSlug": "cirugias",
        "especies": [
          "Perro"
        ],
        "sexo": "Macho",
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": true,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "esterilizacion-hembra-felina",
        "icono": "fa-solid fa-kit-medical",
        "nombre": "Esterilización Hembra Felina",
        "descripcion": "Procedimiento quirúrgico para Gatas. * Incluye anestesia y hospitalización 12h.",
        "duracion": "60 min",
        "duracionMin": 60,
        "precio": "$65.000",
        "categoriaSlug": "cirugias",
        "especies": [
          "Gato"
        ],
        "sexo": "Hembra",
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": true,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "esterilizacion-macho-felino",
        "icono": "fa-solid fa-scissors",
        "nombre": "Esterilización Macho Felino",
        "descripcion": "Procedimiento quirúrgico para Gatos. * Incluye anestesia.",
        "duracion": "45 min",
        "duracionMin": 45,
        "precio": "$50.000",
        "categoriaSlug": "cirugias",
        "especies": [
          "Gato"
        ],
        "sexo": "Macho",
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": true,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "extirpacion-de-tumor-cutaneo",
        "icono": "fa-solid fa-truck-medical",
        "nombre": "Extirpación de Tumor Cutáneo",
        "descripcion": "Cirugía oncológica menor para Perros y Gatos. * Precio referencial; varía según tamaño.",
        "duracion": "60 min",
        "duracionMin": 60,
        "precio": "$120.000",
        "categoriaSlug": "cirugias",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "cesarea-de-urgencia",
        "icono": "fa-solid fa-truck-medical",
        "nombre": "Cesárea de Urgencia",
        "descripcion": "Atención obstétrica de emergencia para Perras y Gatas.",
        "duracion": "120 min",
        "duracionMin": 120,
        "precio": "$180.000",
        "categoriaSlug": "cirugias",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": "Hembra",
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": false,
        "motivoNoAgendable": "Atención inmediata: llama o acércate a la clínica (urgencias 24 hrs)."
      }
    ]
  },
  {
    "id": "titulo-desparasitacion",
    "titulo": "Desparasitación",
    "items": [
      {
        "id": "interna-pequenos-10-kg",
        "icono": "fa-solid fa-bug-slash",
        "nombre": "Interna Pequeños (< 10 kg)",
        "descripcion": "Tratamiento antiparasitario interno para Perros de tamaño pequeño.",
        "duracion": "5 min",
        "duracionMin": 5,
        "precio": "$8.000",
        "categoriaSlug": "desparasitacion",
        "especies": [
          "Perro"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": 9.99,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "interna-medianos-10-25-kg",
        "icono": "fa-solid fa-bug-slash",
        "nombre": "Interna Medianos (10-25 kg)",
        "descripcion": "Tratamiento antiparasitario interno para Perros de tamaño mediano.",
        "duracion": "5 min",
        "duracionMin": 5,
        "precio": "$9.500",
        "categoriaSlug": "desparasitacion",
        "especies": [
          "Perro"
        ],
        "sexo": null,
        "pesoMin": 10,
        "pesoMax": 25,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "interna-grandes-25-kg",
        "icono": "fa-solid fa-bug-slash",
        "nombre": "Interna Grandes (> 25 kg)",
        "descripcion": "Tratamiento antiparasitario interno para Perros de tamaño grande.",
        "duracion": "5 min",
        "duracionMin": 5,
        "precio": "$11.000",
        "categoriaSlug": "desparasitacion",
        "especies": [
          "Perro"
        ],
        "sexo": null,
        "pesoMin": 25.01,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "interna-felina",
        "icono": "fa-solid fa-bug-slash",
        "nombre": "Interna Felina",
        "descripcion": "Tratamiento antiparasitario interno específico para Gatos.",
        "duracion": "5 min",
        "duracionMin": 5,
        "precio": "$8.000",
        "categoriaSlug": "desparasitacion",
        "especies": [
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "antiparasitario-externo-pipeta",
        "icono": "fa-solid fa-bug-slash",
        "nombre": "Antiparasitario Externo (Pipeta)",
        "descripcion": "Protección contra pulgas y garrapatas para Perros y Gatos. * Incluye aplicación en clínica.",
        "duracion": "5 min",
        "duracionMin": 5,
        "precio": "$7.500",
        "categoriaSlug": "desparasitacion",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      }
    ]
  },
  {
    "id": "titulo-examenes",
    "titulo": "Exámenes y Diagnóstico",
    "items": [
      {
        "id": "hemograma-completo",
        "icono": "fa-solid fa-vial",
        "nombre": "Hemograma Completo",
        "descripcion": "Examen de sangre preventivo y diagnóstico para Perros y Gatos. * Resultado en 24-48 h.",
        "duracion": "30 min",
        "duracionMin": 30,
        "precio": "$22.000",
        "categoriaSlug": "examenes",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "perfil-bioquimico-completo",
        "icono": "fa-solid fa-vial",
        "nombre": "Perfil Bioquímico Completo",
        "descripcion": "Evaluación de órganos vitales para Perros y Gatos. * Resultado en 24-48 h.",
        "duracion": "30 min",
        "duracionMin": 30,
        "precio": "$35.000",
        "categoriaSlug": "examenes",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "radiografia-1-proyeccion",
        "icono": "fa-solid fa-x-ray",
        "nombre": "Radiografía (1 proyección)",
        "descripcion": "Diagnóstico por imagen para evaluación ósea y torácica en Perros y Gatos.",
        "duracion": "20 min",
        "duracionMin": 20,
        "precio": "$28.000",
        "categoriaSlug": "examenes",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "ecografia-abdominal",
        "icono": "fa-solid fa-x-ray",
        "nombre": "Ecografía Abdominal",
        "descripcion": "Estudio de imagenología no invasivo para órganos internos en Perros y Gatos.",
        "duracion": "30 min",
        "duracionMin": 30,
        "precio": "$45.000",
        "categoriaSlug": "examenes",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "test-de-leishmaniasis",
        "icono": "fa-solid fa-vial",
        "nombre": "Test de Leishmaniasis",
        "descripcion": "Prueba rápida para la detección de esta enfermedad infecciosa en Perros.",
        "duracion": "20 min",
        "duracionMin": 20,
        "precio": "$18.000",
        "categoriaSlug": "examenes",
        "especies": [
          "Perro"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      }
    ]
  },
  {
    "id": "titulo-otros",
    "titulo": "Otros Servicios Especiales",
    "items": [
      {
        "id": "corte-de-unas",
        "icono": "fa-solid fa-scissors",
        "nombre": "Corte de Uñas",
        "descripcion": "Servicio rápido y seguro de cuidado básico para Perros y Gatos.",
        "duracion": "15 min",
        "duracionMin": 15,
        "precio": "$5.000",
        "categoriaSlug": "otros",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "limpieza-dental",
        "icono": "fa-solid fa-tooth",
        "nombre": "Limpieza Dental",
        "descripcion": "Destartraje y profilaxis para mantener la salud oral de Perros y Gatos. * Requiere anestesia.",
        "duracion": "45 min",
        "duracionMin": 45,
        "precio": "$55.000",
        "categoriaSlug": "otros",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "microchip-de-identificacion",
        "icono": "fa-solid fa-microchip",
        "nombre": "Microchip de Identificación",
        "descripcion": "Implantación de dispositivo subcutáneo para Perros y Gatos. * Incluye registro nacional.",
        "duracion": "10 min",
        "duracionMin": 10,
        "precio": "$15.000",
        "categoriaSlug": "otros",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": true,
        "motivoNoAgendable": ""
      },
      {
        "id": "hospitalizacion-por-dia",
        "icono": "fa-solid fa-bed-pulse",
        "nombre": "Hospitalización (por día)",
        "descripcion": "Cuidado intensivo para Perros y Gatos. * Incluye monitoreo y alimentación básica.",
        "duracion": "24 h",
        "duracionMin": 1440,
        "precio": "$30.000",
        "categoriaSlug": "otros",
        "especies": [
          "Perro",
          "Gato"
        ],
        "sexo": null,
        "pesoMin": null,
        "pesoMax": null,
        "soloNoEsterilizado": false,
        "agendable": false,
        "motivoNoAgendable": "Requiere evaluación previa de un médico: llama o acércate a la clínica."
      }
    ]
  }
];