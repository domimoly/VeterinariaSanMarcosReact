<div align="center">

# 🐾 Veterinaria San Marcos

### Aplicación web (SPA) para la gestión digital de una clínica veterinaria

![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-yellow?style=for-the-badge)

</div>

---

## 📋 Sobre el proyecto

**Veterinaria San Marcos** es un proyecto académico de la asignatura **Desarrollo FullStack II (DSY1104)**. Simula la plataforma web de una clínica veterinaria de Rancagua que hoy gestiona sus citas y fichas clínicas en papel.

Este repositorio es la **migración a React** del sitio estático original (HTML, CSS y JavaScript). El sitio se reorganizó en componentes reutilizables, y el diseño responsivo pasó a apoyarse en Bootstrap, conservando la paleta de colores original.

> 🎓 Este repositorio corresponde al frontend. El backend (microservicios Spring Boot y base de datos) se integrará más adelante.

---

## 📑 Tabla de contenidos

- [Funcionalidades](#-funcionalidades)
- [Agendamiento de citas](#-agendamiento-de-citas)
- [Rutas](#️-rutas)
- [Tecnologías](#️-tecnologías)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación y uso](#-instalación-y-uso)
- [Datos y persistencia](#-datos-y-persistencia)
- [Próximos pasos](#-próximos-pasos)
- [Autoría](#-autoría)

---

## ✨ Funcionalidades

| | Sección | Qué incluye |
|---|---|---|
| 🏠 | **Inicio** | Portada, servicios destacados, reseñas de clientes, agenda online y video informativo. |
| 🏥 | **Servicios** | Catálogo de 28 servicios en 6 categorías, con detalle por categoría y botón para agendar cada servicio. |
| 📅 | **Agendar cita** | Solicitud de hora en 4 pasos con validaciones según el caso (ver más abajo). |
| ✉️ | **Contacto** | Formulario con validaciones, último mensaje guardado, mapa y botón "Cómo llegar". |
| 📰 | **Blog** | Listado de artículos y detalle de cada uno. |
| 👤 | **Mi perfil** | Datos personales, mascotas, **mis citas** y ficha clínica con vacunas y avisos de vencimiento. |
| 🧭 | **Página 404** | Mensaje claro para direcciones que no existen. |

---

## 📅 Agendamiento de citas

El dueño de la mascota solicita una hora siguiendo cuatro pasos, con un resumen que se va completando a un costado:

| Paso | Qué se elige | Validaciones principales |
|---|---|---|
| **1. Mascota** | Una de sus mascotas y un servicio. | Solo se ofrecen los servicios que corresponden a la mascota. |
| **2. Fecha** | Semana, día y hora. | Horario de atención, duración del servicio, fechas válidas. |
| **3. Tutor** | Teléfono, correo y medio de recordatorio. | Teléfono y correo obligatorios y con formato válido. |
| **4. Confirmar** | Revisión final. | Confirmación explícita y revalidación de la hora. |

Al enviar, la solicitud queda en estado **Pendiente**. La clínica debe **confirmarla o proponer otro horario**, y el dueño puede revisar el estado y cancelarla desde *Mi perfil → Mis citas*.

### Reglas del caso que se aplican

| Regla | Detalle |
|---|---|
| **Servicio según la mascota** | Se filtra por especie, sexo y peso. Por ejemplo, la vacuna Triple Felina solo aparece para gatos y la desparasitación se ofrece según el peso del perro. |
| **Esterilización** | No se ofrece a una mascota que ya está esterilizada. |
| **Urgencias** | Las urgencias, la cesárea de urgencia y la hospitalización no se agendan en línea: se indica llamar a la clínica. |
| **Horario de atención** | Lunes a viernes 09:00–13:00 y 14:00–18:00, sábado 10:00–13:00, domingo cerrado. |
| **Duración del servicio** | Las horas se ofrecen cada 30 minutos. Un servicio largo reserva varios bloques seguidos y debe terminar antes del cierre de su tramo. |
| **Cupos** | 3 por bloque (uno por médico veterinario). |
| **Anticipación** | Mínimo 2 horas y máximo 4 semanas. |
| **Una cita por mascota al día** | Evita solicitudes duplicadas. Una cita cancelada libera el cupo. |

### Estados de una cita

| Estado | Quién lo define |
|---|---|
| **Pendiente** | Se asigna al enviar la solicitud. |
| **Confirmada** / **Reagendada** | La clínica (módulo de recepción, aún no implementado). |
| **Cancelada** | El dueño, mientras la cita no haya llegado. |

> ⚠️ **Supuestos de esta versión.** Sin backend, la ocupación de cada hora es simulada (una parte fija según el día y la hora, y otra que viene de las citas guardadas), y el horario, los cupos y la anticipación son valores de referencia. Todos se ajustan en un solo lugar: `src/data/clinica.js`.

---

## 🗺️ Rutas

| Ruta | Vista |
|---|---|
| `/` | Inicio |
| `/servicios` | Catálogo de servicios |
| `/servicios/:categoria` | Detalle de una categoría (ej. `/servicios/cirugias`) |
| `/agendar-cita` | Solicitud de cita |
| `/agendar-cita?servicio=<id>` | Solicitud con el servicio ya elegido (ej. `?servicio=consulta-general`) |
| `/contacto` | Formulario de contacto y mapa |
| `/blog` | Listado de artículos |
| `/blog/:slug` | Detalle de un artículo (ej. `/blog/01`) |
| `/mi-perfil` | Perfil, mascotas, citas y ficha clínica |
| `/mi-perfil#mis-citas` | Perfil, directo a la sección de citas |
| `*` | Página no encontrada |

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| **React 19** | Interfaz basada en componentes y estado |
| **Vite** | Servidor de desarrollo y compilación |
| **React Router** | Navegación entre vistas sin recargar la página |
| **React Bootstrap / Bootstrap 5** | Diseño responsivo (grilla, navbar, formularios, tablas) |
| **Font Awesome** | Íconos vectoriales (cargado por CDN) |
| **ESLint** | Revisión de calidad del código |

---

## 📁 Estructura del proyecto

```
VeterinariaSanMarcosReact/
│
├── public/
│   └── img/                  → Imágenes del sitio
│
├── src/
│   ├── components/           → Piezas reutilizables (Navegacion, TarjetaServicio, PasoFecha, TarjetaCita...)
│   ├── pages/                → Vistas completas (Inicio, Servicios, AgendarCita, Contacto, Blog, MiPerfil...)
│   ├── data/                 → Datos simulados y configuración de la clínica
│   ├── utils/                → Lógica auxiliar (fechas, horarios y reglas de citas)
│   ├── App.jsx               → Rutas de la aplicación
│   ├── App.css               → Estilos propios sobre Bootstrap
│   ├── index.css             → Variables de color y estilos base
│   └── main.jsx              → Punto de entrada
│
├── index.html
└── package.json
```

**Criterio de organización:** una *página* decide qué mostrar y de dónde saca los datos; un *componente* es una pieza visual que recibe esos datos por props. Los estilos viven en las hojas CSS y los componentes solo usan `className`. La lógica de negocio (disponibilidad de horas, qué servicio corresponde a qué mascota) está en `utils/`, separada de las pantallas.

---

## 🚀 Instalación y uso

**Requisitos:** [Node.js](https://nodejs.org) 20 o superior y Git.

```bash
# 1. Clonar el repositorio
git clone https://github.com/domimoly/VeterinariaSanMarcosReact.git

# 2. Entrar a la carpeta
cd VeterinariaSanMarcosReact

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abre la dirección que muestra la terminal (normalmente `http://localhost:5173`).

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la versión compilada para revisarla |
| `npm run lint` | Revisa el código con ESLint |

---

## 💾 Datos y persistencia

Mientras no exista el backend, la aplicación usa datos de demostración y guarda los cambios del usuario en `localStorage`:

| Clave | Contenido |
|---|---|
| `ultimoContactoVeterinariaSanMarcos` | Último mensaje enviado desde Contacto |
| `usuarioVeterinariaSanMarcos` | Datos personales del perfil |
| `mascotasVeterinariaSanMarcos` | Mascotas registradas |
| `citasVeterinariaSanMarcos` | Citas solicitadas, con su estado |

> ⚠️ Son datos de prueba. No se guardan contraseñas ni datos reales.

La ficha clínica (vacunas, desparasitaciones y consultas) es de solo lectura, porque la registra el personal de la clínica. Para volver a los datos de demostración, borra estas claves desde las herramientas del navegador (*Application → Local Storage*).

---

## 🔮 Próximos pasos

- [x] Botón "Cómo llegar" en el mapa de contacto
- [x] Solicitud y seguimiento de citas desde el lado del dueño
- [ ] Reemplazar los marcadores de imagen por las fotografías definitivas
- [ ] Autenticación real y rutas protegidas por rol
- [ ] Módulo de recepción para confirmar o reagendar citas
- [ ] Conexión con el backend de microservicios (Spring Boot + API REST) y disponibilidad real de horas

---

## 👩‍💻 Autoría

- **Desarrollo:** [Tu Nombre / domimoly](https://github.com/domimoly)
- **Asignatura:** Desarrollo FullStack II — DSY1104 (2026)
- **Recursos visuales:** imágenes utilizadas estrictamente con fines académicos.