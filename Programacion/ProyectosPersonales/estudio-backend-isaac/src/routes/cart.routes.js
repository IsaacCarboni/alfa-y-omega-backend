import express from 'express';
const router = express.Router();

// Importamos el mánager y el modelo con la "s" nominal exacta de tu archivo
import CartManagerMongo from '../dao/CartManagerMongo.js';
import { cartsModel } from '../models/cartModel.js'; // 👈 REPARADO: Ahora tiene la "s"
const cartManager = new CartManagerMongo();

// ==========================================
// 🛒 1. POST /api/carts (Crear un carrito vacío - REQUERIDO)
// ==========================================
router.post('/', async (req, res) => {
    try {
        const nuevoCarro = await cartManager.createCart();
        return res.status(201).json({ status: "success", payload: nuevoCarro });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al crear el carrito" });
    }
});

// ==========================================
// 📊 2. GET /api/carts/:cid (Listar productos con POPULATE - REQUERIDO)
// ==========================================
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        // 👈 REPARADO: Llama a cartsModel con s
        const carrito = await cartsModel.findById(cid).populate('products.product').lean();
        
        if (!carrito) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }
        return res.json({ status: "success", payload: carrito });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al obtener el carrito" });
    }
});

// ==========================================
// ➕ 3. POST /api/carts/:cid/products/:pid (Agregar producto al carro - REQUERIDO)
// ==========================================
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const resultado = await cartManager.addProductToCart(cid, pid);
        return res.json({ status: "success", message: "Producto agregado/incrementado en el carrito" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al agregar producto al carrito" });
    }
});

// ==========================================
// 🗑️ 4. DELETE /api/carts/:cid/products/:pid (Eliminar UN producto del carrito - REQUERIDO)
// ==========================================
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        
        // 👈 REPARADO: Llama a cartsModel con s
        const carrito = await cartsModel.findById(cid);
        if (!carrito) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        carrito.products = carrito.products.filter(p => p.product.toString() !== pid);
        await carrito.save();

        return res.json({ status: "success", message: "Producto removido del carrito con éxito" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al eliminar producto del carrito" });
    }
});

// ==========================================
// ✏️ 5. PUT /api/carts/:cid (Actualizar TODOS los productos del carrito - REQUERIDO)
// ==========================================
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const nuevosProductos = req.body.products; 

        // 👈 REPARADO: Llama a cartsModel con s
        const carrito = await cartsModel.findByIdAndUpdate(cid, { products: nuevosProductos }, { new: true });
        if (!carrito) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        return res.json({ status: "success", payload: carrito });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al actualizar la lista del carrito" });
    }
});

// ==========================================
// 🔢 6. PUT /api/carts/:cid/products/:pid (Actualizar ÚNICAMENTE la cantidad - REQUERIDO)
// ==========================================
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body; 

        if (!quantity || quantity < 1) {
            return res.status(400).json({ status: "error", message: "La cantidad debe ser mayor a 0" });
        }

        // 👈 REPARADO: Llama a cartsModel con s
        const carrito = await cartsModel.findById(cid);
        if (!carrito) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        const productoEnCarro = carrito.products.find(p => p.product.toString() === pid);
        if (!productoEnCarro) {
            return res.status(404).json({ status: "error", message: "El producto no existe en este carrito" });
        }

        productoEnCarro.quantity = Number(quantity);
        await carrito.save();

        return res.json({ status: "success", message: "Cantidad actualizada correctamente" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al actualizar la cantidad" });
    }
});

// ==========================================
// 🧹 7. DELETE /api/carts/:cid (Vaciar el carrito completo - REQUERIDO)
// ==========================================
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        
        // 👈 REPARADO: Llama a cartsModel con s
        const carrito = await cartsModel.findByIdAndUpdate(cid, { products: [] }, { new: true });
        if (!carrito) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        return res.json({ status: "success", message: "Carrito vaciado por completo" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al vaciar el carrito" });
    }
});

export default router;
