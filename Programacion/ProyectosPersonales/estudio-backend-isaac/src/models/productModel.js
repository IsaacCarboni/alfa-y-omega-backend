import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    corte: { 
        type: String, 
        required: [true, 'El nombre del corte es obligatorio'], 
        trim: true // Si pones " Vacío  ", lo guarda automáticamente como "Vacío"
    },
    stockKilos: { 
        type: Number, 
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser menor a cero'] // Evita stock negativo
    },
    precio: { // O "price", fijate cómo lo usaste en tu backend. Si en tu routes usás prod.price, dejalo como "price"
        type: Number, 
        required: [true, 'El precio es obligatorio'],
        min: [1, 'El precio debe ser mayor a cero']
    },
    categoria: { 
        type: String, 
        enum: {
            values: ['Mostrador', 'Cámara', 'Cerdo', 'Pollo'], // Solo acepta estos valores exactos
            message: '{VALUE} no es una categoría válida'
        },
        default: 'Mostrador'
    },
    imagen: {
        type: String,
        default: ''
    }
}, { timestamps: true }); // Te agrega automáticamente la fecha de creación y actualización (¡Súper pro!)

export const productModel = model('products', productSchema);