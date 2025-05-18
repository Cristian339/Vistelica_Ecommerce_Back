import express, { Request, Response, NextFunction } from "express";
import { OrderController } from "../Controller/OrderController";
import { Auth } from "../Middleware/Auth";

const router = express.Router();
const orderController = new OrderController();
const auth = new Auth();
router.post("/orders", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.createOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.get("/orders/user/:userId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.getOrdersByUser(req, res);
    } catch (error) {
        next(error);
    }
});

router.get("/orders/:orderId/details", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.getOrderDetails(req, res);
    } catch (error) {
        next(error);
    }
});

router.put("/orders/:orderId/status", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.updateOrderStatus(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete("/orders/:orderId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.cancelOrder(req, res);
    } catch (error) {
        next(error);
    }
});

// Para obtener todos los pedidos con información del cliente
router.get("/orders", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.getAllOrdersWithClientInfo(req, res);
    } catch (error) {
        next(error);
    }
});

// Para obtener los pedidos de un usuario
router.get('/user-orders', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await orderController.getUserOrders(req, res);
    } catch (error) {
        next(error);
    }
});
export default router;