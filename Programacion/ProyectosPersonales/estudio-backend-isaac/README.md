🥩 Proyecto Alfa y Omega - Gestión de Stock en Tiempo Real
Sistema de gestión para carnicerías desarrollado con Node.js, Express y Socket.io. Esta aplicación permite controlar el stock de cortes de carne y visualizar el balance de capital en tiempo real.

🚀 Funcionalidades
Visualización Dinámica: Listado de cortes con imágenes, precios y categorías.

Venta en Tiempo Real: Las ventas descuentan stock instantáneamente en todos los dispositivos conectados sin necesidad de recargar la página.

Balance Automático: Cálculo automático del capital total en mercadería (ARS) actualizado mediante WebSockets.

Alertas de Stock: Indicadores visuales en color rojo y alertas de "Pedir más" cuando el stock es inferior a 5kg.

🛠️ Tecnologías Utilizadas
Backend: Node.js, Express.

Frontend: Handlebars (Motores de plantillas), CSS3.

Comunicación: Socket.io (WebSockets).

Persistencia: Sistema de archivos (JSON) gestionado mediante clases (StockManager).

Middleware: Multer (Manejo de imágenes).

📦 Instalación y Ejecución
Clonar el repositorio:

Bash
git clone https://github.com/IsaacCarboni/estudio-backend-isaac.git
Instalar dependencias:

Bash
npm install
Iniciar el servidor (Modo Desarrollo):

Bash
npm run dev
Acceso:
Abrir en el navegador: http://localhost:8080

📂 Estructura del Proyecto
/src/app.js: Servidor principal y configuración de WebSockets.

/src/StockManager.js: Lógica de persistencia de datos.

/src/routes/: Rutas de la API de stock.

/src/views/: Plantillas Handlebars para el frontend.

/public/: Archivos estáticos (imágenes y scripts del cliente).