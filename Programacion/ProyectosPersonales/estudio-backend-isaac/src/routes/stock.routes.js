import express from 'express';
const router = express.Router();

// Importamos tu StockManager limpio
import StockManager from '../StockManager.js';
const manager = new StockManager('./src/stock.json');

// ==========================================
// 🥩 1. RUTA PARA VENDER 1KG
// ==========================================
router.post('/vender', async (req, res) => {
    try {
        const { id } = req.body;
        const idNumero = Number(id);

        // Descontamos 1 kg usando tu método
        const resultado = await manager.sellProduct(idNumero, 1);

        if (!resultado.success) {
            return res.status(400).json({ status: "error", message: resultado.message });
        }

        const productoActualizado = resultado.product;

        // Pedimos el balance a tu clase blindada
        const infoBalance = await manager.getBalance();
        
        // RED DE SEGURIDAD FRENTE AL NAN:
        const totalPesos = Number(infoBalance.valor_total_inventario) || 0;
        console.log("💰 Dinero real emitido por Socket:", totalPesos);

        // Formateamos la moneda local
        const nuevoBalanceFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(totalPesos); 

        // Enviamos los datos exactos que tu script de hbs espera recibir
        const io = req.app.get('socketio');
        if (io) {
            io.emit('actualizar-lista', {
                id: String(id), 
                nuevoStock: productoActualizado.stockKilos,
                nuevoBalance: nuevoBalanceFormateado
            });
            console.log("📢 Evento enviado en tiempo real con éxito");
        }

        return res.status(200).json({ status: "success", nuevoStock: productoActualizado.stockKilos });

    } catch (error) {
        console.error("❌ Error crítico en ruta de ventas:", error);
        return res.status(500).json({ status: "error", message: "Error interno" });
    }
});

// ==========================================
// 🗑️ 2. RUTA PARA ELIMINAR UN CORTE COMPLETO
// ==========================================
router.delete('/eliminar/:id', async (req, res) => {
    try {
        const idNumero = Number(req.params.id);
        console.log(`🗑️ Backend recibió orden para eliminar ID: ${idNumero}`);

        const resultado = await manager.deleteProduct(idNumero);

        if (!resultado.success) {
            return res.status(400).json({ status: "error", message: resultado.message });
        }

        const infoBalance = await manager.getBalance();
        const totalPesos = Number(infoBalance.valor_total_inventario) || 0;

        const nuevoBalanceFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(totalPesos);

        const io = req.app.get('socketio');
        if (io) {
            io.emit('producto-eliminado', idNumero);
            io.emit('actualizar-lista', {
                nuevoBalance: nuevoBalanceFormateado
            });
            console.log("📢 Eliminación informada a todas las pantallas por Socket.io");
        }

        return res.status(200).json({ status: "success", message: "Corte borrado con éxito" });

    } catch (error) {
        console.error("❌ Error crítico en la ruta de eliminación:", error);
        return res.status(500).json({ status: "error", message: "Error interno al intentar eliminar" });
    }
});

// ==========================================
// ➕ 3. RUTA PARA CREAR/AGREGAR UN NUEVO CORTE
// ==========================================
router.post('/agregar', async (req, res) => {
    try {
        // 🛠️ EXPLICACIÓN: Atrapamos las variables que el usuario escribió en los inputs del formulario HTML
        const { title, price, stockKilos, category } = req.body;
        
        // 🛠️ EXPLICACIÓN: Le pasamos los datos limpios al mánager para que cree el objeto e incremente el ID solo en el JSON
        const resultado = await manager.addProduct({ title, price, stockKilos, category });

        if (!resultado.success) {
            return res.status(400).json({ status: "error", message: "No se pudo agregar" });
        }

        // 🛠️ EXPLICACIÓN: Usamos Socket para avisar a los navegadores abiertos. Al pasar un objeto vacío `{}`,
        // se activa el 'if (!data || !data.id)' que metimos en tu index.hbs y fuerza la recarga automática.
        const io = req.app.get('socketio');
        if (io) {
            io.emit('actualizar-lista', {}); 
            console.log("📢 Alerta de nuevo corte emitida por Socket");
        }

        // 🛠️ EXPLICACIÓN: Una vez guardado, en vez de devolver un JSON frío, redireccionamos al usuario a la raíz '/'
        // haciendo que la pantalla se actualice al instante con la nueva tarjeta de carne en la lista.
        return res.redirect('/');
    } catch (error) {
        console.error("❌ Error en ruta agregar:", error);
        return res.status(500).json({ status: "error", message: "Error interno" });
    }
});

export default router;