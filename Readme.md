# WEC Immersive Live 🎥

> Aplicación inmersiva de videoconferencias en tiempo real, construida con React y LiveKit.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![LiveKit](https://img.shields.io/badge/LiveKit-FF4F00?style=for-the-badge&logo=livekit&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

---

## 📸 Capturas de Pantalla

<div align="center">

| Interfaz |
|:---:|
| <img src="./assets/UI.png" alt="Login" width="220"/> |

---

## 📖 Descripción

**WEC Immersive Live** es una sala de videoconferencias en tiempo real estilo Zoom, diseñada con una interfaz oscura, moderna e inmersiva. Ofrece conexión WebRTC de baja latencia mediante LiveKit, soporte nativo para Picture-in-Picture (PiP), control completo de medios y una grilla dinámica de participantes que se adapta automáticamente al número de usuarios en sala.

---

## 🚀 Características Principales

- **Conexión WebRTC de baja latencia** — Impulsada por LiveKit Cloud para streaming en tiempo real.
- **Picture-in-Picture (PiP) Inteligente** — La cámara local aparece en la grilla principal cuando estás solo; al unirse más participantes, se convierte en un minimapa interactivo y flotante.
- **UI/UX Inmersivo** — Diseño personalizado con animaciones CSS, avatares de estado y controles optimizados para la sala.
- **Gestión completa de sala** — Controles para micrófono, cámara, compartir pantalla y salida de sala.
- **Degradación elegante** — Manejo de estados de carga, salas vacías y errores de autenticación sin interrupciones en la experiencia.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React + Vite, `@livekit/components-react`, `@livekit/components-styles` |
| **Backend (Auth)** | Node.js + Express (generación de access tokens) |
| **Infraestructura WebRTC** | LiveKit Cloud |
| **Despliegue recomendado** | Vercel (Frontend) · Render (Backend API) |

---

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- NPM o Yarn
- Una cuenta en [LiveKit Cloud](https://cloud.livekit.io/) con tu **API Key** y **API Secret**

---

## 💻 Instalación y Uso Local

El proyecto consta de dos partes que deben ejecutarse simultáneamente: el **servidor de tokens** (backend) y el **cliente React** (frontend).

### 1. Servidor de Tokens (Backend)

El cliente se comunica con `http://localhost:3000/api/token` para obtener credenciales de acceso a la sala.

```bash
# Clona el repositorio y navega al directorio del servidor
cd server

# Instala las dependencias
npm install
```

Crea un archivo `.env` en la raíz del servidor con tus credenciales de LiveKit:

```env
LIVEKIT_API_KEY=tu_api_key
LIVEKIT_API_SECRET=tu_api_secret
```

Inicia el servidor:

```bash
npm run dev
```

El servidor quedará escuchando en `http://localhost:3000`.

---

### 2. Cliente React (Frontend)

```bash
# Abre una nueva terminal y navega al directorio del cliente
cd client

# Instala las dependencias
npm install

# Inicia el servidor de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5173` (o el puerto que indique tu entorno).

---

## 🌐 Despliegue a Producción

Al llevar la aplicación a producción, actualiza las URLs en el frontend para que apunten a tus dominios reales en lugar de `localhost`.

### Frontend — Vercel

1. Conecta tu repositorio a [Vercel](https://vercel.com/).
2. Configura el comando de build: `npm run build`.
3. Establece el directorio de salida: `dist`.

### Backend — Render

1. Crea un nuevo **Web Service** en [Render](https://render.com/).
2. Conecta el repositorio y apunta al directorio del servidor.
3. Agrega las variables de entorno `LIVEKIT_API_KEY` y `LIVEKIT_API_SECRET` desde el panel de Render.

---

## 📁 Estructura del Proyecto

```
wec-immersive-live/
├── client/               # Aplicación React (Frontend)
│   ├── src/
│   │   ├── components/   # Componentes de UI (grilla, PiP, controles)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/               # API de tokens (Backend)
│   ├── index.js
│   ├── .env         
│   └── package.json
└── README.md
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para cambios importantes:

1. Abre primero un [issue](../../issues) describiendo el cambio propuesto.
2. Haz un fork del repositorio y crea tu rama: `git checkout -b feature/mi-mejora`.
3. Realiza tus cambios y haz commit: `git commit -m 'feat: agrega mi mejora'`.
4. Envía un Pull Request.

---

*Desarrollado por Yerson Rodriguez*