import express from 'express';
import counterController from '../controllers/counterController.js';

const router = express.Router();

// Rotas públicas
router.get('/visit', counterController.registerVisit);
router.get('/booking', counterController.registerBooking);
router.get('/stats', counterController.getStats);

export default router;