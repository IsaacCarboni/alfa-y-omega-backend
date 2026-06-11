import mongoose from 'mongoose';

const cartsCollection = 'carts';

const cartsSchema = new mongoose.Schema({
    // El carrito tiene un array de productos
    products: [
        {
            // Referenciamos al ID del modelo de productos
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products', // 👈 Clave para que funcione el populate
                required: true
            },
            // Cantidad de kilos o unidades de ese corte
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
});

export const cartsModel = mongoose.model(cartsCollection, cartsSchema);