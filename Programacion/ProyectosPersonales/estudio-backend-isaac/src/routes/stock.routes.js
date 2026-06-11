import express from 'express';
const router = express.Router();

// ✅ SUMAMOS EL MÁNAGER DE MONGO
import StockManagerMongo from '../dao/StockManagerMongo.js';
import { productModel } from '../models/productModel.js';
const manager = new StockManagerMongo();

// ==========================================
// 📦 1. GET /api/products (Paginados, ordenados y filtrados)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort; 
        const query = req.query.query; 

        const options = {
            limit,
            page,
            lean: true 
        };

        if (sort === 'asc') options.sort = { price: 1 };
        if (sort === 'desc') options.sort = { price: -1 };

        const filter = {};
        if (query) {
            filter.category = query;
        }

        const result = await manager.getProductsPaginados(filter, options);

        if (!result) {
            return res.status(500).json({ status: "error", message: "No se pudieron obtener los productos" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        const prevLink = result.hasPrevPage ? `${baseUrl}?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null;
        const nextLink = result.hasNextPage ? `${baseUrl}?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null;

        return res.json({
            status: "success",
            payload: result.docs, 
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink,
            nextLink
        });

    } catch (error) {
        console.error("❌ Error en GET de productos paginados:", error);
        return res.status(500).json({ status: "error", message: "Error interno al paginar productos" });
    }
});

// ==========================================
// 🎯 2. GET /api/products/:pid (Obtener producto por ID - REQUERIDO)
// ==========================================
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const producto = await productModel.findById(pid).lean();
        if (!producto) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }
        return res.json({ status: "success", payload: producto });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al buscar el producto" });
    }
});

// ==========================================
// 🚀 3. POST /api/products (Crear producto normal - REQUERIDO)
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        
        // Validamos campos mínimos obligatorios
        if (!title || !price || !stock || !category) {
            return res.status(400).json({ status: "error", message: "Faltan campos obligatorios" });
        }

        const resultado = await manager.addProduct({ 
            title, 
            price: Number(price), 
            stock: Number(stock), 
            category,
            retailPrice: Number(price) * 2 // O la lógica de batea que manejes
        });

        const io = req.app.get('socketio');
        if (io) io.emit('actualizar-lista', {}); 

        return res.status(201).json({ status: "success", message: "Producto creado con éxito" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error interno al crear producto" });
    }
});

// ==========================================
// ✏️ 4. PUT /api/products/:pid (Actualizar producto existente - REQUERIDO)
// ==========================================
router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const datosActualizar = req.body;

        // Evitamos que se pueda alterar el ID de Mongo por seguridad
        if (datosActualizar._id) delete datosActualizar._id;

        const productoActualizado = await productModel.findByIdAndUpdate(pid, datosActualizar, { new: true });
        
        if (!productoActualizado) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado para actualizar" });
        }

        const io = req.app.get('socketio');
        if (io) io.emit('actualizar-lista', {});

        return res.json({ status: "success", payload: productoActualizado });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al actualizar producto" });
    }
});

// ==========================================
// 🗑️ 5. DELETE /api/products/:pid (Eliminar por parámetro limpio - REQUERIDO)
// ==========================================
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params; 
        const resultado = await manager.deleteProduct(pid);

        if (!resultado.success) {
            return res.status(404).json({ status: "error", message: resultado.message });
        }

        const io = req.app.get('socketio');
        if (io) {
            io.emit('producto-eliminado', pid); 
            io.emit('actualizar-lista', {}); 
        }

        return res.json({ status: "success", message: "Producto eliminado correctamente" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al eliminar" });
    }
});

// ==========================================
// 🥩 VISTAS ADICIONALES / OPERACIONES EN TIEMPO REAL 
// ==========================================
router.post('/vender', async (req, res) => {
    try {
        const { id } = req.body;
        const resultado = await manager.sellProduct(id, 1);

        if (!resultado.success) {
            return res.status(400).json({ status: "error", message: resultado.message });
        }

        const productoActualizado = resultado.product;
        const infoBalance = await manager.getBalance();
        const totalPesos = Number(infoBalance?.valor_total_inventario) || 0;

        const nuevoBalanceFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(totalPesos); 

        const io = req.app.get('socketio');
        if (io) {
            io.emit('actualizar-lista', {
                id: id, 
                nuevoStock: productoActualizado.stock, 
                nuevoBalance: nuevoBalanceFormateado
            });
        }

        return res.status(200).json({ status: "success", nuevoStock: productoActualizado.stock });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error interno" });
    }
});

router.post('/agregar', async (req, res) => {
    try {
        const { title, price, stock, category } = req.body;
        const resultado = await manager.addProduct({ 
            title, 
            price: Number(price), 
            stock: Number(stock), 
            category 
        });

        if (!resultado.success) {
            return res.status(400).json({ status: "error", message: "No se pudo agregar" });
        }

        const io = req.app.get('socketio');
        if (io) io.emit('actualizar-lista', {}); 

        return res.redirect('/');
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error interno" });
    }
});

export default router;