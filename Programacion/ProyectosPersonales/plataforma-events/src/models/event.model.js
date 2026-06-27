import { Schema, model } from 'mongoose';

// El molde híbrido que define qué datos lleva cada producto (en mostrador o envasado)
const productSchema = new Schema({
    name: { 
        type: String, 
        required: true // Ej: "Vacío", "Molida Especial", "Nalga"
    },
    category: { 
        type: String, 
        required: true // Ej: "Falda", "Molida", "Asado"
    },
    weight: { 
        type: Number, 
        required: true // El peso exacto en kilos (de la bandeja o del pesaje en batea)
    },
    format: {
        type: String,
        enum: ['mostrador', 'envasado'], // <--- ¡Evita confusiones! 'mostrador' es tradicional, 'envasado' es al vacío
        default: 'mostrador' // Por defecto, si no aclaramos nada, nace como venta tradicional de mostrador
    },
    packingDate: { 
        type: Date, 
        default: Date.now // Fecha en que ingresó o se empaquetó
    },
    status: { 
        type: String, 
        enum: ['fresh', 'frozen', 'sold'], 
        default: 'fresh' // Controla si está fresco en heladera/batea, congelado o vendido
    },
    frozenDate: {
        type: Date // Solo se carga si pasa de fresco a congelado
    }
}, { 
    timestamps: true // Registra milimétricamente cuándo se creó y modificó el dato
});

// Exportamos el modelo manteniendo el nombre temporal para que no rompa tus controladores
export const EventModel = model('products', productSchema);