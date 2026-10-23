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
| 🧑‍⚕️ | **Recepción** | Agenda de todas las citas con filtros, para confirmarlas o reagendarlas, y registro y edición de las fichas clínicas de los pacientes. |
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
| **Confirmada** / **Reagendada** | La clínica, desde *Recepción → Agenda de citas*. |
| **Cancelada** | El dueño, mientras la cita no haya llegado. |

### Cómo se guarda una cita

Las citas viven en `localStorage`, en la clave `citasVeterinariaSanMarcos`, como un arreglo de objetos con esta forma. Es el **contrato** que debe respetar cualquier módulo que las lea o las modifique (por ejemplo, el de recepción):

| Campo | Ejemplo | Quién lo define |
|---|---|---|
| `id` | `1760000000000` | Se genera al enviar la solicitud. |
| `codigo` | `"SM-000000"` | Se genera al enviar la solicitud. |
| `mascotaId`, `mascotaNombre`, `especie` | `1`, `"Max"`, `"Perro"` | Mascota elegida por el dueño. |
| `servicioId`, `servicioNombre` | `"consulta-general"`, `"Consulta General"` | Servicio elegido (ver `src/data/servicios.js`). |
| `duracion`, `duracionMin`, `precio` | `"30 min"`, `30`, `"$15.000"` | Copiados del servicio al momento de agendar. |
| `fecha` | `"2026-10-14"` | Formato `AAAA-MM-DD`. |
| `hora` | `"10:30"` | Formato `HH:MM`, dentro del horario de atención. |
| `observaciones` | `"Alergia al pollo"` | Antecedentes escritos por el dueño. |
| `tutor` | `{ run, nombre, apellidos, telefono, correo, medioRecordatorio }` | Datos de contacto del dueño. |
| `estado` | `"Pendiente"` | Nace como `Pendiente`; la clínica lo cambia. |
| `nota` | `"La clínica propuso este nuevo horario..."` | **Opcional.** Solo la agrega la clínica, y se muestra al dueño. |
| `creadaEn` | `"2026-10-11T15:00:00.000Z"` | Fecha y hora de creación (ISO). |

