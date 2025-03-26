import express, {Router, Request, Response, NextFunction} from 'express';
import { ShoppingCartController } from '../Controller/ShoppingCartController';
import { ShoppingCartDetailController } from '../Controller/ShoppingCartDetailController';

const router = express.Router();
const shoppingCartDetailController = new ShoppingCartDetailController();
const shoppingCartController = new ShoppingCartController();


router.post('/order', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.createOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/order', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.getCurrentOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/order/associate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.associateOrderToUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para ShoppingCartDetail (Items del carrito)
router.post('/orderD/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.addProductToOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/orderD/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.getOrderDetails(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/orderD/items/:orderDetailId/quantity', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.updateOrderDetailQuantity(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/orderD/items/:orderDetailId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.removeProductFromOrder(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para gestión de pedidos completos
router.get('/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.getOrderById(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/orders/:orderId/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.updateOrderStatus(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.deleteOrder(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;