import { cartsModel } from '../models/cartModel.js';

class CartManagerMongo {
    
    // 1. CREAR CARRITO VACÍO
    async createCart() {
        try {
            const nuevoCarrito = await cartsModel.create({ products: [] });
            return { success: true, cart: nuevoCarrito };
        } catch (error) {
            console.error("❌ Error al crear carrito en Mongo:", error);
            return { success: false, message: error.message };
        }
    }

    // 2. LISTAR PRODUCTOS CON POPULATE
    async getCartById(id) {
        try {
            return await cartsModel.findById(id).populate('products.product').lean();
        } catch (error) {
            console.error(`❌ Error al traer carrito ${id}:`, error);
            return null;
        }
    }

    // 3. AGREGAR O INCREMENTAR UN PRODUCTO EN EL CARRITO
    async addProductToCart(cartId, productId) {
        try {
            // Buscamos el carrito en la base de datos
            const cart = await cartsModel.findById(cartId);
            if (!cart) return { success: false, message: "Carrito no encontrado" };

            // Nos fijamos si el corte ya está en el carrito
            const itemIndex = cart.products.findIndex(
                (p) => p.product.toString() === productId
            );

            if (itemIndex !== -1) {
                // Si el corte ya estaba, le sumamos 1 kg al pedido
                cart.products[itemIndex].quantity += 1;
            } else {
                // Si es un corte nuevo en el carrito, lo empujamos al array
                cart.products.push({ product: productId, quantity: 1 });
            }

            // Guardamos los cambios en Mongo
            await cart.save();
            return { success: true, message: "Producto agregado al carrito con éxito", cart };

        } catch (error) {
            console.error("❌ Error al agregar producto al carrito en Mongo:", error);
            return { success: false, message: error.message };
        }
    }

    // 4. ELIMINAR UN PRODUCTO DEL CARRITO
    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await cartsModel.findById(cartId);
            if (!cart) return { success: false, message: "Carrito no encontrado" };

            cart.products = cart.products.filter(p => p.product.toString() !== productId);

            await cart.save();
            return { success: true, cart };
        } catch (error) {
            console.error("❌ Error al quitar producto del carrito:", error);
            return { success: false, message: error.message };
        }
    }

    // 5. VACIAR EL CARRITO COMPLETO
    async clearCart(cartId) {
        try {
            const cart = await cartsModel.findById(cartId);
            if (!cart) return { success: false, message: "Carrito no encontrado" };

            cart.products = [];
            await cart.save();
            return { success: true, cart };
        } catch (error) {
            console.error("❌ Error al vaciar carrito:", error);
            return { success: false, message: error.message };
        }
    }

    // 🚀 6. ACTUALIZAR TODO EL CARRITO CON UN ARREGLO DE PRODUCTOS (Requerido por Coder)
    async updateCartProducts(cartId, productsArray) {
        try {
            const cart = await cartsModel.findById(cartId);
            if (!cart) return { success: false, message: "Carrito no encontrado" };

            // Reemplazamos el arreglo viejo por el nuevo que viene de req.body
            cart.products = productsArray;

            await cart.save();
            return { success: true, cart };
        } catch (error) {
            console.error("❌ Error al actualizar arreglo de productos:", error);
            return { success: false, message: error.message };
        }
    }

    // 🚀 7. ACTUALIZAR SOLO LA CANTIDAD DE UN PRODUCTO ESPECÍFICO (Requerido por Coder)
    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await cartsModel.findById(cartId);
            if (!cart) return { success: false, message: "Carrito no encontrado" };

            const existeProducto = cart.products.find(p => p.product.toString() === productId);

            if (!existeProducto) {
                return { success: false, message: "El producto no está en el carrito" };
            }

            // Forzamos a que sea un número válido
            existeProducto.quantity = Number(quantity);

            await cart.save();
            return { success: true, cart };
        } catch (error) {
            console.error("❌ Error al actualizar cantidad del producto:", error);
            return { success: false, message: error.message };
        }
    }
}

export default CartManagerMongo;