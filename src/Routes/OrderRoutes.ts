import express, { Router, Request, Response, NextFunction } from "express";
import { OrderController } from "../Controller/OrderController";
import { Auth } from "../Middleware/Auth";

const router: Router = express.Router();
const orderController = new OrderController();
const auth = new Auth();

// Crear pedido
router.post('/order/create',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await orderController.createOrder(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Obtener todos los pedidos del usuario autenticado
router.get('/order/user',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await orderController.getOrdersByUser(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Obtener los detalles de un pedido específico por ID
router.get('/order/:id',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await orderController.getOrderDetailsById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// Marcar pedido como ENVIADO
router.patch('/order/:id/ship',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await orderController.markOrderAsShipped(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Marcar pedido como ENTREGADO y registrar fecha
router.patch('/order/:id/deliver',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await orderController.markOrderAsDelivered(req, res);
        } catch (error) {
            next(error);
        }
    }
);


// Obtener IDs de productos en órdenes entregadas
router.get('/cart/delivered-products',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await orderController.getIdsDetails(req, res);
        } catch (error) {
            next(error);
        }
    }
);


export default router;
