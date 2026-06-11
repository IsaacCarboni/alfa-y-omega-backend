import { productModel } from '../models/productModel.js';

class StockManagerMongo {

   async getProductsPaginados(filter, options) {
    try {
        // Invocamos directamente al plugin que le acoplamos al productModel
        return await productModel.paginate(filter, options);
    } catch (error) {
        console.error("❌ Error en mánager al paginar productos:", error);
        return null;
    }
}

    // ➕ AGREGAR UN NUEVO CORTE
    async addProduct(productData) {
        try {
            const nuevoProducto = await productModel.create(productData);
            return { success: true, product: nuevoProducto };
        } catch (error) {
            console.error("❌ Error al guardar el corte en Mongo:", error);
            return { success: false, message: error.message };
        }
    }

    // 🗑️ ELIMINAR UN CORTE COMPLETO
    async deleteProduct(id) {
        try {
            const eliminado = await productModel.findByIdAndDelete(id);
            if (!eliminado) return { success: false, message: "Producto no encontrado" };
            return { success: true };
        } catch (error) {
            console.error("❌ Error al eliminar el corte de Mongo:", error);
            return { success: false, message: error.message };
        }
    }

    // 🥩 VENDER KILOS (Descontar del stock)
    async sellProduct(id, cantidadAVisar = 1) {
        try {
            const producto = await productModel.findById(id);
            if (!producto) return { success: false, message: "Corte no encontrado" };

            if (producto.stock < cantidadAVisar) {
                return { success: false, message: "No queda suficiente stock en la cámara" };
            }

            // Descontamos los kilos del stock
            producto.stock -= cantidadAVisar;
            await producto.save();

            return { success: true, product: producto };
        } catch (error) {
            console.error("❌ Error al procesar la venta en Mongo:", error);
            return { success: false, message: error.message };
        }
    }

    // 💰 CALCULAR EL BALANCE TOTAL DE LA CÁMARA
    async getBalance() {
        try {
            // Usamos una agregación de Mongo para calcular el valor total de forma automática
            const resultado = await productModel.aggregate([
                {
                    $group: {
                        _id: null,
                        valor_total_inventario: { $sum: { $multiply: ["$price", "$stock"] } }
                    }
                }
            ]);

            // Si hay productos devuelve el total, sino devuelve 0
            return resultado.length > 0 ? resultado[0] : { valor_total_inventario: 0 };
        } catch (error) {
            console.error("❌ Error al calcular balance en Mongo:", error);
            return { valor_total_inventario: 0 };
        }
    }
}

export default StockManagerMongo;