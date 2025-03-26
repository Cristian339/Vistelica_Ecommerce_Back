import express, { Request, Response, NextFunction } from "express";
import { OrderController } from "../Controller/OrderController";

const router = express.Router();
const orderController = new OrderController();

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

export default router;
