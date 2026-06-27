import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🍃 Conexión exitosa a MongoDB Atlas');
    } catch (error) {
        console.error('❌ Error crítico en la base de datos:', error.message);
        // No frenamos el servidor con process.exit(1) por ahora para que no se te apague Nodemon al dar el error de URI falsa
    }
};