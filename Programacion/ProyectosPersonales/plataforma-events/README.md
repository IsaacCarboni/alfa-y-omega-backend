# Alfa y Omega - Plataforma de Gestión de Stock y Eventos

## 📝 Temática Elegida
Este proyecto consiste en una API REST profesional desarrollada para **Alfa y Omega**, un sistema avanzado de gestión de stock, inventario y trazabilidad de productos cárnicos. La plataforma permite controlar el estado de la mercadería (fresca, envasada, congelada), el pesaje y los movimientos de stock en tiempo real mediante una arquitectura escalable y robusta basada en eventos.

---

## 🛠️ Tecnologías Utilizadas
* **Runtime:** Node.js (Módulos ESM - import/export)
* **Framework:** Express
* **Base de Datos:** MongoDB Atlas
* **ODM:** Mongoose
* **Variables de Entorno:** Dotenv
* **Monitoreo en Desarrollo:** Nodemon

---

## ⚙️ Configuración de Variables de Entorno
El proyecto utiliza un archivo `.env` para proteger las credenciales críticas. Se incluye un archivo `.env.example` en la raíz como plantilla. Deberás crear tu propio archivo `.env` con los siguientes campos:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_de_mongo_atlas_aca
JWT_SECRET=una_palabra_secreta_cualquiera
🚀 Instalación y Ejecución
Clonar el repositorio e ingresar a la carpeta del proyecto.

Instalar las dependencias ejecutando:

Bash
npm install
Iniciar el servidor en modo desarrollo (utiliza Nodemon apuntando de forma independiente a server.js):

Bash
npm run dev
📂 Estructura de Carpetas (Arquitectura por Capas)
El proyecto sigue un diseño arquitectónico riguroso separado por responsabilidades:

Plaintext
PLATAFORMA-EVENTS/
├── src/
│   ├── config/          # Configuración de conexiones (MongoDB Atlas)
│   ├── controllers/     # Lógica de control para cada recurso (Events, Sessions)
│   ├── dao/             # Capa de acceso a datos (Estructura inicial)
│   ├── middlewares/     # Middlewares globales y de validación
│   ├── models/          # Esquemas y modelos de Mongoose (User, Event)
│   ├── repositories/    # Patrón Repository para abstracción de datos
│   ├── routes/          # Enrutadores de Express divididos por recursos
│   ├── services/        # Capa de negocio (Lógica principal)
│   └── utils/           # Herramientas y utilidades generales
├── .env.example         # Plantilla de configuración
├── app.js               # Configuración centralizada de Express
└── server.js            # Punto de entrada inicial para levantar el servidor
🛣️ Rutas Disponibles (Endpoints)
🩺 Estado del Servidor
GET /api/health -> Devuelve un estado up si el servidor está activo y operando correctamente.

🥩 Gestión de Productos / Eventos (/api/events)
GET / -> Obtiene el listado completo de productos en stock.

POST / -> Registra un nuevo lote o producto en la base de datos.

PUT /:id -> Modifica un producto existente (actualiza automáticamente la fecha si pasa a congelado).

DELETE /:id -> Elimina un producto del stock por su ID.

🔐 Gestión de Sesiones (/api/sessions)
GET /current -> Estructura base inicial para la futura gestión de perfiles y autenticación de usuarios.