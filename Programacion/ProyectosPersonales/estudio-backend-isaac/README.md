# 🥩 Proyecto Alfa y Omega - Sistema de Gestión de Stock en Tiempo Real

Sistema de backend profesional diseñado para el control de stock, persistencia de carritos y monitoreo de mercadería en carnicerías. Desarrollado con **Node.js**, **Express**, **MongoDB** y comunicación bidireccional mediante **Socket.io**.

---

## 🚀 Funcionalidades Clave

* **📺 Mostrador Virtual Dinámico:** Listado automatizado de cortes de carne con renders de imágenes reales, categorías y control de precios diferenciados (costo de abastecedor vs. precio de venta al público en Córdoba).
* **🔄 Comunicación Bidireccional (WebSockets):** Conexión en tiempo real mediante `Socket.io` para notificar actualizaciones del mostrador a todos los dispositivos conectados de manera inmediata.
* **📦 Persistencia Avanzada con MongoDB:** Migración completa de sistema de archivos JSON a una base de datos robusta utilizando `Mongoose`, garantizando la integridad de los datos de productos y carritos.
* **🛒 Carrito de Compras Completo (Populate):** Sistema de persistencia de carritos que utiliza la propiedad `.populate()` de Mongoose para enlazar dinámicamente los productos agregados y desglosar cantidades.
* **🌱 Semillero Automatizado (Seed):** El sistema verifica el estado de la base de datos al arrancar; si está vacía, se auto-recarga con los cortes esenciales (Matambre, Vacío, Costilla) asegurando rutas estáticas limpias para las imágenes.
* **📸 Gestión de Archivos Multimedia:** Integración de middleware `Multer` para la subida controlada de reportes fotográficos de la mercadería directo a la carpeta estática del servidor.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Node.js, Express.
* **Base de Datos & ORM:** MongoDB, Mongoose.
* **Frontend / Vistas:** Express-Handlebars (Motor de plantillas dinámico).
* **Comunicación en vivo:** Socket.io (WebSockets).
* **Middleware de Archivos:** Multer.

---

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura limpia y modular, estructurada de la siguiente manera:

```text
estudio-backend-isaac/
├── src/
│   ├── app.js               # Servidor principal, conexión a Mongo y testeo de flujos
│   ├── dao/                 # Data Access Object (Managers de persistencia en BD)
│   │   ├── CartManagerMongo.js
│   │   └── StockManagerMongo.js
│   ├── middlewares/         # Middlewares globales (Multer y validadores)
│   │   └── multer.js
│   ├── models/              # Esquemas de Mongoose (Estructura de colecciones)
│   │   ├── cartModel.js
│   │   └── productModel.js
│   ├── routes/              # Enrutadores modulares de la API y Vistas
│   │   ├── cart.routes.js
│   │   ├── stock.routes.js
│   │   └── views.routes.js
│   └── views/               # Plantillas Handlebars (.hbs) y layouts compartidos
└── public/                  # Archivos estáticos del cliente
    └── img/                 # Repositorio local de imágenes de los cortes
🔌 Endpoints Principales de la API
Productos (/api/products)
GET /api/products - Listado con paginación, ordenamiento y filtros por categoría.

GET /api/products/:pid - Obtener un corte específico por ID.

POST /api/products - Agregar un nuevo corte al mostrador.

PUT /api/products/:pid - Actualizar stock, precios o datos de un producto.

DELETE /api/products/:pid - Dar de baja un producto del sistema.

Carritos (/api/carts)
POST /api/carts - Crear un carrito nuevo vacío.

GET /api/carts/:cid - Obtener los productos de un carrito (Aplica .populate()).

POST /api/carts/:cid/products/:pid - Agregar/incrementar los kilos de un corte en el carrito.

📦 Instalación y Ejecución
Clonar el repositorio:

Bash
git clone [https://github.com/IsaacCarboni/estudio-backend-isaac.git](https://github.com/IsaacCarboni/estudio-backend-isaac.git)
cd estudio-backend-isaac
Instalar las dependencias de Node.js:

Bash
npm install
Iniciar el servidor en modo desarrollo (Nodemon):

Bash
npm run dev
Acceso al sistema:
El servidor iniciará en el puerto local habilitado. Podés ingresar desde tu navegador en:

👉 http://localhost:8080

📊 Flujo de Testeo Automatizado al Iniciar
Al ejecutar npm run dev, el archivo app.js realiza de manera segura y blindada las siguientes pruebas en consola para demostrar la funcionalidad requerida:

Conexión a la Base de Datos: Conecta con el cluster local de MongoDB (mongodb://127.0.0.1:27017/ecommerce).

Verificación de Semilla (Seed): Verifica la existencia de productos; de ser necesario, inyecta la semilla con los costos y precios reales.

Prueba de Populate: Genera un nuevo carrito de compras, le añade stock de prueba de forma persistente y lanza un console.log estructurado en formato JSON mostrando el éxito del método Populate.


