import express from 'express';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';

// --- IMPORTACIONES DE CAPAS ---
import stockRouter from './routes/stock.routes.js';
import StockManager from './StockManager.js';
import { productModel } from './models/productModel.js';
import { uploader } from './middlewares/multer.js';

const app = express();
const httpServer = createServer(app); 
const io = new Server(httpServer); 
// Esto le comparte el control de los Sockets a tus archivos de rutas
app.set('socketio', io);

const PORT = 8080;
const manager = new StockManager('./src/stock.json');

// --- 1. CONEXIÓN A BASE DE DATOS (Nube) ---
const MONGO_URI = 'mongodb://isaacefrain95_db_user:Carnicero2026@cluster0-shard-00-00.c70y6tn.mongodb.net:27017/alfa_y_omega?authSource=admin&ssl=true';

/* mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ ¡Conectado con éxito a MongoDB Atlas!");
        testProduct(); 
    })
    .catch(error => console.error("❌ Error de conexión:", error.message));
*/

const testProduct = async () => {
    try {
        await productModel.create({
            title: "Costillar de Ternera",
            description: "Corte premium para asado",
            price: 8500,
            stockKilos: 25,
            category: "Vacuno"
        });
        console.log("✅ ¡COSTILLAR GUARDADO EN LA NUBE!");
    } catch (error) {
        console.error("❌ Falló el test de guardado:", error.message);
    }
};

// --- 2. CONFIGURACIONES Y MIDDLEWARES ---
app.engine('hbs', engine({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    helpers: { lt: (a, b) => a < b } 
}));
app.set('view engine', 'hbs');
app.set('views', './src/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('./src/public')); 

// --- 3. SOCKETS (Tiempo Real) ---
io.on('connection', (socket) => {
    console.log('✅ Dispositivo conectado:', socket.id);
});

// --- 4. RUTAS DE VISTAS (Navegación) ---

app.get('/', async (req, res) => {
    try {
        // 1. Traemos los productos actualizados
        const productos = await manager.getStock();
        
        // 2. Usamos el método blindado de tu StockManager
        const infoBalance = await manager.getBalance();
        
        // 3. Extraemos el total de pesos con un salvavidas por las dudas
        const totalPesos = Number(infoBalance.valor_total_inventario) || 0;

        // 4. Le damos formato de moneda local de forma segura
        const valorTotalFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(totalPesos);

        // 5. Renderizamos la plantilla pasando las variables correctas
        res.render('index', { 
            productos: productos, 
            valorTotalMostrador: valorTotalFormateado 
        });

    } catch (error) {
        console.error("❌ Error al cargar la vista del mostrador:", error);
        res.status(500).send("Error interno en el servidor de la carnicería");
    }
});

// --- 5. RUTAS DE API (Lógica y Archivos) ---

app.post('/api/products', uploader.single('thumbnail'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ status: "error", error: "Falta la foto" });
    }
    const sectorReportado = req.body.title;
    console.log(`📸 Nuevo reporte de: ${sectorReportado} | Archivo: ${req.file.filename}`);
    
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px;">
            <h1 style="color: green;">✅ Reporte Recibido</h1>
            <p>Se registró el estado de: <b>${sectorReportado}</b></p>
            <a href="/test-upload">Hacer otro reporte</a>
        </div>
    `);
});

app.use('/api/stock', stockRouter);

// --- 6. ARRANQUE DEL MOTOR ---
httpServer.listen(8080, '0.0.0.0', () => {
    console.log('🚀 Servidor Alfa y Omega corriendo en red local');
});