import { Router } from 'express';
import { EventModel } from '../models/event.model.js';

const router = Router();

// 1. Obtener todo el stock actual
router.get('/', async (req, res) => {
    try {
        const products = await EventModel.find();
        res.json({ status: 'success', payload: products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 2. Cargar un nuevo producto/corte al stock
router.post('/', async (req, res) => {
    try {
        const { name, category, weight, format, status } = req.body;
        
        // Validación básica obligatoria
        if (!name || !category || !weight) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios (name, category, weight)' });
        }

        const newProduct = await EventModel.create({
            name,
            category,
            weight,
            format,
            status
        });

        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


// 3. Modificar un producto (Ej: cambiar estado a 'sold' o 'frozen')
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Si el estado pasa a congelado, le clavamos la fecha automáticamente
        if (updateData.status === 'frozen') {
            updateData.frozenDate = new Date();
        }

        const updatedProduct = await EventModel.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 4. Eliminar un producto del stock
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await EventModel.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        res.json({ status: 'success', message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
export default router;