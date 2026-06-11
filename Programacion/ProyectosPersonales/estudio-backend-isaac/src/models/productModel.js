import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // 👈 IMPORTAMOS EL PLUGIN

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    retailPrice: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, default: "" }
});

// 👈 LE ENCHUFAMOS EL PLUGIN AL ESQUEMA
productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model('products', productSchema);