import express, { Router, Request, Response, NextFunction } from "express";
import { NotificationController } from "../Controller/NotificationController";
import { Auth } from "../Middleware/Auth";

const router: Router = express.Router();
const notificationController = new NotificationController();
const auth = new Auth();

// Obtener notificaciones no leídas de un usuario
router.get('/notifications/unread/:userId',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await notificationController.getUnreadNotifications(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Obtener notificaciones leídas de un usuario
router.get('/notifications/read/:userId',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await notificationController.getReadNotifications(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Marcar notificación como leída
router.put('/notifications/mark-as-read/:notificationId',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await notificationController.markNotificationAsRead(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Notificar nueva prenda (para administradores/vendedores)
router.post('/notifications/new-garment',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await notificationController.notifyNewGarment(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Notificar cambio de estado de pedido
router.post('/notifications/order-status-change',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await notificationController.notifyOrderStatusChange(req, res);
        } catch (error) {
            next(error);
        }
    }
);

router.post('/new-order',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await notificationController.notifyNewOrder(req, res);
        } catch (error) {
            next(error);
        }
    }
);


export default router;