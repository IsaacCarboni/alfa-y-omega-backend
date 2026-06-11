export const validarProducto = (req, res, next) => {
    const { corte, stockKilos, precio } = req.body;

    if (!corte || typeof stockKilos !== 'number' || stockKilos < 0) {
        return res.status(400).json({ 
            error: "Datos inválidos", 
            detalle: "El nombre del corte es obligatorio y el stock debe ser un número positivo." 
        });
    }

    console.log(`✅ Producto validado: ${corte}`);
    next();
};