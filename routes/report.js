import express from 'express';
import reportController from '../controllers/reportController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Rotas protegidas
router.post('/send', authMiddleware, reportController.sendReportNow);
router.get('/list', authMiddleware, reportController.getReports);
router.get('/bookings', authMiddleware, reportController.getLastBookings);
router.get('/visits', authMiddleware, reportController.getLastVisits);
router.post('/force-send', authMiddleware, reportController.forceSendReport); // 🆕 Forçar envio
router.post('/reset', authMiddleware, reportController.resetReports); // 🆕 Resetar relatórios
router.post('/send-custom', authMiddleware, reportController.sendCustomReport);

export default router;