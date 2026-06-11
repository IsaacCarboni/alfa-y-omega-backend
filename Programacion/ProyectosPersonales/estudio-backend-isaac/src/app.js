import express from 'express';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import { engine } from 'express-handlebars';
import mongoose from 'mongoose'; 
import stockRouter from './routes/stock.routes.js';
import StockManagerMongo from './dao/StockManagerMongo.js';
import { uploader } from './middlewares/multer.js';
import cartRouter from './routes/cart.routes.js';
import viewsRouter from './routes/views.routes.js';

// 🥩 IMPORTAMOS LOS MODELOS Y MÁNAGERS
import { productModel } from './models/productModel.js';
import CartManagerMongo from './dao/CartManagerMongo.js';

const app = express();
const httpServer = createServer(app); 
const io = new Server(httpServer); 

app.set('socketio', io);

const PORT = 8080;
const manager = new StockManagerMongo();

// ==========================================
// 🎲 CONEXIÓN A MONGO LOCAL Y TESTEO BLINDADO
// ==========================================
const mongoURI = 'mongodb://127.0.0.1:27017/ecommerce';

mongoose.connect(mongoURI)
    .then(async () => {
        console.log('📦 Conexión exitosa a MONGODB LOCAL');

        const cartManager = new CartManagerMongo(); 

        // A. SEMILLA DE CORTES (Con costos de abastecedor, precios reales de Córdoba y FOTOS REALES)
        try {
            // Si hay menos de 3 cortes, reseteamos para volver a llenar el mostrador
            const cantidad = await productModel.countDocuments();
            if (cantidad < 3) {
                await productModel.deleteMany({}); // Limpiamos residuos
                await productModel.create([
                    { 
                        title: "Matambre", 
                        price: 11000,        
                        retailPrice: 25000,  
                        stock: 15, 
                        category: "Ternera",
                        thumbnail: "img/1778472179074-Matambre-Corte-800x840.png" 
                    },
                    { 
                        title: "Vacío", 
                        price: 11000,        
                        retailPrice: 25000,  
                        stock: 40, 
                        category: "Ternera",
                        thumbnail: "img/6-2-1024x771.jpg" 
                    },
                    { 
                        title: "Costilla", 
                        price: 11000,        
                        retailPrice: 23000,  
                        stock: 50, 
                        category: "Ternera",
                        thumbnail: "img/OIP.jpg" 
                    }
                ]);
                console.log("🥩 ¡Gancheras recargadas automáticamente con de fotos reales y precios de mostrador!");
            }
        } catch (errCortes) {
            console.error("⚠️ Error al cargar cortes iniciales:", errCortes.message);
        }

        // B. TESTEO SEGURO DEL CARRITO
        try {
            console.log("🛒 Iniciando prueba de persistencia de carritos...");
            const nuevoCarro = await cartManager.createCart();
            
            if (nuevoCarro && nuevoCarro.cart) {
                const cartId = nuevoCarro.cart._id.toString();
                console.log(`✨ Carrito creado con ID: ${cartId}`);

                const unCorte = await productModel.findOne({ title: "Vacío" });
                if (unCorte) {
                    const productId = unCorte._id.toString();
                    
                    // Metemos kilos de prueba
                    await cartManager.addProductToCart(cartId, productId);
                    await cartManager.addProductToCart(cartId, productId);
                    console.log(`|-> Se sumaron 2 kg de ${unCorte.title} al carro.`);

                    // Traemos con Populate
                    const carroCompleto = await cartManager.getCartById(cartId);
                    console.log("📊 CONTENIDO DEL CARRITO CON POPULATE:");
                    console.log(JSON.stringify(carroCompleto, null, 2));
                }
            }
        } catch (errCarrito) {
            console.error("⚠️ Nota de testeo:", errCarrito.message);
        }

    })
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// ==========================================
// 📺 CONFIGURACIÓN DE ENGINE (HANDLEBARS)
// ==========================================
app.engine('hbs', engine({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    helpers: { lt: (a, b) => a < b } 
}));
app.set('view engine', 'hbs');
app.set('views', './src/views');

// ==========================================
// ⚙️ MIDDLEWARES GENERALES
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('./src/public')); 

// ==========================================
// 📢 CONTROL DE CONEXIÓN WEBSOCKETS
// ==========================================
io.on('connection', (socket) => {
    console.log('✅ Dispositivo conectado al mostrador:', socket.id);
});

// ==========================================
// 📸 CONTROL DE ARCHIVOS (MULTER)
// ==========================================
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

// ==========================================
// 🛣️ ENRUTADORES GENERALES Y API
// ==========================================
app.use('/', viewsRouter);         
app.use('/api/stock', stockRouter);
app.use('/api/carts', cartRouter);

// ==========================================
// 🚀 INICIO DEL SERVIDOR
// ==========================================
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Alfa y Omega corriendo en puerto ${PORT} (Red Local habilitada)`);
});