import express, { Router, Request, Response, NextFunction } from "express";
import { AdminController } from "../Controller/AdminController";
import { OrderController } from "../Controller/OrderController";
import { ReviewReportController } from "../Controller/ReviewReportController";

const router: Router = express.Router();
const adminController = new AdminController();
const orderController = new OrderController();
const reviewReportController = new ReviewReportController();

router.get('/admin/orders', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.getAllOrders(req, res);
    } catch (error) {
        next(error);
    }
});
// Marcar pedido como enviado
router.post('/admin/orders/:id/shipped', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.markOrderAsShipped(req, res);
    } catch (error) {
        next(error);
    }
});

// Marcar pedido como entregado
router.post('/admin/orders/:id/delivered', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.markOrderAsDelivered(req, res);
    } catch (error) {
        next(error);
    }
});
// Usuarios baneados
router.get('/admin/banned', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getBannedUsers(req, res);
    } catch (error) {
        next(error);
    }
});

// Usuarios no baneados
router.get('/admin/unbanned', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getUnbannedUsers(req, res);
    } catch (error) {
        next(error);
    }
});

// Banear usuario
router.post('/admin/ban/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.banUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Desbanear usuario
router.post('/admin/unban/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.unbanUser(req, res);
    } catch (error) {
        next(error);
    }
});

import cors from 'cors';

// Configuración de CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

// Aplica CORS solo a rutas específicas
router.get('/admin/clients', cors(corsOptions), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getClients(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/admin/temp-ban/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.tempBanUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Listar vendedores
router.get('/admin/sellers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getSellers(req, res);
    } catch (error) {
        next(error);
    }
});
// Obtener todas las reseñas reportadas (agrupadas por reseña)
router.get('/admin/reviews/reported', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reviewReportController.getReportedReviews(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los reportes individuales (vista detallada)
router.get('/admin/reviews/reports', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reviewReportController.getAllReports(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar una reseña reportada (y todos sus reportes)
router.delete('/admin/reviews/:reviewId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reviewReportController.deleteReview(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un reporte específico (mantener la reseña)
router.delete('/admin/reports/:reportId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reviewReportController.deleteReport(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;