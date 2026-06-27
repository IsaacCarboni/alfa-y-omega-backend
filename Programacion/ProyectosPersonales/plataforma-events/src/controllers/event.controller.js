import { EventModel } from '../models/event.model.js';

// 1. Lógica efectiva para CREAR un evento nuevo
export const createEvent = async (req, res) => {
    try {
        const { title, description, date, capacity } = req.body;

        // Pasamos los datos recibidos por el molde del modelo
        const newEvent = new EventModel({ title, description, date, capacity });
        
        // Guardamos de forma asíncrona en la base de datos
        await newEvent.save();

        // Si todo sale bien, respondemos con código 201 (Creado)
        res.status(201).json({
            status: 'success',
            message: '🎉 ¡Evento creado con éxito!',
            data: newEvent
        });
    } catch (error) {
        // Si falta un dato obligatorio o hay error, lo atrapamos acá
        res.status(400).json({
            status: 'error',
            message: '❌ No se pudo crear el evento',
            error: error.message
        });
    }
}; // <--- Acá cierra perfecto createEvent

// 2. Lógica efectiva para TRAER todos los eventos
export const getEvents = async (req, res) => {
    try {
        // Usamos EventModel que es tu molde importado arriba
        const events = await EventModel.find();

        // Si todo sale bien, respondemos con código 200 (OK) y la data
        res.status(200).json({
            status: 'success',
            message: '🎉 Eventos obtenidos con éxito',
            data: events
        });
    } catch (error) {
        // Atajamos cualquier drama que pueda pasar con la base de datos
        res.status(500).json({
            status: 'error',
            message: '❌ No se pudieron obtener los eventos',
            error: error.message
        });
    }
};