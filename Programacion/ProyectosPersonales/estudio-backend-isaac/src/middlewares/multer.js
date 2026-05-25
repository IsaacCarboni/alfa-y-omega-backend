import multer from 'multer';
import path from 'path';

// 1. Definimos dónde y con qué nombre se guardan
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Asegurate de que la carpeta 'public/img' exista en la raíz de tu proyecto
        cb(null, 'src/public/img'); 
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// 2. Filtro de seguridad para que no te suban un PDF o un virus
const fileFilter = (req, file, cb) => {
    const validExtensions = ['.jpg', '.png', '.jpeg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (validExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, png, webp)'), false);
    }
};

// 3. Exportamos el uploader configurado
export const uploader = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Máximo 5 megas
});