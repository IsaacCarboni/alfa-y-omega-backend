import { Router } from 'express';
import { getSessionProfile } from '../controllers/session.controller.js';

const router = Router();

// Ruta base inicial para sessions
router.get('/current', getSessionProfile);

export default router;