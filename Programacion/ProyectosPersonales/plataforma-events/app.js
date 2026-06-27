import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.config.js';
import eventRoutes from './src/routes/event.routes.js';
import sessionRoutes from './src/routes/session.routes.js';

// Configuración de variables de entorno
dotenv.config();

const app = express();

// Conectamos a Mongo Atlas
connectDB();

// Middlewares básicos para recibir JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛣️ Vinculación de rutas por capas
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);

// Endpoint de salud (Requerido por la rúbrica)
app.get('/api/health', (req, res) => {
    res.json({ status: 'up', message: 'Servidor activo y operando correctamente 🚀' });
});

// Ruta de prueba inicial anterior
app.get('/ping', (req, res) => {
    res.json({ status: "success", message: "Plataforma de eventos online 🚀" });
});

export default app;