**Qué hace el módulo de recepción** (`/recepcion`):
- **Confirmar:** cambiar `estado` a `"Confirmada"`.
- **Proponer otro horario:** cambiar `fecha` y `hora` por el nuevo horario, poner `estado` en `"Reagendada"` y explicar el motivo en `nota`.
- No tocar el resto de los campos, y guardar el arreglo completo en la misma clave.
- El cupo de un horario se calcula a partir de las citas cuyo `estado` **no** es `"Cancelada"`, así que cancelar o reagendar libera el cupo automáticamente.

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
| `/recepcion` | Recepción: agenda de citas (confirmar y reagendar) |
| `/recepcion/fichas` | Recepción: fichas clínicas de los pacientes |
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
│   ├── components/           → Piezas compartidas (Navegacion, TarjetaServicio, FormularioContacto...)
│   │   ├── Tutor/            → Piezas de las vistas del tutor (PasoMascota, TarjetaCita, HistorialMascota...)
│   │   └── Recepcionista/    → Piezas de la vista de recepción (TablaCitas, ReagendarCita, FormularioRegistroClinico...)
│   ├── pages/                → Vistas públicas (Inicio, Servicios, Contacto, Blog...)
│   │   ├── Tutor/            → Vistas del tutor (MiPerfil, AgendarCita) y su hoja de estilos Tutor.css
│   │   └── Recepcionista/    → Vistas de recepción (AgendaCitas, FichasPacientes) y su hoja Recepcionista.css
│   ├── data/                 → Datos y configuración compartidos (servicios, blog, citas, clinica...)
│   │   └── Tutor/            → Datos propios del tutor (usuario, mascotas, regiones)
│   ├── utils/                → Lógica auxiliar (fechas, horarios y reglas de citas)
│   ├── test/                 → Configuración de las pruebas
│   ├── App.jsx               → Rutas de la aplicación
│   ├── App.css               → Estilos compartidos sobre Bootstrap
│   ├── index.css             → Variables de color y estilos base
│   └── main.jsx              → Punto de entrada
│
├── index.html
└── package.json
```

**Organización por roles:** lo que ven todos los usuarios o usan varios roles va en la raíz de cada carpeta; lo exclusivo de un rol va dentro de la carpeta de ese rol (`Tutor` y `Recepcionista`). Por ejemplo, `PasoFecha` y las insignias de estado las usan ambos roles, así que viven en la raíz y en `App.css`. Las pruebas viven junto al archivo que prueban (`*.spec.jsx`).

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
| `npm run test` | Ejecuta las pruebas en modo observador |
| `npm run test:run` | Ejecuta las pruebas una sola vez |
| `npm run coverage` | Ejecuta las pruebas y genera el informe de cobertura en `coverage/` |

---

## 💾 Datos y persistencia

Mientras no exista el backend, la aplicación usa datos de demostración y guarda los cambios del usuario en `localStorage`:

| Clave | Contenido |
|---|---|
| `ultimoContactoVeterinariaSanMarcos` | Último mensaje enviado desde Contacto |
| `usuarioVeterinariaSanMarcos` | Datos personales del perfil |
| `mascotasVeterinariaSanMarcos` | Mascotas registradas |
| `citasVeterinariaSanMarcos` | Citas solicitadas, con su estado |
| `fichasClinicasVeterinariaSanMarcos` | Fichas clínicas que registra recepción (solo se crea al registrar o editar algo) |

> ⚠️ Son datos de prueba. No se guardan contraseñas ni datos reales.

La ficha clínica (vacunas, desparasitaciones y consultas) la registra el personal de la clínica desde *Recepción*; el dueño solo la consulta desde *Mi perfil*. Para volver a los datos de demostración, borra estas claves desde las herramientas del navegador (*Application → Local Storage*).

Las fechas de las citas y de la ficha clínica de demostración se calculan **relativas a la fecha de hoy**, para que siempre se vean todos los estados (próxima, vencida, al día). Como las citas se guardan en `localStorage` la primera vez que se abre la aplicación, quien ya la haya usado verá las fechas de ese primer día: para refrescarlas, borra la clave `citasVeterinariaSanMarcos`.

---

## 🔮 Próximos pasos

- [x] Botón "Cómo llegar" en el mapa de contacto
- [x] Solicitud y seguimiento de citas desde el lado del dueño
- [x] Reemplazar los marcadores de imagen por las fotografías definitivas
- [ ] Autenticación real y rutas protegidas por rol
- [x] Módulo de recepción para confirmar o reagendar citas y registrar fichas clínicas
- [ ] Conexión con el backend de microservicios (Spring Boot + API REST) y disponibilidad real de horas

---

## 👩‍💻 Autoría

- **Desarrollo:** [Tu Nombre / domimoly](https://github.com/domimoly)
- **Asignatura:** Desarrollo FullStack II — DSY1104 (2026)
- **Recursos visuales:** imágenes utilizadas estrictamente con fines académicos.

## Testing Unitario

Andres
npm.cmd exec vitest run -- src/pages/tienda.spec.jsx src/pages/Nosotros.spec.jsx src/pages/Carrito.spec.jsx src/components/TarjetaProducto.spec.jsx src/components/ItemCarrito.spec.jsx

Domi
npm.cmd exec vitest run -- src/utils/citas.spec.jsx src/utils/horarios.spec.jsx src/components/Tutor/PasoConfirmacion.spec.jsx src/components/Tutor/TarjetaCita.spec.jsx src/components/Tutor/HistorialMascota.spec.jsx src/components/Recepcionista/TablaCitas.spec.jsx src/pages/Recepcionista/AgendaCitas.spec.jsx src/components/Recepcionista/ReagendarCita.spec.jsx src/components/Recepcionista/FormularioRegistroClinico.spec.jsx 
