<div align="center">

# 🐾 Veterinaria San Marcos 🐾

### Aplicación web (SPA) para la gestión digital de una clínica veterinaria

!React
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
| 🏥 | **Servicios** | Catálogo de 28 servicios en 6 categorías, con una vista de detalle por categoría. |
| ✉️ | **Contacto** | Formulario con validaciones, último mensaje guardado y mapa de ubicación. |
| 📰 | **Blog** | Listado de artículos y detalle de cada uno. |
| 👤 | **Mi perfil** | Datos personales editables, registro de mascotas y ficha clínica con vacunas y avisos de vencimiento. |
| 🧭 | **Página 404** | Mensaje claro para direcciones que no existen. |

---

## 🗺️ Rutas

| Ruta | Vista |
|---|---|
| `/` | Inicio |
| `/servicios` | Catálogo de servicios |
| `/servicios/:categoria` | Detalle de una categoría (ej. `/servicios/cirugias`) |
| `/contacto` | Formulario de contacto y mapa |
| `/blog` | Listado de artículos |
| `/blog/:slug` | Detalle de un artículo (ej. `/blog/01`) |
| `/mi-perfil` | Perfil, mascotas y ficha clínica |
| `*` | Página no encontrada |

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| **React 20.20.2** | Interfaz basada en componentes y estado |
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
│   ├── components/           → Piezas reutilizables (Navegacion, TarjetaServicio, FormularioContacto...)
│   ├── pages/                → Vistas completas (Inicio, Servicios, Contacto, Blog, MiPerfil...)
│   ├── data/                 → Datos simulados separados de la presentación
│   ├── utils/                → Funciones auxiliares (fechas y estado de vacunas)
│   ├── App.jsx               → Rutas de la aplicación
│   ├── App.css               → Estilos propios sobre Bootstrap
│   ├── index.css             → Variables de color y estilos base
│   └── main.jsx              → Punto de entrada
│
├── index.html
└── package.json
```

**Criterio de organización:** una *página* decide qué mostrar y de dónde saca los datos; un *componente* es una pieza visual que recibe esos datos por props. Los estilos viven en las hojas CSS y los componentes solo usan `className`.

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

> ⚠️ Son datos de prueba. No se guardan contraseñas ni datos reales.

La ficha clínica (vacunas, desparasitaciones y consultas) es de solo lectura, porque la registra el personal de la clínica.

---

## 🔮 Próximos pasos

- [ ] Autenticación real y rutas protegidas por rol
- [ ] Módulo de solicitud y seguimiento de citas
- [ ] Conexión con el backend de microservicios (Spring Boot + API REST)

---

## 👩‍💻 Autoría

- **Desarrollo:** [Tu Nombre / domimoly](https://github.com/domimoly)
- **Asignatura:** Desarrollo FullStack II — DSY1104 (2026)
- **Recursos visuales:** imágenes utilizadas estrictamente con fines académicos.
