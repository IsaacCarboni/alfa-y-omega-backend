import express from 'express';
const router = express.Router();

// ✅ CORREGIDO: Ahora importamos en singular, tal como se exporta en el modelo
import { productModel } from '../models/productModel.js'; 
import CartManagerMongo from '../dao/CartManagerMongo.js';

const cartManager = new CartManagerMongo();

// ==========================================
// 🥩 1. VISTA DEL MOSTRADOR PRINCIPAL (Versión Blindada)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, sort } = req.query;

        // Filtro por categoría opcional
        const query = {};
        if (category) query.category = category;

        // Opciones de paginación
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        // ✅ CORREGIDO: productModel en singular
        const resultado = await productModel.paginate(query, options);

        // 2. Cálculo del balance con red de seguridad
        let valorTotalFormateado = "$ 0,00";
        try {
            // ✅ CORREGIDO: productModel en singular
            const listaParaBalance = await productModel.find().lean();
            const totalPesos = listaParaBalance.reduce((acc, prod) => {
                const precio = Number(prod.price) || 0;
                const stock = Number(prod.stock) || 0;
                return acc + (precio * stock);
            }, 0);

            valorTotalFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS'
            }).format(totalPesos);
        } catch (balanceError) {
            console.error("⚠️ Error al calcular el balance (mostrando $0.00):", balanceError);
        }

        // 3. Renderizamos mandando datos seguros
        res.render('index', { 
            productos: resultado?.docs || [], 
            infoPaginacion: {
                page: resultado?.page || 1,
                totalPages: resultado?.totalPages || 1,
                hasPrevPage: resultado?.hasPrevPage || false,
                hasNextPage: resultado?.hasNextPage || false,
                prevPage: resultado?.prevPage || null,
                nextPage: resultado?.nextPage || null
            },
            prevLink: resultado?.hasPrevPage ? `/?page=${resultado.prevPage}&limit=${limit}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}` : null,
            nextLink: resultado?.hasNextPage ? `/?page=${resultado.nextPage}&limit=${limit}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}` : null,
            valorTotalMostrador: valorTotalFormateado
        });

    } catch (error) {
        console.error("❌ ERROR REAL EN EL MOSTRADOR:", error);
        res.status(500).send(`Error en el servidor: ${error.message}`);
    }
});

// ==========================================
// 🛒 2. VISTA EXCLUSIVA DEL CARRITO
// ==========================================
router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const carrito = await cartManager.getCartById(cid);

        if (!carrito) {
            return res.status(404).send("El carrito solicitado no existe");
        }

        res.render('cart', {
            cartId: cid,
            productosEnCarrito: carrito.products || []
        });

    } catch (error) {
        console.error("❌ Error en vista del carrito:", error);
        res.status(500).send("Error al cargar la pantalla del carrito");
    }
});

export default router;