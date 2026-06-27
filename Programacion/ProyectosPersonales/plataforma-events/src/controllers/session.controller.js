// Controlador inicial para el manejo de sesiones (Login/Register futuro)
export const getSessionProfile = async (req, res) => {
    try {
        res.json({ status: 'success', message: 'Estructura de sesión inicial activa' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};